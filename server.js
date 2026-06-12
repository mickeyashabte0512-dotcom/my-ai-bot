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

        // ✨ OPTIMIZE MEMORY LOOPS: Strip out old, bulky base64 data streams
        const optimizedHistory = incomingMessages.map((msg, index) => {
            if (index === incomingMessages.length - 1) {
                return msg; // Keep current message fully intact
            }

            if (Array.isArray(msg.content)) {
                const textComponent = msg.content.find(item => item.type === "text");
                return {
                    role: msg.role,
                    content: textComponent ? textComponent.text : "Sent an image attachment."
                };
            }

            return msg;
        });

        // 🧠 DYNAMIC MODEL ROUTING: Detect image structures to select the correct production engine
        let selectedModel = "Meta-Llama-3.3-70B-Instruct"; // Default text intelligence
        let hasImage = false;

        const latestMessage = optimizedHistory[optimizedHistory.length - 1];
        if (latestMessage && Array.isArray(latestMessage.content)) {
            // ✨ ULTIMATE FIX: Switch strictly to SambaNova's official vision model identifier string.
            // Text models will explode on base64 character limits, while this architecture compresses it safely.
            selectedModel = "Llama-3.2-11B-Vision-Instruct"; 
            hasImage = true;
        }

        let finalizedPayload = [];

        if (hasImage) {
            // Pass history straight through for the vision model to keep formatting clean
            finalizedPayload = [...optimizedHistory];
        } else {
            // Keep your proud school system identity for standard text conversations
            finalizedPayload = [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand." 
                },
                ...optimizedHistory
            ];
        }

        // Call SambaNova API
        const response = await openai.chat.completions.create({
            model: selectedModel, 
            messages: finalizedPayload,
            temperature: 0.1 
        });
        
        // Return text reply back to front-end layout
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
 
