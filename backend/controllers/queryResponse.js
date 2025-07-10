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

**CRITICAL INSTRUCTIONS FOR RESPONSE FORMAT AND CONTENT (STRICT MODE):**

1. **STRICTLY ADHERE TO THIS MARKDOWN FORMAT. NO DEVIATIONS ARE ALLOWED.**
2. **DO NOT ADD ANY INTRODUCTORY OR CONCLUDING SENTENCES. STICK TO ONLY THE REQUESTED STRUCTURE.**
3. **DO NOT OUTPUT ANYTHING OUTSIDE THE SPECIFIED HEADERS BELOW. NO EXTRA COMMENTS.**
4. **ADD "\\n" FOR EVERY LINE BREAK TO ENSURE MARKDOWN IS FORMATTED CORRECTLY IN REACT.**
5. **NEVER USE HTML TAGS, CSS, CODE BLOCKS, OR MARKDOWN CODE FENCES.**
6. **NEVER USE NESTED BULLETS MORE THAN TWO LEVELS.**
7. **DO NOT USE MARKDOWN STYLES OTHER THAN WHAT IS SHOWN.**
8. **ONLY USE “-” FOR BULLET POINTS. NEVER USE "*", "+", OR OTHER SYMBOLS.**
9. **KEEP EVERY LINE BELOW 80 CHARACTERS.**
10. **BOLD ALL CATEGORY TITLES EXACTLY AS SHOWN (e.g., **Category 1**).**
11. **USE ONLY EMOJIS EXACTLY AS SPECIFIED BELOW. NO OTHER EMOJIS ALLOWED.**
12. **THE MODEL MUST NOT HALLUCINATE STRUCTURE. FOLLOW THE HEADINGS AND SUBHEADINGS EXACTLY.**

---

## 🧑‍💼 [Candidate Name] Assessment

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

---

**Resume:**  
${retrievedChunks}  

**Job Description:**  
${req.body.query}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  const response = result.text;
  console.log(response);

  res.json({ response });
}
