const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Google AI with your API Key from Railway Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Check if server is alive
app.get('/', (req, res) => {
    res.send("Alpha AI Server is Live! 🚀");
});

// Main Chat Endpoint
app.post('/chat', async (req, res) => {
    try {
        // UPDATED: Using the 2026 stable Gemini 3 model
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ reply: "No message provided." });
        }

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Server Error:", error.message);
        
        // Detailed error for troubleshooting
        let errorMessage = "AI is currently resting. Try again in a moment.";
        if (error.message.includes("API_KEY_INVALID")) {
            errorMessage = "Error: Your API Key is incorrect in Railway Variables.";
        }
        
        res.status(500).json({ reply: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
