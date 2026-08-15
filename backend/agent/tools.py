from typing import Any, Callable, Dict
import os
import psycopg
from google import genai


# ==========================================
# Tool
# ==========================================

class Tool:
    def __init__(
        self,
        name: str,
        description: str,
        function: Callable[..., Any],
    ):
        self.name = name
        self.description = description
        self.function = function

    def execute(self, **kwargs):
        return self.function(**kwargs)


# ==========================================
# Tool Registry
# ==========================================

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}

    def register(self, tool: Tool):
        self.tools[tool.name] = tool

    def get(self, name: str):
        return self.tools.get(name)

    def list_tools(self):
        return [
            {
                "name": tool.name,
                "description": tool.description,
            }
            for tool in self.tools.values()
        ]

    def execute(self, name: str, **kwargs):
        tool = self.get(name)

        if not tool:
            raise ValueError(f"Tool not found: {name}")

        return tool.execute(**kwargs)


# Global registry
tool_registry = ToolRegistry()


# ==========================================
# Gemini Client
# ==========================================

agent_gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==========================================
# Tool 1 — Knowledge Search
# ==========================================

def search_knowledge(query: str):
    """
    Search enterprise knowledge base using
    Gemini embeddings + PostgreSQL pgvector.
    """

    if not query or not query.strip():
        return {
            "success": False,
            "message": "Search query is required",
            "results": []
        }

    result = agent_gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=query
    )

    query_embedding = result.embeddings[0].values

    embedding_string = (
        "[" + ",".join(map(str, query_embedding)) + "]"
    )

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    id,
                    content,
                    metadata,
                    embedding <=> %s::vector AS distance
                FROM documents
                ORDER BY embedding <=> %s::vector
                LIMIT 5;
                """,
                (
                    embedding_string,
                    embedding_string
                )
            )

            rows = cur.fetchall()

    RELEVANCE_THRESHOLD = 0.40

    results = []

    for row in rows:

        distance = float(row[3])

        if distance <= RELEVANCE_THRESHOLD:

            results.append({
                "id": row[0],
                "content": row[1],
                "metadata": row[2] or {},
                "distance": distance
            })

    return {
        "success": True,
        "query": query,
        "count": len(results),
        "results": results
    }


tool_registry.register(
    Tool(
        name="search_knowledge",
        description=(
            "Search the enterprise knowledge base using "
            "semantic vector search. Use this tool when "
            "the user asks about information stored in "
            "company documents or the knowledge base."
        ),
        function=search_knowledge
    )
)


# ==========================================
# Tool 2 — Platform Information
# ==========================================

def get_platform_info(query: str = ""):
    """
    Return structured information about the platform.
    """

    return {
        "success": True,
        "platform": "Enterprise AI Business Automation Platform",
        "purpose": (
            "Help businesses automate repetitive tasks "
            "using artificial intelligence."
        ),
        "capabilities": [
            "AI-powered business automation",
            "Knowledge base search",
            "Document processing",
            "RAG-based question answering",
            "AI agent tool execution"
        ]
    }


tool_registry.register(
    Tool(
        name="get_platform_info",
        description=(
            "Get structured information about the "
            "Enterprise AI Business Automation Platform, "
            "including its purpose and capabilities."
        ),
        function=get_platform_info
    )
)


# ==========================================
# Tool 3 — Create Task
# ==========================================

def create_task(query: str):
    """
    Create and persist a business task
    in Neon PostgreSQL.
    """

    if not query or not query.strip():
        return {
            "success": False,
            "message": "Task description is required"
        }

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    title = query.strip()

    with psycopg.connect(database_url) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO tasks (title, status)
                VALUES (%s, %s)
                RETURNING id, title, status, created_at;
                """,
                (
                    title,
                    "created"
                )
            )

            row = cur.fetchone()

        conn.commit()

    return {
        "success": True,
        "task": {
            "id": row[0],
            "title": row[1],
            "status": row[2],
            "created_at": row[3]
        },
        "message": "Task created successfully"
    }


tool_registry.register(
    Tool(
        name="create_task",
        description=(
            "Create a business task and save it "
            "permanently in the task database. "
            "Use this tool when the user wants to "
            "create, add, or record a task."
        ),
        function=create_task
    )
)


