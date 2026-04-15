const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send("AI Server is running!");
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Initialize ONLY when a request actually hits this route
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY 
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ reply: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to Groq." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live on port ${PORT}`);
});
