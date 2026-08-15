from fastapi import FastAPI, HTTPException, UploadFile, File
from pypdf import PdfReader
from docx import Document as DocxDocument
import io
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
from google import genai
from fastapi.middleware.cors import CORSMiddleware
import psycopg
import os
from psycopg.types.json import Jsonb

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Agent imports MUST come after .env is loaded
from backend.agent.engine import agent_engine
from backend.agent.schemas import AgentRequest
# Gemini API Key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env")


# Gemini Client
client = genai.Client(api_key=api_key)


# FastAPI
app = FastAPI(
    title="Enterprise AI Business Automation Platform",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://enterprise-ai-business-automation-p-gamma.vercel.app",
        "https://enterprise-ai-business-automation-p.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Chat request model
class ChatRequest(BaseModel):
    message: str


class DocumentRequest(BaseModel):
    content: str
    metadata: dict = {}


class SearchRequest(BaseModel):
    query: str
    limit: int = 3


class RagChatRequest(BaseModel):
    query: str
    session_id: str = "default"


# Home
@app.get("/")
def home():
    return {
        "message": "Enterprise AI Business Automation Platform is Running"
    }


# Test AI
@app.get("/test-ai")
def test_ai():
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Say hello to Priyanshu."
    )

    return {
        "response": response.text
    }


# Chat memory
chat_history = []


# Chat API
@app.post("/chat")
def chat(request: ChatRequest):

    chat_history.append({
        "role": "user",
        "message": request.message
    })

    conversation = ""

    for item in chat_history:
        conversation += f"{item['role']}: {item['message']}\n"

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=conversation
    )

    chat_history.append({
        "role": "assistant",
        "message": response.text
    })

    return {
        "response": response.text
    }


# Database test
@app.get("/db-test")
def db_test():
    try:
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                result = cur.fetchone()

        return {
            "status": "connected",
            "database": "Neon PostgreSQL",
            "result": result[0]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
# Embedding test

@app.get("/embedding-test")
def embedding_test():
    try:
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents="Enterprise AI Business Automation Platform"
        )

        embedding = result.embeddings[0].values

        return {
            "status": "success",
            "model": "gemini-embedding-2",
            "dimensions": len(embedding),
            "preview": embedding[:5]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# Upload PDF / TXT / DOCX document
# Upload PDF / TXT / DOCX document
# -----------------------------------
# Get all documents
# -----------------------------------

@app.get("/documents")
def get_documents():
    try:
        database_url = os.getenv("DATABASE_URL")

        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        id,
                        content,
                        metadata
                    FROM documents
                    ORDER BY id DESC;
                    """
                )

                rows = cur.fetchall()

        documents = []

        for row in rows:
            documents.append({
                "id": row[0],
                "content": row[1],
                "metadata": row[2],
            })

        return {
            "status": "success",
            "documents": documents,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


# -----------------------------------
# Upload PDF / TXT / DOCX document
# -----------------------------------
# -----------------------------------
# Get all documents
# -----------------------------------

@app.get("/documents")
def get_documents():
    try:
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT id, content, metadata
                    FROM documents
                    ORDER BY id DESC;
                    """
                )

                rows = cur.fetchall()

        documents = []

        for row in rows:
            document_id, content, metadata = row

            documents.append({
                "id": document_id,
                "content": content,
                "metadata": metadata or {}
            })

        return {
            "status": "success",
            "documents": documents,
            "count": len(documents)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="File name is required"
            )

        filename = file.filename
        extension = Path(filename).suffix.lower()

        allowed_extensions = [".pdf", ".txt", ".docx"]

        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Only PDF, TXT and DOCX files are supported"
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        # -----------------------------------
        # Extract text
        # -----------------------------------

        if extension == ".txt":
            content = file_bytes.decode("utf-8", errors="ignore")

        elif extension == ".pdf":
            pdf = PdfReader(io.BytesIO(file_bytes))

            pages = []

            for page in pdf.pages:
                text = page.extract_text() or ""
                pages.append(text)

            content = "\n\n".join(pages)

        elif extension == ".docx":
            document = DocxDocument(io.BytesIO(file_bytes))

            paragraphs = []

            for paragraph in document.paragraphs:
                text = paragraph.text.strip()

                if text:
                    paragraphs.append(text)

            content = "\n\n".join(paragraphs)

        # -----------------------------------
        # Validate extracted text
        # -----------------------------------

        content = content.strip()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the uploaded file"
            )

        # -----------------------------------
        # Check for duplicate document
        # -----------------------------------

        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT id, metadata
                    FROM documents
                    WHERE content = %s
                    LIMIT 1;
                    """,
                    (content,)
                )

                existing_document = cur.fetchone()

        if existing_document:
            return {
                "status": "duplicate",
                "message": "This document already exists in the knowledge base.",
                "document_id": existing_document[0],
                "metadata": existing_document[1],
            }

        # -----------------------------------
        # Create embedding
        # -----------------------------------

        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=content
        )

        embedding = result.embeddings[0].values

        # -----------------------------------
        # Convert embedding to pgvector format
        # -----------------------------------

        embedding_string = (
            "[" + ",".join(map(str, embedding)) + "]"
        )

        # -----------------------------------
        # Save to Neon PostgreSQL
        # -----------------------------------

        metadata = {
            "source": filename,
            "category": "uploaded-document",
            "file_type": extension.replace(".", "").upper(),
        }

        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO documents
                    (content, metadata, embedding)
                    VALUES (%s, %s, %s::vector)
                    RETURNING id;
                    """,
                    (
                        content,
                        Jsonb(metadata),
                        embedding_string,
                    )
                )

                document_id = cur.fetchone()[0]

            conn.commit()

        return {
            "status": "success",
            "message": "Document uploaded successfully",
            "document_id": document_id,
            "filename": filename,
            "file_type": extension.replace(".", "").upper(),
            "characters": len(content),
            "dimensions": len(embedding),
        }

    except HTTPException:
        raise

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }
# -----------------------------------
# Update document
# -----------------------------------

