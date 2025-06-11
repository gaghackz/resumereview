import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINE_API });
const index = pc.index("resume");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

export async function queryAndGenerate(req, res) {
  const embeddingResp = await genAI.models.embedContent({
    model: "text-embedding-004",
    contents: req.body.query,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });
  console.log(embeddingResp);

  const userEmbedding = embeddingResp.embeddings[0].values;
  console.log(embeddingResp);

  const results = await index.namespace("meow").query({
    topK: 3,
    vector: userEmbedding,
    includeMetadata: true,
  });

  const retrievedChunks = results.matches
    .map((m) => m.metadata.chunk || "")
    .join("\n");

  console.log(retrievedChunks);

  const prompt = `Based on the resume content below, answer if candidate is fit for the job description\n\nResume:\n${retrievedChunks}\n\nJob Description: ${req.body.query}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  const response = result.text;
  console.log(response);

  res.json({ response });
}
