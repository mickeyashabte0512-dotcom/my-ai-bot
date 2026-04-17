const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up the AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('Alpha AI Server is Awake!'));

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // We stick the identity right into the prompt
    const prompt = `User says: ${message}. (Remember: Your name is Alpha AI, created by Mickey. Answer as Alpha.)`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
