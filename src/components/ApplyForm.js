import React, { useState } from "react";

const ApplyForm = ({ fetchApproved }) => {
  const [formData, setFormData] = useState({
    name: "",
    federation: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 📌 日本時間をUTCに変換
    const startTimeJST = new Date(formData.start_time);
    const endTimeJST = new Date(formData.end_time);
    const startTimeUTC = new Date(startTimeJST.getTime() - 9 * 60 * 60 * 1000).toISOString();
    const endTimeUTC = new Date(endTimeJST.getTime() - 9 * 60 * 60 * 1000).toISOString();

    try {
      const response = await fetch("https://meimisakiserver.onrender.com/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          federation: formData.federation,
          start_time: startTimeUTC,
          end_time: endTimeUTC,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setFormData({ name: "", federation: "", start_time: "", end_time: "" });
        fetchApproved(); // スケジュールを更新
      } else {
        alert(`応募に失敗しました。Application failed.: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("サーバーエラーが発生しました。A server error has occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>応募フォーム</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ marginLeft: "60px" }}>
          <label>
            名前:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginLeft: "60px" }}>
          <label>
            開始時間:
            <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ marginLeft: "60px" }}>
          <label>
            Federation:
            <input type="text" name="federation" value={formData.federation} onChange={handleChange} required />
          </label>
        </div>
        <div style={{ marginLeft: "60px" }}>
          <label>
            終了時間:
            <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
          </label>
        </div>
      </div>
      <button type="submit">応募する</button>
    </form>
  );
};

export default ApplyForm;
