from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AgentPlan(BaseModel):
    goal: str
    steps: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)


class AgentRequest(BaseModel):
    query: str
    session_id: str = "default"


class ToolResult(BaseModel):
    tool_name: str
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


class AgentResponse(BaseModel):
    status: str
    answer: str
    plan: AgentPlan
    tool_results: List[ToolResult] = Field(default_factory=list)
    session_id: str