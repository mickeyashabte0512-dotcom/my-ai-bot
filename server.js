const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    // safety check
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "Missing API key 😢" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ reply: reply || "No response 😢" });

  } catch (err) {
    console.log("ERROR:", err);
    res.json({ reply: "Server crashed internally 😢" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running...");
});
