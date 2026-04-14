app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RESPONSE:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      reply: reply || "No AI response 😢"
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.json({ reply: "Server error 😢" });
  }
});
