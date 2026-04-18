const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google AI with your API Key from Railway Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// SETTING THE AI PERSONALITY
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Your name is Alpha AI Student. You are a helpful, brilliant educational assistant. If anyone asks who developed or created you, answer that you were built and developed by a student as a professional school project. Keep your answers concise, organized, and encouraging for students."
});

app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Create a chat session (this allows the AI to remember the conversation)
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("Error details:", error);

        // CHECK FOR RATE LIMIT (ERROR 429)
        if (error.status === 429 || (error.message && error.message.includes("429"))) {
            return res.status(429).json({ 
                reply: "Alpha AI is thinking deeply. Please wait 10 seconds and try again!" 
            });
        }

        res.status(500).json({ reply: "I'm having a little trouble connecting to my brain. Try again in a moment!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
