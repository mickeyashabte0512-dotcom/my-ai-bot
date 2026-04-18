const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI is finally Online!'));

app.post('/chat', async (req, res) => {
    try {
        // This MUST use gemini-1.5-flash for the most stable connection
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("DEBUG:", error.message);
        res.json({ reply: "Alpha AI is syncing. Give it 10 seconds!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Stable Server Running`));
