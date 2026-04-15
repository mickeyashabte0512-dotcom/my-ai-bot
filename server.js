const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

// 1. MIDDLEWARE
app.use(cors()); 
app.use(express.json());  

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.get('/', (req, res) => {
    res.send("AI Server is running perfectly!");
  
})
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "No message provided" });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful and friendly AI assistant for a web design project."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("GROQ API ERROR:", error);
        res.status(500).json({ reply: "Error: I couldn't connect to my brain!" });
    }
});

// 5. START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live on port ${PORT}`);
});
