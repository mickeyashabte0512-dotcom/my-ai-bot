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

        // ✨ FIX: Optimize memory loops so past base64 data streams don't stack up and crash context limits
        const optimizedHistory = incomingMessages.map((msg, index) => {
            // If it's the very last message in the conversation array, keep it fully intact (current image)
            if (index === incomingMessages.length - 1) {
                return msg;
            }

            // For older history records, if it contains a multimodal array object layout, strip the heavy pixels
            if (Array.isArray(msg.content)) {
                // Find the text part of that old interaction to preserve context memory
                const textComponent = msg.content.find(item => item.type === "text");
                return {
                    role: msg.role,
                    content: textComponent ? textComponent.text : "Sent an image attachment."
                };
            }

            return msg;
        });

        // 🧠 DYNAMIC MODEL ROUTING: Check if current prompt context carries image payload parameters
        let selectedModel = "Meta-Llama-3.3-70B-Instruct"; 
        let hasImage = false;

        // Check the newest incoming user request
        const latestMessage = optimizedHistory[optimizedHistory.length - 1];
        if (latestMessage && Array.isArray(latestMessage.content)) {
            hasImage = true;
        }

        let finalizedPayload = [];

        // Handle system instructions safely depending on model requirements
        if (hasImage) {
            // Pass optimized history directly down the pipe to prevent 400 validation drops
            finalizedPayload = [...optimizedHistory];
        } else {
            // For standard text chats, keep using your proud system prompt identity
            finalizedPayload = [
                { 
                    role: "system", 
                    content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand." 
                },
                ...optimizedHistory
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
