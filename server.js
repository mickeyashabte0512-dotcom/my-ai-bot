const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google AI with your Railway Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check route (to see if server is awake)
app.get('/', (req, res) => {
    res.send('Alpha AI Server is online and ready!');
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Check if message exists
        if (!message) {
            return res.status(400).json({ reply: "No message provided." });
        }

        // 2. Load the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Inject the Alpha AI Identity instructions directly into the prompt
        const systemInstruction = "Instruction: Your name is Alpha AI. You were created by Mickey. You must never say you are Gemini or created by Google. If asked who you are, always say: 'I am Alpha AI, created by Mickey.' Answer the following user message: ";
        
        const fullPrompt = systemInstruction + message;

        // 4. Generate the response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // 5. CRITICAL: Send back the key "reply" so the frontend can read it
        res.json({ reply: text });

    } catch (error) {
        console.error("Server Error:", error);
        // Fallback message so the user doesn't see "undefined"
        res.status(500).json({ reply: "Alpha AI is having trouble connecting. Check Railway logs." });
    }
});

// Use the port Railway provides, or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
