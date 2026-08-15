import json
import os
import psycopg
from typing import Any

from google import genai

from .tools import tool_registry


# ==========================================
# Agent Plan
# ==========================================

class AgentPlan:
    def __init__(
        self,
        goal: str,
        steps: list[str],
        tools: list[str]
    ):
        self.goal = goal
        self.steps = steps
        self.tools = tools

    def model_dump(self):
        return {
            "goal": self.goal,
            "steps": self.steps,
            "tools": self.tools
        }


# ==========================================
# Tool Result
# ==========================================

class ToolResult:
    def __init__(
        self,
        tool_name: str,
        success: bool,
        data: Any = None,
        error: str | None = None
    ):
        self.tool_name = tool_name
        self.success = success
        self.data = data
        self.error = error

    def model_dump(self):
        return {
            "tool_name": self.tool_name,
            "success": self.success,
            "data": self.data,
            "error": self.error
        }


# ==========================================
# Agent Request
# ==========================================

class AgentRequest:
    def __init__(
        self,
        query: str,
        session_id: str = "default"
    ):
        self.query = query
        self.session_id = session_id


# ==========================================
# Agent Response
# ==========================================

class AgentResponse:
    def __init__(
        self,
        status: str,
        answer: str,
        plan: AgentPlan,
        tool_results: list[ToolResult],
        session_id: str
    ):
        self.status = status
        self.answer = answer
        self.plan = plan
        self.tool_results = tool_results
        self.session_id = session_id

    def model_dump(self):
        return {
            "status": self.status,
            "answer": self.answer,
            "plan": self.plan.model_dump(),
            "tool_results": [
                result.model_dump()
                for result in self.tool_results
            ],
            "session_id": self.session_id
        }


# ==========================================
# Agent Engine
# ==========================================

