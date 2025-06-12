# 📄 AI Resume Analyzer

A full-stack system that evaluates a candidate's resume against a job description using semantic search and generative AI.

---

## 🧠 Overview

This application extracts text from uploaded resumes (PDF), breaks it into manageable chunks, embeds the chunks using a powerful embedding model, stores them in a vector database, and later performs a semantic search when a job description is provided. The retrieved chunks are passed to a generative AI model to create a well-formatted evaluation.

---

## 🧰 Tech Stack

| Component       | Technology Used               |
| --------------- | ----------------------------- |
| Embedding Model | `text-embedding-004` (Gemini) |
| AI Model        | `gemini-flash-2.0`            |
| Vector Database | `Pinecone`                    |
| Frontend        | `React`                       |
| Backend         | `Express.js`, `Node.js`       |
| PDF Parsing     | `pdf-parse`                   |

---

## 🔄 Workflow

### 1. 📥 PDF Upload & Parsing

- A user uploads a resume PDF.
- The backend uses `pdf-parse` to extract raw text.

### 2. ✂️ Chunking

- The extracted text is split into chunks of ~500 words each for better embedding and semantic resolution.

### 3. 🧬 Embedding

- Each chunk is embedded using **Gemini's `text-embedding-004`** model.
- Embeddings are paired with the original text and stored in **Pinecone** under a defined namespace.

### 4. 🔍 Semantic Querying

- When a user submits a job description, it's embedded the same way.
- A **semantic similarity search** is performed on Pinecone using the embedded query.
- Top-k relevant chunks from the resume are retrieved.

### 5. 🤖 AI-Powered Evaluation

- The top chunks + job description are fed into **`gemini-flash-2.0`**.
- A formatted, markdown-compliant evaluation is generated, analyzing:
  - Strengths
  - Gaps
  - Fit Verdict
  - Recommendations

### 6. 🌐 Frontend Display

- The final response is returned to the frontend.
- The **React** app renders the markdown evaluation cleanly for the user.

---

## 🧪 Example Use Case

1. Upload resume PDF →
2. Query with job description →
3. View detailed HR-style candidate assessment

---
