const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize with the new version of the library
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
    res.send("Alpha AI Server is online!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        
        // Using the most stable model name for version 0.11.0+
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Simple generation instead of Chat Session to avoid the 404 error
        const result = await model.generateContent(message);
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
