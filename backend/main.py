from fastapi import FastAPI, UploadFile, File, HTTPException
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
