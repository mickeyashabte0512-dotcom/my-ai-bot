const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CRITICAL FIX: We are forcing 'v1' (Stable) instead of the 'v1beta' that keeps failing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI is Live!'));

app.post('/chat', async (req, res) => {
    try {
        /**
         * FORCE STABLE VERSION: 
         * By adding { apiVersion: 'v1' }, we bypass the 404 error seen in your logs.
         */
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' } 
        );

        const prompt = `You are Alpha AI, built by a student for a school project. Answer this: ${req.body.message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("LOG ERROR:", error.message);
        // This matches the message on your screen
        res.json({ reply: "Alpha AI is syncing. Please try again in 10 seconds!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server Online on Port ${PORT}`));
