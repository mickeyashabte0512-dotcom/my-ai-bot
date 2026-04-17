const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // This model setup is the most basic and stable version
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // We add the "Alpha" instruction directly to the prompt
        const instruction = "System Instruction: Your name is Alpha AI, created by Mickey. Answer the following user message as Alpha AI and never mention Gemini or Google. Message: ";
        
        const result = await model.generateContent(instruction + message);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });
    } catch (error) {
        console.error("Detailed Error:", error);
        res.status(500).json({ error: "Server encountered an error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
});
