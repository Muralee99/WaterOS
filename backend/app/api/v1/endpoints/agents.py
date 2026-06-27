from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.api.deps import get_current_user
from app.agents import AGENT_REGISTRY, AGENT_METADATA
from app.db.base import get_db
from app.models.agent import AgentExecution, AgentMemory

router = APIRouter(prefix="/agents", tags=["Agents"])


class AgentRunRequest(BaseModel):
    agent_id: str
    context: Dict[str, Any] = {}
    session_id: Optional[str] = None


class AgentChatRequest(BaseModel):
    message: str
    agent_id: str = "decision_agent"
    session_id: Optional[str] = None


class AgentReasonRequest(BaseModel):
    query: str
    context: Dict[str, Any] = {}


@router.get("")
async def list_agents(user=Depends(get_current_user)):
    return [
        {
            "agent_id": agent_id,
            "status": "ready",
            **AGENT_METADATA.get(agent_id, {}),
            "description": AGENT_REGISTRY[agent_id]().description,
        }
        for agent_id in AGENT_REGISTRY
    ]


@router.post("/run")
async def run_agent(
    request: AgentRunRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if request.agent_id not in AGENT_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")

    # Load agent memory to enrich context
    memory_rows = await db.execute(
        select(AgentMemory)
        .where(AgentMemory.agent_id == request.agent_id)
        .order_by(AgentMemory.created_at.desc())
        .limit(3)
    )
    memories = memory_rows.scalars().all()
    enriched_context = dict(request.context)
    if memories:
        enriched_context["_memory"] = [
            {"type": m.memory_type, "content": m.content, "context": m.context}
            for m in memories
        ]

    agent_class = AGENT_REGISTRY[request.agent_id]
    agent = agent_class()
    started_at = datetime.now(timezone.utc)
    result = await agent.execute(enriched_context)
    completed_at = datetime.now(timezone.utc)

    session_id = request.session_id or str(uuid.uuid4())

    # Persist execution
    execution = AgentExecution(
        agent_id=request.agent_id,
        session_id=session_id,
        status=result.status,
        result=result.result if isinstance(result.result, dict) else {"value": str(result.result)},
        reasoning_chain=result.reasoning_chain,
        tools_called=result.tools_called,
        agents_invoked=result.agents_invoked,
        confidence=result.confidence,
        latency_ms=result.latency_ms,
        error=result.error,
        started_at=started_at,
        completed_at=completed_at,
    )
    db.add(execution)

    # Save episodic memory: store key result for future context
    if result.status == "completed" and result.result:
        scope = str(
            enriched_context.get("city")
            or enriched_context.get("state")
            or enriched_context.get("country")
            or "global"
        )
        memory = AgentMemory(
            agent_id=request.agent_id,
            memory_type="episodic",
            content=f"Last run for {scope}: {result.status}",
            context={
                "scope": scope,
                "confidence": result.confidence,
                "tools_called": result.tools_called,
                "summary": str(result.result)[:500],
            },
            importance=result.confidence or 0.5,
        )
        db.add(memory)

    await db.commit()

    return {**result.to_dict(), "execution_id": str(execution.id), "session_id": session_id}


@router.post("/chat")
async def chat_with_agent(
    request: AgentChatRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    agent_id = request.agent_id if request.agent_id in AGENT_REGISTRY else "decision_agent"
    agent_class = AGENT_REGISTRY[agent_id]
    agent = agent_class()

    context = {
        "query": request.message,
        "session_id": request.session_id,
        "mode": "chat",
    }
    started_at = datetime.now(timezone.utc)
    result = await agent.execute(context)
    completed_at = datetime.now(timezone.utc)

    session_id = request.session_id or str(uuid.uuid4())
    execution = AgentExecution(
        agent_id=agent_id,
        session_id=session_id,
        status=result.status,
        result={"response": result.result} if not isinstance(result.result, dict) else result.result,
        reasoning_chain=result.reasoning_chain,
        tools_called=result.tools_called,
        agents_invoked=result.agents_invoked,
        confidence=result.confidence,
        latency_ms=result.latency_ms,
        started_at=started_at,
        completed_at=completed_at,
    )
    db.add(execution)
    await db.commit()

    return {
        "agent_id": agent_id,
        "message": request.message,
        "response": result.result,
        "reasoning_chain": result.reasoning_chain,
        "confidence": result.confidence,
        "tools_called": result.tools_called,
        "latency_ms": result.latency_ms,
        "session_id": session_id,
        "execution_id": str(execution.id),
    }


@router.post("/reason")
async def agent_reasoning(request: AgentReasonRequest, user=Depends(get_current_user)):
    from app.agents.decision_agent import DecisionAgent
    agent = DecisionAgent()
    result = await agent.execute({**request.context, "query": request.query})
    return result.to_dict()


@router.get("/sessions")
async def list_sessions(
    limit: int = 50,
    agent_id: Optional[str] = None,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(AgentExecution).order_by(AgentExecution.started_at.desc()).limit(limit)
    if agent_id:
        q = q.where(AgentExecution.agent_id == agent_id)
    rows = await db.execute(q)
    executions = rows.scalars().all()
    return [
        {
            "id": str(e.id),
            "agent_id": e.agent_id,
            "agent_name": AGENT_METADATA.get(e.agent_id, {}).get("name", e.agent_id),
            "session_id": e.session_id,
            "status": e.status,
            "confidence": e.confidence,
            "latency_ms": e.latency_ms,
            "tools_called": e.tools_called or [],
            "agents_invoked": e.agents_invoked or [],
            "reasoning_chain": e.reasoning_chain or [],
            "result": e.result,
            "error": e.error,
            "started_at": e.started_at.isoformat() if e.started_at else None,
            "completed_at": e.completed_at.isoformat() if e.completed_at else None,
        }
        for e in executions
    ]


@router.delete("/sessions")
async def clear_sessions(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(text("DELETE FROM agent_execution"))
    await db.execute(text("DELETE FROM agent_memory"))
    await db.commit()
    return {"cleared": True}


@router.get("/memory/{agent_id}")
async def get_agent_memory(
    agent_id: str,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.execute(
        select(AgentMemory)
        .where(AgentMemory.agent_id == agent_id)
        .order_by(AgentMemory.created_at.desc())
        .limit(10)
    )
    memories = rows.scalars().all()
    return [
        {
            "id": str(m.id),
            "agent_id": m.agent_id,
            "memory_type": m.memory_type,
            "content": m.content,
            "context": m.context,
            "importance": m.importance,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in memories
    ]


@router.get("/observability")
async def get_observability(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Aggregate stats
    total_result = await db.execute(select(func.count()).select_from(AgentExecution))
    total_runs = total_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count()).select_from(AgentExecution).where(AgentExecution.status == "completed")
    )
    completed_runs = completed_result.scalar() or 0

    avg_result = await db.execute(
        select(func.avg(AgentExecution.latency_ms))
        .select_from(AgentExecution)
        .where(AgentExecution.status == "completed")
    )
    avg_latency = round(avg_result.scalar() or 0)

    avg_conf_result = await db.execute(
        select(func.avg(AgentExecution.confidence))
        .select_from(AgentExecution)
        .where(AgentExecution.status == "completed")
    )
    avg_confidence = round((avg_conf_result.scalar() or 0), 3)

    # Per-agent stats
    per_agent_result = await db.execute(
        select(
            AgentExecution.agent_id,
            func.count().label("runs"),
            func.avg(AgentExecution.latency_ms).label("avg_latency"),
            func.avg(AgentExecution.confidence).label("avg_confidence"),
        )
        .group_by(AgentExecution.agent_id)
        .order_by(func.count().desc())
    )
    per_agent = [
        {
            "agent_id": row.agent_id,
            "agent_name": AGENT_METADATA.get(row.agent_id, {}).get("name", row.agent_id),
            "runs": row.runs,
            "avg_latency_ms": round(row.avg_latency or 0),
            "avg_confidence": round(row.avg_confidence or 0, 3),
        }
        for row in per_agent_result.all()
    ]

    # Recent 10 executions for timeline
    recent_result = await db.execute(
        select(AgentExecution).order_by(AgentExecution.started_at.desc()).limit(10)
    )
    recent = recent_result.scalars().all()
    timeline = [
        {
            "id": str(e.id),
            "agent_id": e.agent_id,
            "agent_name": AGENT_METADATA.get(e.agent_id, {}).get("name", e.agent_id),
            "status": e.status,
            "latency_ms": e.latency_ms,
            "confidence": e.confidence,
            "tools_called": e.tools_called or [],
            "started_at": e.started_at.isoformat() if e.started_at else None,
        }
        for e in recent
    ]

    return {
        "total_runs": total_runs,
        "completed_runs": completed_runs,
        "failed_runs": total_runs - completed_runs,
        "success_rate": round(completed_runs / total_runs * 100, 1) if total_runs else 0,
        "avg_latency_ms": avg_latency,
        "avg_confidence": avg_confidence,
        "per_agent": per_agent,
        "timeline": timeline,
    }
