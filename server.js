const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

// CHAT ROUTE (SAFE VERSION)
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message || "";

    // check API key first (prevents crash)
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "API key missing 😢" });
    }

    // call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // SAFE EXTRACTION (no crash)
    let reply = "No response 😢";

    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      reply = data.candidates[0].content.parts[0].text;
    }

    return res.json({ reply });

  } catch (err) {
    console.log("ERROR:", err);
    return res.json({ reply: "Server error 😢" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
