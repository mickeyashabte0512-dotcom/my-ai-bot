app.post("/chat", (req, res) => {
  try {
    console.log("🔥 CHAT REQUEST RECEIVED");
    console.log("BODY:", req.body);

    res.json({ reply: "Server reached successfully ✅" });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.json({ reply: "Server error 😢" });
  }
});
