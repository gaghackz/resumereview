const fs = require("fs");
const pdf = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const GEMINI_API = process.env.GEMINI_API;

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

module.exports = {
  extractTextFromPdf,
  chunkText,
  embedText,
};
