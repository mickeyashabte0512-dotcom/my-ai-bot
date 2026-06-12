const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all incoming mobile app frontend connections
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Set massive payload limitations so high-res phone camera strings pass smoothly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize OpenAI library pointing directly to SambaNova's ultra-fast engine
const openai = new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY, 
    baseURL: "https://api.sambanova.ai/v1" 
});

// Main root path check to see if your Vercel URL is live
app.get('/', (req, res) => res.send('Alpha AI Multi-Modal Engine is Live!'));

// Chat route handling continuous session history arrays cleanly
app.post('/chat', async (req, res) => {
    const { history } = req.body;
    
    try {
        let incomingMessages = history || [];

        // 🧠 DYNAMIC MODEL ROUTING: Detect if any message context contains vision data structures
        let selectedModel = "Meta-Llama-3.3-70B-Instruct"; // Default high-reasoning text brain
        let hasImage = false;

        for (let msg of incomingMessages) {
            if (Array.isArray(msg.content)) {
                // ✨ ULTIMATE FIX: Added 'Meta-' to match SambaNova's exact cloud production string
                selectedModel = "Meta-Llama-3.2-11B-Vision-Instruct"; 
                hasImage = true;
                break;
            }
        }

        let finalizedPayload = [];

        // Handle system instructions safely depending on model requirements
        if (hasImage) {
            // If there's an image, pass the history directly down the pipe to prevent 400 validation drops
            finalizedPayload = [...incomingMessages];
        } else {
            // For standard text chats, keep using your proud system prompt identity
            finalizedPayload = [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand." 
                },
                ...incomingMessages
            ];
        }

        // Call the dynamically chosen model setup from SambaNova
        const response = await openai.chat.completions.create({
            model: selectedModel, 
            messages: finalizedPayload,
            temperature: 0.1 
        });
        
        // Return structured answer text back to your UI layout
        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("CRITICAL API SERVER ERROR LOG:", error.message);
        res.status(500).json({ reply: `Alpha Engine Error: ${error.message}` });
    }
});

// Export the app config so Vercel handles serverless function compilation routing
module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
});
