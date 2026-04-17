const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send("Alpha AI Server is Live! 🚀");
});

app.post('/chat', async (req, res) => {
    try {
        // FIXED LINE BELOW: Added apiVersion: 'v1beta'
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
        
        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ reply: "Gemini Error: " + e.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log("Server running on port " + port);
});

