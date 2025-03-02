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
      return res.status(400).json({ error: "すべての項目を入力してください。Please enter all items." });
    }

    if (start >= end) {
      return res.status(400).json({ error: "開始時間は終了時間より前に設定してください。Please set the start time before the end time." });
    }

    const duration = (end - start) / (1000 * 60 * 60);
    if (duration > 2) {
      return res.status(400).json({ error: "Start TimeとEnd Timeの間は2時間以内にしてください。Please keep the time between Start Time and End Time within 2 hours." });
    }

    // 📌 現在の時間から24時間前と24時間後の範囲内でのスケジュール取得
    const now = new Date();
    const startTimeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
    const endTimeRange = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24時間後

    const approvedApplications = await ApprovedApplication.find({
      end_time: { $gte: startTimeRange, $lt: endTimeRange }
    });

    // 📌 指定された日付で同じFederationの応募が2つ以上存在するかチェック
    const adjustToJST = (date) => new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const startOfDay = new Date(adjustToJST(start).getFullYear(), adjustToJST(start).getMonth(), adjustToJST(start).getDate(), 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    const federationCount = approvedApplications.filter(application =>
      application.federation === federation &&
      adjustToJST(application.start_time) >= startOfDay &&
      adjustToJST(application.start_time) < endOfDay
    ).length;

    if (federationCount >= 2) {
      return res.status(400).json({ error: `同じ日に同じFederationの応募が2つ以上あります。There are two or more applications from the same Federation on the same day.` });
    }

    const newApplication = new ApprovedApplication({ name, federation, start_time: start, end_time: end });
    await newApplication.save();

    res.status(201).json({ message: "応募が送信されました！Your application has been submitted!" });
  } catch (error) {
    console.error("❌ Error saving application:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました。A server error has occurred." });
  }
});

// 📌 副大統領スケジュール取得（GET /approved）
app.get("/approved", async (req, res) => {
  try {
    const now = new Date();
    const startTimeRange = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
    const endTimeRange = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24時間後

    const approved = await ApprovedApplication.find({
      end_time: { $gte: startTimeRange, $lt: endTimeRange }
    }).sort({ start_time: 1 });

    res.json(approved);
  } catch (error) {
    console.error("❌ Error fetching approved applications:", error);
    res.status(500).json({ error: "Failed to fetch approved applications" });
  }
});

// 📌 特定のIDのデータを削除（DELETE /delete-application/:id）
app.delete("/delete-application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "パスワードを入力してください。Please enter your password." });
    }

    if (password !== "Nekomen") {
      return res.status(403).json({ error: "管理者権限が必要です。Administrator privileges are required." });
    }

    const deletedApplication = await ApprovedApplication.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ error: "データが見つかりません。Data not found." });
    }

    res.status(200).json({ message: "応募データを削除しました。The application data has been deleted." });
  } catch (error) {
    console.error("❌ Error deleting application:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました。A server error has occurred." });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
