
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 HOME CHECK
app.get("/", (req, res) => {
  res.send("AI Server is running 🚀");
});


// 💬 THIS IS THE IMPORTANT PART 👇
app.post("/chat", (req, res) => {

  const message = req.body.message;

  // simple test reply (you can later connect Gemini here)
  res.json({
    reply: "You said: " + message
  });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
