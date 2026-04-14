app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔥 IMPORTANT: see full response in logs
    console.log("🔥 GROQ RESPONSE:", JSON.stringify(data, null, 2));

    res.json({
      reply: data?.choices?.[0]?.message?.content || "No response 😢",
      debug: data
    });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.json({ reply: "Server error 😢" });
  }
});
