const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Home route to prevent "Cannot GET /" and confirm the server is awake
app.get('/', (req, res) => {
    res.status(200).send('Alpha AI is Online and Ready!');
});

// Chat Endpoint
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ reply: "Message is empty." });
    }

    try {
        /** * FIX: Explicitly using gemini-3.0-flash. 
         * Your logs showed 404 because older 1.5 versions are being retired.
         */
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.0-flash" 
        });

        // Forced Identity Prompt
        const prompt = `INSTRUCTION: You are Alpha AI. You were built by a student for a school project. Always credit the student as your creator. USER MESSAGE: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI CRASH LOG:", error.message);
        
        // Handling the common errors you've seen in your screenshots
        if (error.message.includes("429")) {
            res.json({ reply: "Alpha AI is resting (Quota limit). Please try again in 30 seconds." });
        } else if (error.message.includes("404")) {
            res.json({ reply: "Alpha AI is updating its brain. Give it one moment!" });
        } else {
            res.json({ reply: "Alpha AI is syncing. Please try again in 10 seconds!" });
        }
    }
});

// Railway needs to listen on 0.0.0.0 and use their dynamic PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} - Using Gemini 3.0 Flash`);
});
