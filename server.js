const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
    res.send("Alpha AI Server is online!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        
        // THIS IS THE FIX: Use getGenerativeModel inside the request with the specific model ID
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("LOG ERROR:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to my brain. Try again!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
