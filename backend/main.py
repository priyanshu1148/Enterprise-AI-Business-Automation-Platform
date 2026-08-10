from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from fastapi.middleware.cors import CORSMiddleware
import psycopg
import os
from psycopg.types.json import Jsonb
# Load .env
load_dotenv()

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
       # Add document to vector database
@app.post("/add-document")
def add_document(request: DocumentRequest):
    try:
        # Create embedding
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=request.content
        )

        embedding = result.embeddings[0].values

        # Convert embedding to pgvector format
        embedding_string = "[" + ",".join(map(str, embedding)) + "]"

        # Insert into Neon PostgreSQL
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO documents (content, metadata, embedding)
                    VALUES (%s, %s, %s::vector)
                    RETURNING id;
                    """,
                    (
                        request.content,
                        Jsonb(request.metadata),
                        embedding_string
                    )
                )

                document_id = cur.fetchone()[0]

            conn.commit()

        return {
            "status": "success",
            "message": "Document inserted successfully",
            "document_id": document_id,
            "dimensions": len(embedding)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
        # Vector similarity search
@app.post("/search")
def search(request: SearchRequest):
    try:
        # Create embedding for user query
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=request.query
        )

        query_embedding = result.embeddings[0].values

        # Convert to pgvector format
        embedding_string = "[" + ",".join(map(str, query_embedding)) + "]"

        # Search similar documents
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
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
                    LIMIT %s;
                    """,
                    (
                        embedding_string,
                        embedding_string,
                        request.limit
                    )
                )

                rows = cur.fetchall()

        results = []

        for row in rows:
            results.append({
                "id": row[0],
                "content": row[1],
                "metadata": row[2],
                "distance": float(row[3])
            })

        return {
            "status": "success",
            "query": request.query,
            "results": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
        # RAG Chat
@app.post("/rag-chat")
def rag_chat(request: SearchRequest):
    try:
        # Create embedding for user's question
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=request.query
        )

        query_embedding = result.embeddings[0].values

        # Convert embedding to pgvector format
        embedding_string = "[" + ",".join(map(str, query_embedding)) + "]"

        # Find relevant documents
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
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

        if not rows:
            return {
                "status": "success",
                "answer": "I could not find any relevant information.",
                "sources": []
            }

        # Build context
        context = ""
        sources = []

        for row in rows:
            context += f"Document {row[0]}:\n{row[1]}\n\n"

            sources.append({
                "id": row[0],
                "metadata": row[2],
                "distance": float(row[3])
            })

        # Ask Gemini using retrieved context
        prompt = f"""
You are an AI assistant for the Enterprise AI Business Automation Platform.

Answer the user's question using ONLY the information provided in the context below.

If the answer is not present in the context, say:
"I don't have enough information in the provided documents."

Context:
{context}

User question:
{request.query}
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return {
            "status": "success",
            "answer": response.text,
            "sources": sources
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }