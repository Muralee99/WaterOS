from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.api.deps import get_current_user
from app.mcp.server import mcp_server

router = APIRouter(prefix="/mcp", tags=["MCP Server"])


class MCPToolCall(BaseModel):
    tool: str
    params: Dict[str, Any] = {}


@router.get("/tools")
async def list_mcp_tools(user=Depends(get_current_user)):
    return {"tools": mcp_server.get_tool_schemas()}


@router.post("/call")
async def call_mcp_tool(request: MCPToolCall, user=Depends(get_current_user)):
    result = await mcp_server.call_tool(request.tool, request.params)
    return result
