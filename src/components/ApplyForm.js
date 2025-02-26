import React, { useState } from "react";

const ApplyForm = () => {
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
    try {
      const response = await fetch("https://meimisakiserver.onrender.com/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("応募が送信されました！");
        setFormData({ name: "", federation: "", start_time: "", end_time: "" });
      } else {
        alert("応募に失敗しました");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("サーバーエラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>応募フォーム</h2>
      <label>
        名前:
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </label>
      <br />
      <label>
        Federation:
        <input type="text" name="federation" value={formData.federation} onChange={handleChange} required />
      </label>
      <br />
      <label>
        開始時間:
        <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required />
      </label>
      <br />
      <label>
        終了時間:
        <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} required />
      </label>
      <br />
      <button type="submit">応募する</button>
    </form>
  );
};

export default ApplyForm;
