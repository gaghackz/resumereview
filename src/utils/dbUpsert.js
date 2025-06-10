import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINE_API });
const index = pc.index(
  "resume",
  "https://resume-0x67s0s.svc.aped-4627-b74a.pinecone.io"
);

async function upsertToPineCone(embeddedChunks) {
  try {
    const result = await index.namespace("meow").upsert(embeddedChunks);
    console.log("✅ Upserted to Pinecone:", result);
  } catch (error) {
    console.error("❌ Pinecone upsert error:", error.message);
  }
}

export { upsertToPineCone };
