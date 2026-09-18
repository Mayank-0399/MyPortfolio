import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { portfolio } from "./data/portfolio.js";
import { getCodeforcesStats } from "./services/codeforces.js";
import { getLeetcodeStats } from "./services/leetcode.js";

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

app.get("/api/codeforces", async (req, res) => {
  try {
    const handle = req.query.handle || "mayanksingh230651";
    const data = await getCodeforcesStats(handle);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch Codeforces data" });
  }
});

app.get("/api/leetcode", async (req, res) => {
  try {
    const username = req.query.username || "Mayank_2027";
    const data = await getLeetcodeStats(username);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch LeetCode data" });
  }
});

app.listen(port, () => {
  console.log(`Portfolio API running on http://localhost:${port}`);
});
