\# Enterprise AI Business Automation Platform



An AI-powered business automation platform designed to combine AI, document knowledge, RAG-based chat, database storage, and business automation into one system.



\## 🚀 Features



\- AI-powered business assistant

\- RAG (Retrieval-Augmented Generation) chat

\- Knowledge Base management

\- Add documents manually

\- Upload PDF, TXT and DOCX documents

\- Edit documents

\- Delete documents

\- Automatic document embeddings

\- Vector search using PostgreSQL + pgvector

\- Conversation history / memory

\- AI responses based on business documents

\- n8n automation integration

\- REST API backend

\- Modern web frontend



\## 🧠 AI \& RAG



The platform uses a Retrieval-Augmented Generation architecture.



Basic flow:



User Question

↓

Create Embedding

↓

Vector Search

↓

Retrieve Relevant Documents

↓

Conversation History

↓

Gemini AI

↓

Business Answer



The AI is instructed to use the available business documents as the primary source of company knowledge.



\## 📚 Knowledge Base



The Knowledge Base allows business users to:



\- Add text information

\- Upload documents

\- View stored documents

\- Edit documents

\- Delete documents

\- Store document metadata

\- Generate embeddings automatically



Supported uploaded files:



\- PDF

\- TXT

\- DOCX



Duplicate document detection is also implemented.



\## 🏗️ Project Structure



```text

Enterprise-AI-Business-Automation-Platform/

│

├── api/

├── assets/

├── backend/

├── database/

├── docker/

├── docs/

├── frontend/

├── n8n/

├── prompts/

├── tests/

├── .gitignore

└── README.md