@app.put("/documents/{document_id}")
def update_document(document_id: int, request: dict):
    try:
        content = request.get("content", "").strip()
        metadata = request.get("metadata", {})

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Document content is required"
            )

        # Create new embedding
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=content
        )

        embedding = result.embeddings[0].values

        embedding_string = (
            "[" + ",".join(map(str, embedding)) + "]"
        )

        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    UPDATE documents
                    SET content = %s,
                        metadata = %s,
                        embedding = %s::vector
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (
                        content,
                        Jsonb(metadata),
                        embedding_string,
                        document_id,
                    )
                )

                updated = cur.fetchone()

            conn.commit()

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )

        return {
            "status": "success",
            "message": "Document updated successfully",
            "document_id": document_id,
        }

    except HTTPException:
        raise

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


# -----------------------------------
# Delete document
# -----------------------------------

@app.delete("/documents/{document_id}")
def delete_document(document_id: int):
    try:
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    DELETE FROM documents
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (document_id,)
                )

                deleted = cur.fetchone()

            conn.commit()

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )

        return {
            "status": "success",
            "message": "Document deleted successfully",
            "document_id": document_id,
        }

    except HTTPException:
        raise

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }
# -----------------------------------
# RAG Chat
# -----------------------------------

@app.post("/rag-chat")
def rag_chat(request: RagChatRequest):
    try:
        database_url = os.getenv("DATABASE_URL")

        # -----------------------------------
        # 1. Save user message
        # -----------------------------------

        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO chat_messages
                    (session_id, role, message)
                    VALUES (%s, %s, %s);
                    """,
                    (
                        request.session_id,
                        "user",
                        request.query
                    )
                )

                # -----------------------------------
                # 2. Get previous conversation
                # -----------------------------------

                cur.execute(
                    """
                    SELECT role, message
                    FROM chat_messages
                    WHERE session_id = %s
                    ORDER BY created_at ASC
                    LIMIT 20;
                    """,
                    (request.session_id,)
                )

                history_rows = cur.fetchall()

            conn.commit()

        # -----------------------------------
        # 3. Create embedding
        # -----------------------------------

        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=request.query
        )

        query_embedding = result.embeddings[0].values

        embedding_string = (
            "[" + ",".join(map(str, query_embedding)) + "]"
        )

        # -----------------------------------
        # 4. Search relevant documents
        # -----------------------------------

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
                    LIMIT 3;
                    """,
                    (
                        embedding_string,
                        embedding_string
                    )
                )

                rows = cur.fetchall()

        # -----------------------------------
        # 5. Build RAG context
        # -----------------------------------

        context = ""
        sources = []

        for row in rows:

            context += (
                f"Document {row[0]}:\n"
                f"{row[1]}\n\n"
            )

            sources.append({
                "id": row[0],
                "metadata": row[2],
                "distance": float(row[3])
            })

        # -----------------------------------
        # 6. Build conversation history
        # -----------------------------------

        conversation_history = ""

        for role, message in history_rows:
            conversation_history += (
                f"{role}: {message}\n"
            )

        # -----------------------------------
        # 7. Send memory + RAG context to Gemini
        # -----------------------------------

        prompt = f"""
You are an AI assistant for the Enterprise AI Business Automation Platform.

Use the provided documents and conversation history to answer the user's question.

Rules:

- Use the documents as the primary source of business knowledge.
- Use conversation history to understand previous messages.
- If the documents do not contain enough information, say:
  "I don't have enough information in the provided documents."
- Do not invent company-specific information.
- Be clear and helpful.

Conversation history:
{conversation_history}

Relevant documents:
{context}

Current user question:
{request.query}
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        answer = response.text

        # -----------------------------------
        # 8. Save AI response
        # -----------------------------------

        with psycopg.connect(database_url) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO chat_messages
                    (session_id, role, message)
                    VALUES (%s, %s, %s);
                    """,
                    (
                        request.session_id,
                        "assistant",
                        answer
                    )
                )

            conn.commit()

        # -----------------------------------
        # 9. Return response
        # -----------------------------------

        return {
            "status": "success",
            "answer": answer,
            "sources": sources,
            "session_id": request.session_id
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
# -----------------------------------
# Add document manually
# -----------------------------------

@app.post("/add-document")
def add_document(request: dict):
    try:
        content = request.get("content", "").strip()
        metadata = request.get("metadata", {})

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Document content is required"
            )

        # Check duplicate document
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT id, metadata
                    FROM documents
                    WHERE content = %s
                    LIMIT 1;
                    """,
                    (content,)
                )

                existing_document = cur.fetchone()

        if existing_document:
            return {
                "status": "duplicate",
                "message": "This document already exists in the knowledge base.",
                "document_id": existing_document[0],
                "metadata": existing_document[1],
            }

        # Create embedding
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=content
        )

        embedding = result.embeddings[0].values

        # Convert embedding to pgvector format
        embedding_string = (
            "[" + ",".join(map(str, embedding)) + "]"
        )

        # Default metadata
        if not metadata:
            metadata = {
                "source": "website",
                "category": "knowledge-base"
            }

        # Save document to Neon PostgreSQL
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO documents
                    (content, metadata, embedding)
                    VALUES (%s, %s, %s::vector)
                    RETURNING id;
                    """,
                    (
                        content,
                        Jsonb(metadata),
                        embedding_string,
                    )
                )

                document_id = cur.fetchone()[0]

            conn.commit()

        return {
            "status": "success",
            "message": "Document added successfully",
            "document_id": document_id,
            "characters": len(content),
            "dimensions": len(embedding),
        }

    except HTTPException:
        raise

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# -----------------------------------

