const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send("Alpha AI Server is Live! 🚀");
});

app.post('/chat', async (req, res) => {
    try {
        // FIXED: Using the 2026 stable model name
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const { message } = req.body;
        const result = await model.generateContent(message);
        const response = await result.response;
        
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ reply: "AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});
