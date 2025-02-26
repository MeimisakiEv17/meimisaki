require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB に接続
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
const ApprovedApplication = mongoose.model("ApprovedApplication", ApplicationSchema);

// 📌 応募データを保存（POST /apply）
app.post("/apply", async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.status(201).json({ message: "Application saved successfully" });
  } catch (error) {
    console.error("Error saving application:", error);
    res.status(500).json({ error: "Failed to save application" });
  }
});

// 📌 すべての応募データを取得（GET /applications）
app.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// 📌 応募データを承認（POST /approve）
app.post("/approve", async (req, res) => {
  try {
    const { _id, name, federation, start_time, end_time } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing application ID" });
    }

    const application = await Application.findById(_id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const approvedApplication = new ApprovedApplication({
      name, federation, start_time, end_time
    });
    await approvedApplication.save();

    await Application.findByIdAndDelete(_id);

    res.status(201).json({ message: "Application approved successfully" });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ error: "Failed to approve application" });
  }
});

// 📌 承認済みのデータを取得（GET /approved）
app.get("/approved", async (req, res) => {
  try {
    const approved = await ApprovedApplication.find();
    res.status(200).json(approved);
  } catch (error) {
    console.error("Error fetching approved applications:", error);
    res.status(500).json({ error: "Failed to fetch approved applications" });
  }
});

// 📌 サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
