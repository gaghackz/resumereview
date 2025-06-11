import fs from "fs";
process.env.NODE_ENV = "production";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API = process.env.GEMINI_API;
const pc = new Pinecone({ apiKey: process.env.PINE_API });
const index = pc.index(
  "resume",
  "https://resume-0x67s0s.svc.aped-4627-b74a.pinecone.io"
);

export async function chunkEmbedUpload(req, res) {
  const embeddedChunks = [];
  try {
    const filePath = req.file.path;
    const text = await extractTextFromPdf(filePath);
    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      embeddedChunks.push({
        chunk: chunks[i],
        embedding,
      });
    }
    const formatted = embeddedChunks.map((item, index) => ({
      id: String.fromCharCode(65 + index), // A, B, C, ...
      values: item.embedding[0].values,
      metadata: {
        chunk: item.chunk,
        length: item.chunk.length,
      },
    }));
    upsertToPineCone(formatted);
    res.json({ formatted });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to process file" });
  }
}

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  let chunk = [];

  for (const word of words) {
    chunk.push(word);
    if (chunk.join(" ").length >= chunkSize) {
      chunks.push(chunk.join(" "));
      chunk = [];
    }
  }

  if (chunk.length > 0) chunks.push(chunk.join(" "));
  return chunks;
}

async function embedText(chunk) {
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API,
  });

  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: chunk,
    config: {
      taskType: "SEMANTIC_SIMILARITY",
    },
  });

  return response.embeddings;
}

async function upsertToPineCone(embeddedChunks) {
  try {
    const result = await index.namespace("meow").upsert(embeddedChunks);
    console.log("✅ Upserted to Pinecone:", result);
  } catch (error) {
    console.error("❌ Pinecone upsert error:", error.message);
  }
}
