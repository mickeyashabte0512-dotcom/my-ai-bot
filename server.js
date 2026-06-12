const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const openai = new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY, 
    baseURL: "https://api.sambanova.ai/v1" 
});

app.get('/', (req, res) => res.send('Alpha AI Multi-Modal Engine is Live!'));

app.post('/chat', async (req, res) => {
    const { history } = req.body;
    
    try {
        let incomingMessages = history || [];

        // Clean up old context payload weights
        const optimizedHistory = incomingMessages.map((msg, index) => {
            if (index === incomingMessages.length - 1) return msg;
            if (Array.isArray(msg.content)) {
                const textComponent = msg.content.find(item => item.type === "text");
                return {
                    role: msg.role,
                    content: textComponent ? textComponent.text : "Sent an image attachment."
                };
            }
            return msg;
        });

        let selectedModel = "Meta-Llama-3.3-70B-Instruct"; 
        let hasImage = false;

        const latestMessage = optimizedHistory[optimizedHistory.length - 1];
        if (latestMessage && Array.isArray(latestMessage.content)) {
            selectedModel = "gemma-4-31B-it"; 
            hasImage = true;
        }

        let finalizedPayload = [];
        if (hasImage) {
            finalizedPayload = [...optimizedHistory];
        } else {
            finalizedPayload = [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand." 
                },
                ...optimizedHistory
            ];
        }

        // ⚡ SET STREAMING HEADERS FOR VERCEL SERVERLESS PIPES
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Forces Vercel to stream immediately

        // Request streaming directly from SambaNova engine
        const stream = await openai.chat.completions.create({
            model: selectedModel, 
            messages: finalizedPayload,
            temperature: 0.1,
            stream: true // ⚡ ACTIVATED
        });
        
        // Loop over generation chunks and spit them out live to the phone line
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
            }
        }
        
        res.end(); // Close response loop neatly when AI finishes speaking

    } catch (error) {
        console.error("CRITICAL STREAM ENGINE ERROR:", error.message);
        // Fallback error signal for user UI tracking
        if (!res.headersSent) {
            res.status(500).send(`Alpha Engine Error: ${error.message}`);
        } else {
            res.write(`\n\n[Alpha Engine Error: ${error.message}]`);
            res.end();
        }
    }
});

module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Streaming Server online on port ${PORT}`);
});
