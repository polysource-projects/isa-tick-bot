// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  const { chat_id, text } = req.body;

  if (!chat_id || !text) {
    return res.status(400).json({ error: "chat_id et text requis" });
  }

  try {
    const telegramResp = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      { chat_id, text }
    );
    res.json(telegramResp.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Échec", details: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy prêt sur http://localhost:${PORT}`);
});
