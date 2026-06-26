import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { portfolio } from "./data/portfolio.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173"
    ].filter(Boolean)
}));
app.use(express.json());

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.warn("MongoDB connection skipped:", error.message));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mayank-portfolio-api" });
});

app.get("/api/portfolio", (_req, res) => {
  res.json(portfolio);
});

app.listen(port, () => {
  console.log(`Portfolio API running on http://localhost:${port}`);
});
