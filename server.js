const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Server Running 🚀");
});

app.post("/chat", (req, res) => {
  console.log("REQUEST RECEIVED:", req.body);

  res.json({
    reply: "Server is working perfectly ✅"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
