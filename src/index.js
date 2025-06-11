import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v1Router } from "./routes/v1.js";

const app = express();

dotenv.config();
app.use(cors());

app.use("/v1", v1Router);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
