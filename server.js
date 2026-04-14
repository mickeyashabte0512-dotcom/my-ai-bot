const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

app.post("/chat", (req, res) => {
  console.log("REQUEST:", req.body);

  res.json({ reply: "Server working ✅" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});
