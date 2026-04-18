const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the exact model name "gemini-1.5-flash"
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Your name is Alpha AI Student. You are a helpful educational assistant built by a student."
});

app.get("/", (req, res) => {
    res.send("Alpha AI Server is online and ready!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Start chat with the model
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("DETAILED ERROR:", error);
        
        // Specific error for 429 Rate Limit
        if (error.status === 429) {
            return res.status(429).json({ reply: "Alpha AI is thinking deeply. Please wait 10 seconds!" });
        }
        
        res.status(500).json({ reply: "I'm having trouble connecting to my brain. Check your API key!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
