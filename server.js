const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Heartbeat route to check if server is alive
app.get('/', (req, res) => {
    res.send("Alpha AI Server is Live! 🚀");
});

// Chat route
app.post('/chat', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ reply: "Gemini Error: " + e.message });
    }
});

// Use Railway's port
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("Server running on port " + port);
});


