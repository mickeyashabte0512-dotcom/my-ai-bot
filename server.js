const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (e) {
        console.error(e);
        res.json({ reply: "Gemini Error: " + e.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("Gemini Server Live"));
