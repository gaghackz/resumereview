const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const { upsertToPineCone } = require("./utils/dbUpsert.js");
const {
  extractTextFromPdf,
  chunkText,
  embedText,
} = require("./utils/chunkAndEmbed.js");

const embeddedChunks = [];
const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/", (req, res) => {
  res.send("hello there");
});

app.post("/file", upload.single("file"), async (req, res) => {
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
        originalChunk: item.chunk.slice(0, 100), // keep short preview
        length: item.chunk.length,
      },
    }));
    upsertToPineCone(formatted);

    // Optionally delete file after processing
    fs.unlinkSync(filePath);

    res.json({ formatted });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to process file" });
  }
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
