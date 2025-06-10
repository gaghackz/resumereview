const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");

const {
  extractTextFromPdf,
  chunkText,
  embedText,
} = require("./utils/chunkAndEmbed.js");

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

    const embeddedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      embeddedChunks.push({
        chunk: chunks[i],
        embedding,
      });
    }

    // Optionally delete file after processing
    fs.unlinkSync(filePath);

    res.json({ embeddedChunks });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to process file" });
  }
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
