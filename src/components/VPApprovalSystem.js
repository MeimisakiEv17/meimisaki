import { useState, useEffect } from "react";
import Card from './ui/card';
import Button from './ui/button';
import Calendar from './ui/calendar';
import Input from './ui/input';

export default function VPApprovalSystem() {
  const [form, setForm] = useState({ name: "", federation: "", start_time: null, end_time: null });
  const [approved, setApproved] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 📌 承認済みスケジュールを取得（現時刻から24時間後まで）
  const fetchApproved = async () => {
    try {
      const response = await fetch("https://meimisakiserver.onrender.com/approved");
      if (response.ok) {
        const data = await response.json();

        const now = new Date();
        const oneDayLater = new Date(now);
        oneDayLater.setDate(now.getDate() + 1);

        // 現時刻から24時間後までのデータのみ取得
        const filteredData = data.filter(app =>
          new Date(app.end_time) > now && new Date(app.end_time) <= oneDayLater
        );

        setApproved(filteredData);
      } else {
        console.error("Failed to fetch approved applications");
      }
    } catch (error) {
      console.error("Error fetching approved applications:", error);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  // 📌 応募を送信する
  const handleApply = async () => {
    if (!form.name || !form.federation || !form.start_time || !form.end_time) {
      alert("すべての項目を入力してください！");
      return;
    }

    try {
      const response = await fetch("https://meimisakiserver.onrender.com/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setForm({ name: "", federation: "", start_time: null, end_time: null });
        fetchApproved();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("サーバーエラーが発生しました");
    }
  };

  // 📌 管理者ログイン処理
  const handleAdminLogin = () => {
    const password = prompt("管理者パスワードを入力してください:");
    if (password === "Nekomen") {
      alert("管理者ログイン成功！");
      setIsAdmin(true);
    } else {
      alert("パスワードが違います！");
    }
  };

  // 📌 応募を削除（管理者のみ）
  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("管理者のみ削除できます！");
      return;
    }

    const confirmDelete = window.confirm("本当にこの応募を削除しますか？");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://meimisakiserver.onrender.com/delete-application/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "Nekomen" })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchApproved();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("サーバーエラーが発生しました。");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">1135サーバー VPシステム (1135 Server VP System)</h1>

      {/* 📌 応募フォーム */}
      <Card className="p-4 my-4">
        <h2 className="text-lg">副大統領応募フォーム (Vice President Application Form)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 font-bold">Name</div>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <div className="mb-2 font-bold">Start Time</div>
            <Calendar
              selected={form.start_time}
              onChange={(date) => setForm({ ...form, start_time: date })}
              showTimeSelect
              timeIntervals={60}
              dateFormat="yyyy/MM/dd HH:mm"
            />
          </div>
          <div>
            <div className="mb-2 font-bold">Federation</div>
            <Input value={form.federation} onChange={(e) => setForm({ ...form, federation: e.target.value })} />
          </div>
          <div>
            <div className="mb-2 font-bold">End Time</div>
            <Calendar
              selected={form.end_time}
              onChange={(date) => setForm({ ...form, end_time: date })}
              showTimeSelect
              timeIntervals={60}
              dateFormat="yyyy/MM/dd HH:mm"
            />
          </div>
        </div>
        <Button onClick={handleApply} className="mt-4">応募する (Apply)</Button>
      </Card>

      {/* 📌 管理者ログインボタン */}
      {!isAdmin && (
        <Button onClick={handleAdminLogin} className="mb-4">
          管理者ログイン (Admin Login)
        </Button>
      )}

      {/* 📌 副大統領スケジュール（現時刻から24時間後まで）*/}
      <Card className="p-4 my-4">
        <h2 className="text-lg">副大統領スケジュール (Vice President's Schedule)</h2>
        {approved.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-500 px-4 py-2">Name</th>
                <th className="border border-gray-500 px-4 py-2">Federation</th>
                <th className="border border-gray-500 px-4 py-2">Start Time</th>
                <th className="border border-gray-500 px-4 py-2">End Time</th>
                {isAdmin && <th className="border border-gray-500 px-4 py-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              {approved.map((app) => (
                <tr key={app._id}>
                  <td className="border border-gray-500 px-4 py-2">{app.name}</td>
                  <td className="border border-gray-500 px-4 py-2">{app.federation}</td>
                  <td className="border border-gray-500 px-4 py-2">{new Date(app.start_time).toLocaleString()}</td>
                  <td className="border border-gray-500 px-4 py-2">{new Date(app.end_time).toLocaleString()}</td>
                  {isAdmin && (
                    <td className="border border-gray-500 px-4 py-2">
                      <Button onClick={() => handleDelete(app._id)} className="bg-red-500 text-white">
                        削除 (Delete)
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>現時刻から24時間後までのスケジュールはありません。</p>
        )}
      </Card>
    </div>
  );
}
