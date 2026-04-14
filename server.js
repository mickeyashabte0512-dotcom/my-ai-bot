app.post("/chat", (req, res) => {
  console.log("🔥 CHAT HIT:", req.body);

  res.json({ reply: "YES SERVER IS WORKING ✅" });
});
