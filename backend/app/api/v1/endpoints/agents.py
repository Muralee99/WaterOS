from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.api.deps import get_current_user
from app.agents import AGENT_REGISTRY, AGENT_METADATA

router = APIRouter(prefix="/agents", tags=["Agents"])


class AgentRunRequest(BaseModel):
    agent_id: str
    context: Dict[str, Any] = {}


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
async def run_agent(request: AgentRunRequest, user=Depends(get_current_user)):
    if request.agent_id not in AGENT_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")

    agent_class = AGENT_REGISTRY[request.agent_id]
    agent = agent_class()
    result = await agent.execute(request.context)
    return result.to_dict()


@router.post("/chat")
async def chat_with_agent(request: AgentChatRequest, user=Depends(get_current_user)):
    agent_id = request.agent_id if request.agent_id in AGENT_REGISTRY else "decision_agent"
    agent_class = AGENT_REGISTRY[agent_id]
    agent = agent_class()

    context = {
        "query": request.message,
        "session_id": request.session_id,
        "mode": "chat",
    }
    result = await agent.execute(context)

    return {
        "agent_id": agent_id,
        "message": request.message,
        "response": result.result,
        "reasoning_chain": result.reasoning_chain,
        "confidence": result.confidence,
        "tools_called": result.tools_called,
        "latency_ms": result.latency_ms,
    }


@router.post("/reason")
async def agent_reasoning(request: AgentReasonRequest, user=Depends(get_current_user)):
    from app.agents.decision_agent import DecisionAgent
    agent = DecisionAgent()
    result = await agent.execute({**request.context, "query": request.query})
    return result.to_dict()