# Update document

# -----------------------------------

@app.put("/documents/{document_id}")
# -----------------------------------
# Update document
# -----------------------------------

@app.put("/documents/{document_id}")
def update_document(document_id: int, request: dict):
    try:
        content = request.get("content", "").strip()
        metadata = request.get("metadata", {})

        if not content:
            return {
                "status": "error",
                "message": "Document content is required"
            }

        # Create new embedding for updated content
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=content
        )

        embedding = result.embeddings[0].values

        embedding_string = (
            "[" + ",".join(map(str, embedding)) + "]"
        )

        # Update document in Neon PostgreSQL
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    UPDATE documents
                    SET content = %s,
                        metadata = %s,
                        embedding = %s::vector
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (
                        content,
                        Jsonb(metadata),
                        embedding_string,
                        document_id
                    )
                )

                updated = cur.fetchone()

            conn.commit()

        if not updated:
            return {
                "status": "error",
                "message": "Document not found"
            }

        return {
            "status": "success",
            "message": "Document updated successfully",
            "document_id": document_id
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# -----------------------------------
# Delete document
# -----------------------------------

@app.delete("/documents/{document_id}")
def delete_document(document_id: int):
    try:
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    DELETE FROM documents
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (document_id,)
                )

                deleted = cur.fetchone()

            conn.commit()

        if not deleted:
            return {
                "status": "error",
                "message": "Document not found"
            }

        return {
            "status": "success",
            "message": "Document deleted successfully",
            "document_id": document_id
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
# -----------------------------------
# AI Agent API
# -----------------------------------

@app.post("/agent")
def run_agent(request: AgentRequest):

    try:
        result = agent_engine.run(request)

        return result.model_dump()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "session_id": request.session_id
        }
# -----------------------------------
# AI AGENT
# -----------------------------------

@app.post("/agent/run")
def run_agent(request: AgentRequest):
    try:
        result = agent_engine.run(request)

        return result.model_dump()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }