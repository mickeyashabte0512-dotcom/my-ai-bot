const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED MODEL NAME HERE
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest", 
    systemInstruction: "Your name is Alpha AI Student. You are a helpful educational assistant built by a student."
});

app.get("/", (req, res) => {
    res.send("Alpha AI Server is online and ready!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to my brain. Try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
