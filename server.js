const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.json({ reply: "Say something 😢" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful smart AI. Understand typos and reply clearly." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    let reply = "No response 😢";

    if (data && data.choices && data.choices[0]) {
      reply = data.choices[0].message.content;
    }

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "Server error 😢" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});