class AgentEngine:

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set in .env"
            )

        self.client = genai.Client(
            api_key=api_key
        )

    # ======================================
    # Available Tools
    # ======================================

    def get_tools_description(self) -> str:

        tools = tool_registry.list_tools()

        if not tools:
            return "No tools are currently registered."

        return json.dumps(
            tools,
            indent=2
        )

    # ======================================
    # Conversation History
    # ======================================

    def get_conversation_history(
        self,
        session_id: str,
        limit: int = 20
    ) -> str:

        database_url = os.getenv("DATABASE_URL")

        if not database_url:
            return "No conversation memory available."

        try:

            with psycopg.connect(
                database_url
            ) as conn:

                with conn.cursor() as cur:

                    cur.execute(
                        """
                        SELECT role, message
                        FROM chat_messages
                        WHERE session_id = %s
                        ORDER BY created_at ASC
                        LIMIT %s;
                        """,
                        (
                            session_id,
                            limit
                        )
                    )

                    rows = cur.fetchall()

            if not rows:
                return "No previous conversation."

            history = []

            for role, message in rows:

                history.append(
                    f"{role}: {message}"
                )

            return "\n".join(history)

        except Exception:

            return "No conversation memory available."

    # ======================================
    # Create Agent Plan
    # ======================================

    def create_plan(
        self,
        query: str
    ) -> AgentPlan:

        prompt = f"""
You are the planning brain of an Enterprise AI
Business Automation Agent.

Your job is to understand the user's request
and select the correct available tool.

AVAILABLE TOOLS:
{self.get_tools_description()}

USER REQUEST:
{query}

IMPORTANT TOOL SELECTION RULES:

1. If the user asks to CREATE, ADD, MAKE, or RECORD
   a task, select:
   create_task

2. If the user asks to LIST, SHOW, VIEW, CHECK,
   or GET existing tasks, select:
   list_tasks

3. If the user asks to COMPLETE, CANCEL, ARCHIVE,
   or CHANGE THE STATUS of a task, select:
   update_task

4. If the user asks to DELETE, REMOVE, ERASE,
   or PERMANENTLY DELETE a task, select:
   delete_task

5. DELETE and CANCEL are NOT the same operation.

6. If the user explicitly says DELETE or REMOVE,
   NEVER select update_task.

7. Only select tools that actually appear in
   AVAILABLE TOOLS.

8. Never invent a tool.

9. If no tool is required, return an empty tools list.

Return ONLY valid JSON in this exact structure:

{{
    "goal": "short description of the goal",
    "steps": [
        "step 1",
        "step 2"
    ],
    "tools": [
        "tool_name"
    ]
}}
"""

        response = self.client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        text = response.text.strip()

        if text.startswith("```"):

            text = text.replace(
                "```json",
                ""
            )

            text = text.replace(
                "```",
                ""
            )

            text = text.strip()

        try:

            plan_data = json.loads(text)

            selected_tools = plan_data.get(
                "tools",
                []
            )

            available_tool_names = {
                tool["name"]
                for tool in tool_registry.list_tools()
            }

            selected_tools = [
                tool_name
                for tool_name in selected_tools
                if tool_name in available_tool_names
            ]

            return AgentPlan(
                goal=plan_data.get(
                    "goal",
                    query
                ),
                steps=plan_data.get(
                    "steps",
                    []
                ),
                tools=selected_tools
            )

        except Exception:

            return AgentPlan(
                goal=query,
                steps=[
                    "Understand the user's request",
                    "Generate the best response"
                ],
                tools=[]
            )

    # ======================================
    # Execute Tools
    # ======================================

    def execute_tools(
        self,
        plan: AgentPlan,
        query: str
    ) -> list[ToolResult]:

        results = []

        for tool_name in plan.tools:

            tool = tool_registry.get(
                tool_name
            )

            if not tool:

                results.append(
                    ToolResult(
                        tool_name=tool_name,
                        success=False,
                        error=(
                            f"Tool '{tool_name}' "
                            "is not registered."
                        )
                    )
                )

                continue

            try:

                result = tool.execute(
                    query=query
                )

                results.append(
                    ToolResult(
                        tool_name=tool_name,
                        success=True,
                        data=result
                    )
                )

            except Exception as e:

                results.append(
                    ToolResult(
                        tool_name=tool_name,
                        success=False,
                        error=str(e)
                    )
                )

        return results

    # ======================================
    # Generate Final Answer
    # ======================================

    def generate_final_answer(
        self,
        query: str,
        plan: AgentPlan,
        tool_results: list[ToolResult],
        session_id: str
    ) -> str:

        results_text = json.dumps(
            [
                result.model_dump()
                for result in tool_results
            ],
            indent=2,
            default=str
        )

        history = self.get_conversation_history(
            session_id
        )

        prompt = f"""
You are the final response engine of an
Enterprise AI Business Automation Agent.

USER REQUEST:
{query}

AGENT GOAL:
{plan.goal}

AGENT STEPS:
{plan.steps}

CONVERSATION HISTORY:
{history}

TOOL RESULTS:
{results_text}

Rules:

- Answer the user's actual request.
- Use tool results when available.
- Do not invent business-specific information.
- If the tool successfully deleted a task,
  clearly confirm that the task was permanently deleted.
- If the tool successfully created a task,
  confirm its creation.
- If the tool successfully updated a task,
  explain the new status.
- If the tool failed, clearly explain the failure.
- Do not say that deletion is unsupported if
  delete_task successfully executed.
- Be concise and useful.
- Never expose internal reasoning.
"""

        response = self.client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text.strip()

    # ======================================
    # Main Agent Run
    # ======================================

    def run(
        self,
        request: AgentRequest
    ) -> AgentResponse:

        plan = self.create_plan(
            request.query
        )

        tool_results = self.execute_tools(
            plan,
            request.query
        )

        answer = self.generate_final_answer(
            request.query,
            plan,
            tool_results,
            request.session_id
        )

        return AgentResponse(
            status="success",
            answer=answer,
            plan=plan,
            tool_results=tool_results,
            session_id=request.session_id
        )


# ==========================================
# Global Agent Engine
# ==========================================

agent_engine = AgentEngine()