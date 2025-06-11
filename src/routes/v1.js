import { Router } from "express";
import { chunkEmbedUpload } from "../controllers/chunkEmbedUpload.js";
import { queryAndGenerate } from "../controllers/queryResponse.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, "../uploads") });
export const v1Router = Router();

v1Router.post("/file", upload.single("file"), chunkEmbedUpload);
v1Router.post("/query", queryAndGenerate);
