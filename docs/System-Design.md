# Enterprise AI Business Automation Platform

## High Level System Design

User
│
▼
Frontend (React / Next.js)
│
▼
FastAPI Backend
│
├──────────────┐
│              │
▼              ▼
AI Engine      PostgreSQL
│              │
│              ▼
│          Business Data
│
▼
Gemini
OpenAI
Claude

│
▼
Automation Engine (n8n)

│
├──────── Gmail
├──────── Google Sheets
├──────── WhatsApp
├──────── Google Calendar
└──────── Apollo API

│
▼
AI Agents

│
▼
RAG Knowledge Base

│
▼
Dashboard