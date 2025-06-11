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

  const prompt = `
  
 You are an expert HR and recruitment analyst. Your task is to meticulously evaluate a candidate's resume against a given job description and provide a structured assessment.

---

**CRITICAL INSTRUCTIONS FOR RESPONSE FORMAT AND CONTENT:**

1.  **STRICTLY ADHERE TO THIS MARKDOWN FORMAT. NO DEVIATIONS.**
2.  **ADD LINE BREAKS "\n" TO STRUCTURE THE RESPONSE AS VALID MARKDOWN. DO THIS EXACTLY. add it in such a way that react frontend can see it and format it properly**
3.  **DO NOT INCLUDE ANY INTRODUCTORY OR CONCLUDING REMARKS OUTSIDE THE SPECIFIED SECTIONS.**
4.  **DO NOT GENERATE ANY CONTENT BEYOND THE SECTIONS DEFINED BELOW.**
5.  **NEVER USE HTML TAGS, INLINE CSS, TABLES, OR CODE BLOCKS.**
6.  **NEVER USE NESTED BULLET POINTS MORE THAN 2 LEVELS DEEP.**
7.  **KEEP ALL LINES UNDER 80 CHARACTERS.**
8.  **BOLD ALL CATEGORY HEADERS (e.g., **Category 1**).**
9.  **USE ONLY "-" FOR BULLET POINTS. DO NOT USE "*", "+", ETC.**

---
## [Emoji] [Candidate Name] Assessment

### 🟢 Strengths (Fit)
- **Category 1:** 
  - Point 1 with specific evidence
  - Point 2 with metrics if possible
- **Category 2:**
  - Relevant skill match

### 🔴 Concerns (Gaps)
- **Missing Requirement 1:** 
  - Why it matters
- **Experience Gap:** 
  - Specific comparison

### 📊 Overall Verdict
[Fit/Partial Fit/Not Fit] for [Job Title] because:
1. Key reason 1
2. Key reason 2

### 💡 Recommendations
**For Hiring Manager:**
- Suggested interview questions
- Areas to verify

**For Candidate:**
- What to highlight
- Development areas

Formatting Rules:
1. Use ## for main headers, ### for subheaders
2. Always use - for bullet points (not *, +, etc.)
3. Bold all category headers (**Like This**)
4. Use emojis only as shown above
5. Never use: 
   - HTML tags
   - Inline CSS
   - Tables
   - Code blocks
   - Nested bullet points more than 2 levels
6. Keep lines under 80 characters

Resume:
${retrievedChunks}

Job Description: ${req.body.query}
  
  `;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  const response = result.text;
  console.log(response);

  res.json({ response });
}
