import { useState, useEffect } from "react";
import Card from './ui/card';
import Button from './ui/button';
import Calendar from './ui/calendar';
import Input from './ui/input';

export default function VPApprovalSystem() {
  const [form, setForm] = useState({ name: "", federation: "", start_time: null, end_time: null });
  const [approved, setApproved] = useState([]);

  // 📌 承認済みスケジュールを取得
  const fetchApproved = async () => {
    try {
      const response = await fetch("https://meimisakiserver.onrender.com/approved");
      if (response.ok) {
        const data = await response.json();
        // 🔹 Start Time の昇順 & 現在時刻より過去のものを削除
        const sortedData = data
          .filter(app => new Date(app.start_time) > new Date())
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setApproved(sortedData);
      } else {
        console.error("Failed to fetch approved applications");
      }
    } catch (error) {
      console.error("Error fetching approved applications:", error);
    }
  };

  // 📌 初回読み込み時にデータ取得
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">1135サーバー VPシステム (1135 Server VP System)</h1>
      <Card className="p-4 my-4">
        <h2 className="text-lg">副大統領応募フォーム (Vice President Application Form)</h2>
        <div className="mb-2 font-bold">Name</div>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="mb-2 font-bold">Federation</div>
        <Input value={form.federation} onChange={(e) => setForm({ ...form, federation: e.target.value })} />
        <div className="mb-2 font-bold">Start Time</div>
        <Calendar
          selected={form.start_time}
          onChange={(date) => setForm({ ...form, start_time: date })}
          showTimeSelect
          timeIntervals={60}
          dateFormat="yyyy/MM/dd HH:mm"
        />
        <div className="mb-2 font-bold">End Time</div>
        <Calendar
          selected={form.end_time}
          onChange={(date) => setForm({ ...form, end_time: date })}
          showTimeSelect
          timeIntervals={60}
          dateFormat="yyyy/MM/dd HH:mm"
        />
        <Button onClick={handleApply}>応募する (Apply)</Button>
      </Card>

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
              </tr>
            </thead>
            <tbody>
              {approved.map((app) => (
                <tr key={app._id}>
                  <td className="border border-gray-500 px-4 py-2">{app.name}</td>
                  <td className="border border-gray-500 px-4 py-2">{app.federation}</td>
                  <td className="border border-gray-500 px-4 py-2">{new Date(app.start_time).toLocaleString()}</td>
                  <td className="border border-gray-500 px-4 py-2">{new Date(app.end_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>現在、承認されたスケジュールはありません。</p>
        )}
      </Card>
    </div>
  );
}
