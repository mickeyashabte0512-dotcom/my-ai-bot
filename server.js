app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "API key missing 😢" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // SAFE CHECK (prevents crash)
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.log("Gemini response error:", data);
      return res.json({ reply: "AI couldn't generate response 😢" });
    }

    res.json({ reply });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.json({ reply: "Server error 😢" });
  }
});
