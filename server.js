const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize with your NEW API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Setup the model with a stable name
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Your name is Alpha AI Student. You are a helpful educational assistant built by a student for a school project."
});

// 3. Home route to confirm server is alive
app.get("/", (req, res) => {
    res.send("Alpha AI Server is online and ready!");
});

// 4. Chat route
app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        
        // Handle Rate Limits (429)
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
