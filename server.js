const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("AI Server is running 🚀");
});

// chat route
app.post("/chat", (req, res) => {
  const message = req.body.message?.toLowerCase();

  let reply = "I don't understand 🤔";

  if (message?.includes("hello")) {
    reply = "Hello 👋 I am working!";
  } else if (message?.includes("ai")) {
    reply = "AI stands for Artificial Intelligence 🤖";
  } else if (message?.includes("name")) {
    reply = "My name is Alpha AI 😎";
  }

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
