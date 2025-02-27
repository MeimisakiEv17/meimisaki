require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const ApplicationSchema = new mongoose.Schema({
  name: String,
  federation: String,
  start_time: Date,
  end_time: Date
});
const ApprovedApplication = mongoose.model("ApprovedApplication", ApplicationSchema);

// 📌 応募データを保存（POST /apply）
app.post("/apply", async (req, res) => {
  try {
    const { name, federation, start_time, end_time } = req.body;
    const start = new Date(start_time);
    const end = new Date(end_time);

    if (!name || !federation || !start_time || !end_time) {
      return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    const duration = (end - start) / (1000 * 60 * 60);
    if (duration > 2) {
      return res.status(400).json({ error: "Start TimeとEnd Timeの間は2時間以内にしてください。" });
    }

    const overlappingApplication = await ApprovedApplication.findOne({
      $or: [
        { start_time: { $lt: end }, end_time: { $gt: start } },
      ]
    });

    if (overlappingApplication) {
      return res.status(400).json({ error: "指定された時間帯には既にスケジュールがあります。" });
    }

    const federationCount = await ApprovedApplication.countDocuments({ federation });
    if (federationCount >= 2) {
      return res.status(400).json({ error: "同じFederationの応募が2つ以上あります。" });
    }

    const newApplication = new ApprovedApplication({ name, federation, start_time: start, end_time: end });
    await newApplication.save();

    res.status(201).json({ message: "応募が送信されました！" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
});

// 📌 副大統領スケジュール取得
app.get("/approved", async (req, res) => {
  const approved = await ApprovedApplication.find().sort({ start_time: 1 });
  res.json(approved);
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
