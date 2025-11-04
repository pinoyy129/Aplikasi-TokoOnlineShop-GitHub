// server/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy route
app.post("/api/news", async (req, res) => {
  try {
    const { endpoint, params = {}, apiKey } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Missing 'endpoint' in body." });
    }

    // Build query string
    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    const headers = {};
    if (apiKey) headers["X-Api-Key"] = apiKey;

    const response = await fetch(url, { headers });
    const text = await response.text();

    res
      .status(response.status)
      .set("content-type", response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