# ==========================================
# Tool 4 — List Tasks
# ==========================================

def list_tasks(query: str = ""):
    """
    Return persisted business tasks
    from Neon PostgreSQL.
    """

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    with psycopg.connect(database_url) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    id,
                    title,
                    status,
                    created_at
                FROM tasks
                ORDER BY created_at DESC;
                """
            )

            rows = cur.fetchall()

    tasks = []

    for row in rows:

        tasks.append({
            "id": row[0],
            "title": row[1],
            "status": row[2],
            "created_at": row[3]
        })

    return {
        "success": True,
        "tasks": tasks,
        "count": len(tasks),
        "message": (
            "Tasks retrieved successfully"
            if tasks
            else "No tasks are currently stored."
        )
    }


tool_registry.register(
    Tool(
        name="list_tasks",
        description=(
            "List existing business tasks from the "
            "task database. Use this tool when the "
            "user wants to see, check, or list tasks."
        ),
        function=list_tasks
    )
)


# ==========================================
# Tool 5 — Update Task
# ==========================================

def update_task(query: str):
    """
    Update the status of an existing business task.
    """

    if not query or not query.strip():
        return {
            "success": False,
            "message": "Task update request is required"
        }

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    text = query.strip().lower()

    # Detect new status
    if "completed" in text or "complete" in text or "done" in text:
        new_status = "completed"

    elif "cancelled" in text or "canceled" in text:
        new_status = "cancelled"

    elif "pending" in text:
        new_status = "pending"

    else:
        new_status = "updated"

    # Detect task ID
    task_id = None

    for word in text.split():

        cleaned = word.strip("#.,!?")

        if cleaned.isdigit():
            task_id = int(cleaned)
            break

    if task_id is None:
        return {
            "success": False,
            "message": "Task ID is required"
        }

    with psycopg.connect(database_url) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE tasks
                SET status = %s
                WHERE id = %s
                RETURNING id, title, status, created_at;
                """,
                (
                    new_status,
                    task_id
                )
            )

            row = cur.fetchone()

        conn.commit()

    if not row:
        return {
            "success": False,
            "message": f"Task with ID {task_id} was not found"
        }

    return {
        "success": True,
        "task": {
            "id": row[0],
            "title": row[1],
            "status": row[2],
            "created_at": row[3]
        },
        "message": "Task updated successfully"
    }


tool_registry.register(
    Tool(
        name="update_task",
        description=(
            "Update the status of an existing business task. "
            "Use this tool when the user wants to complete, "
            "cancel, or change the status of a task."
        ),
        function=update_task
    )
)

# ==========================================
# Tool 5 — Delete Task
# ==========================================

def delete_task(query: str):
    """
    Permanently delete a business task from PostgreSQL.
    """

    if not query or not query.strip():
        return {
            "success": False,
            "message": "Task ID is required"
        }

    # Extract task ID from the user's query
    import re

    match = re.search(
        r"\btask\s*#?\s*(\d+)\b",
        query,
        re.IGNORECASE
    )

    if not match:
        match = re.search(
            r"\b(\d+)\b",
            query
        )

    if not match:
        return {
            "success": False,
            "message": "Could not determine task ID"
        }

    task_id = int(match.group(1))

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    with psycopg.connect(database_url) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM tasks
                WHERE id = %s
                RETURNING id, title, status, created_at;
                """,
                (task_id,)
            )

            row = cur.fetchone()

        conn.commit()

    if not row:
        return {
            "success": False,
            "message": f"Task {task_id} not found"
        }

    return {
        "success": True,
        "task": {
            "id": row[0],
            "title": row[1],
            "status": row[2],
            "created_at": row[3]
        },
        "message": "Task deleted successfully"
    }


tool_registry.register(
    Tool(
        name="delete_task",
        description=(
            "Permanently delete an existing business task "
            "from the PostgreSQL task database. "
            "Use this tool only when the user explicitly "
            "asks to delete, remove, erase, or permanently "
            "delete a task."
        ),
        function=delete_task
    )
)