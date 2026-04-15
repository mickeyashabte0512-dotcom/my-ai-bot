const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

// --- THE HANDSHAKE FIX ---
// This allows your Acode frontend to talk to this Railway server
app.use(cors()); 

// This allows the server to read the JSON text you send
app.use(express.json()); 

// Root route to check if server is live
app.get('/', (req, res) => {
    res.send("AI Server is running perfectly!");
});

// The AI Logic
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "No message sent" });
        }

        // --- THE BYPASS FIX ---
        // We initialize Groq ONLY when a message is actually received
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY 
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are Alpha AI, a helpful assistant." },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        
        // Send the answer back to your website
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ reply: "I'm having trouble thinking. Check Railway logs!" });
    }
});

// Use the port Railway gives us
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live on port ${PORT}`);
});

