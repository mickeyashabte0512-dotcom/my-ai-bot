const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: "Your name is Alpha AI Student. You are a helpful educational assistant. If anyone asks who developed or created you, answer that you were built and developed by a student as a professional school project. Keep your answers concise and use clear formatting like bullet points and tables when helpful."
});

// FIXES THE "CANNOT GET /" ERROR
app.get("/", (req, res) => {
    res.send("Alpha AI Server is online and ready! Use the website to start chatting.");
});

app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error:", error);
        if (error.status === 429 || (error.message && error.message.includes("429"))) {
            return res.status(429).json({ reply: "Alpha AI is thinking deeply. Please wait 10 seconds!" });
        }
        res.status(500).json({ reply: "I'm having trouble connecting to my brain. Try again in a moment!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
