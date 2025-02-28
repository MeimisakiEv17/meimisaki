import React, { useState, useEffect } from "react";

const ApplyForm = ({ fetchApproved }) => {
  const [formData, setFormData] = useState({
    name: "",
    federation: "",
    start_time: "",
    end_time: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [applications, setApplications] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startTimeISO = new Date(formData.start_time).toISOString();
    const endTimeISO = new Date(formData.end_time).toISOString();

    try {
      const response = await fetch("https://meimisakiserver.onrender.com/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          federation: formData.federation,
          start_time: startTimeISO,
          end_time: endTimeISO,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setFormData({ name: "", federation: "", start_time: "", end_time: "" });
        fetchApproved();
        fetchApplications();
      } else {
        alert(`応募に失敗しました: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("サーバーエラーが発生しました");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("https://meimisakiserver.onrender.com/approved");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error("Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://meimisakiserver.onrender.com/delete-application/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("応募データを削除しました");
        fetchApplications();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("サーバーエラーが発生しました");
    }
  };

  const handleAdminLogin = () => {
    if (password === "Nekomen") {
      setIsAdmin(true);
      alert("管理者モードに切り替わりました");
    } else {
      alert("パスワードが間違っています");
    }
  };

  return (
    <div>
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
      <hr />
      <h2>応募一覧</h2>
      <ul>
        {applications.map((app) => (
          <li key={app._id}>
            {app.name} - {app.federation} ({new Date(app.start_time).toLocaleString()} ~ {new Date(app.end_time).toLocaleString()})
            <button onClick={() => handleDelete(app._id)}>削除</button>
          </li>
        ))}
      </ul>
      <hr />
      <h2>管理者ログイン</h2>
      <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleAdminLogin}>ログイン</button>
      {isAdmin && <p>管理者モード: 副大統領スケジュールの情報を削除できます。</p>}
    </div>
  );
};

export default ApplyForm;
