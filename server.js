require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB に接続
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 📌 MongoDB スキーマ & モデル
const ApplicationSchema = new mongoose.Schema({
  name: String,
  federation: String,
  start_time: Date,
  end_time: Date
});
const Application = mongoose.model("Application", ApplicationSchema);

// 📌 応募データを保存（POST /apply）
app.post("/apply", async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.status(201).json({ message: "Application saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save application" });
  }
});

// 📌 すべての応募データを取得（GET /applications）
app.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// 📌 サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
