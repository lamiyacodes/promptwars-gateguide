import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { systemPrompt, messages } = req.body;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kuch gadbad ho gaya, phir try karo.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error, try again." });
  }
});

app.listen(3001, () => {
  console.log("GateGuide backend running on http://localhost:3001");
});