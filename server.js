const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize with your existing key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI is Live!'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        // 2. CRITICAL FIX: Explicitly force 'v1' to stop the 404 error
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' }
        );

        const prompt = `INSTRUCTION: You are Alpha AI, built by a student for a school project. Answer this: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI ERROR:", error.message);
        res.json({ reply: "Alpha AI is syncing. Please try again in 10 seconds!" });
    }
});

// 3. Railway often prefers port 8080 or the process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
