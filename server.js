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

// Ensure Express can read large Base64 photo payloads from your phone app
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
        // Fallback to an empty array if history parameter is missing completely
        let incomingMessages = history || [];

        // 🛠️ FIX 1: Clean array items safely without breaking on structured image arrays
        const cleanMessages = incomingMessages.filter(msg => {
            if (!msg || !msg.content) return false;
            if (typeof msg.content === 'string') {
                return msg.content.trim() !== "";
            }
            return true; 
        });

        // 🧠 DYNAMIC MODEL ROUTING: Detect if any message context contains image layouts
        let selectedModel = "Meta-Llama-3.3-70B-Instruct"; // Default high-reasoning text brain
        
        for (let msg of cleanMessages) {
            if (Array.isArray(msg.content)) {
                // 🛠️ FIX 2: Exact API naming match for SambaNova's vision endpoint
                selectedModel = "Llama3.2-11B-Vision-Instruct"; 
                break;
            }
        }

        // Construct the full payload array ensuring our core system identity parameters stay first
        const finalizedPayload = [
            { 
                role: "system", 
                content: "You are Alpha AI, a highly smart, supportive, and grounded AI collaborator. You were built, programmed, and developed by the brilliant Grade 11 C students at Saden Adea Secondary School to help students study. Always stay proud of your school origins. If anyone asks who created or made you, proudly state that you were made by the Grade 11 C students of Saden Adea Secondary School. Keep your answers clear, insightful, and easy to understand. You have vision processing capabilities and can perfectly read text, equations, and diagrams from image attachments." 
            },
            ...cleanMessages
        ];

        // Call the dynamically chosen model setup from SambaNova
        const response = await openai.chat.completions.create({
            model: selectedModel, 
            messages: finalizedPayload,
        });
        
        // Return structured answer text back to your UI layout
        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("API ERROR DETECTED:", error.message);
        res.status(500).json({ reply: "Alpha AI is experiencing pipeline friction. Try again!" });
    }
});

// Export the app config so Vercel handles serverless function compilation routing
module.exports = app;

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
});

