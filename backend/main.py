from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from fastapi.middleware.cors import CORSMiddleware
import os


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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Chat request model
class ChatRequest(BaseModel):
    message: str


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

    # User message save करो
    chat_history.append({
        "role": "user",
        "message": request.message
    })

    # पूरी conversation को text में बनाओ
    conversation = ""

    for item in chat_history:
        conversation += f"{item['role']}: {item['message']}\n"

    # Gemini को conversation भेजो
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=conversation
    )

    # AI response भी memory में save करो
    chat_history.append({
        "role": "assistant",
        "message": response.text
    })

    return {
        "response": response.text
    }