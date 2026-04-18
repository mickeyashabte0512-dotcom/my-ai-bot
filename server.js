const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Home route to check if server is awake
app.get("/", (req, res) => {
    res.send("Alpha AI Server is online and ready!");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        
        // Using the standard model name
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Direct generation (this is what worked!)
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to my brain. Try again!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
