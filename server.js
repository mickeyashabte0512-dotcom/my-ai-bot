const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. "Heartbeat" test - Visit your URL in a browser to see this!
app.get('/', (req, res) => {
    res.send("<h1>Alpha AI is Awake! 🚀</h1>");
});

// 2. Chat Logic
app.post('/chat', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (e) {
        console.error("Gemini Error:", e.message);
        res.status(500).json({ reply: "Gemini Error: " + e.message });
    }
});

// 3. THE PORT FIX (Fixes the SIGTERM crash)
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("Server running on port " + port);
});

