const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 HOME ROUTE
app.get("/", (req, res) => {
  res.send("AI server is running 🤖🔥");
});

// 🧠 CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    // 🔍 DEBUG (very important)
    console.log("OpenAI response:", data);

    // ❌ If API error
    if (data.error) {
      return res.json({
        reply: "API error 😢: " + data.error.message
      });
    }

    // ✅ Normal response
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({
        reply: "No response from AI 😢"
      });
    }

    res.json({ reply });

  } catch (error) {
    console.log("Server error:", error);

    res.json({
      reply: "Server error 😢"
    });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI server running on port " + PORT);
});
