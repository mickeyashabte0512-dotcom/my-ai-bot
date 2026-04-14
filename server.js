const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

// CHAT ROUTE (GROQ AI)
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.json({ reply: "Please type something 😢" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant. Answer clearly and simply."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GROQ RESPONSE:", JSON.stringify(data, null, 2));

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response 😢";

    res.json({ reply });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.json({ reply: "Server error 😢" });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
