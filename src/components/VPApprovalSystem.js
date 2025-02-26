import { useState } from "react";
import Card from './ui/card';
import Button from './ui/button';
import Calendar from './ui/calendar';
import Input from './ui/input';

export default function VPApprovalSystem() {
  const [form, setForm] = useState({ name: "", Federation: "", start_time: null, end_time: null });
  const [applications, setApplications] = useState([]);
  const [approved, setApproved] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // 仮の管理者フラグ

  const handleApply = () => {
    if (form.name && form.Federation && form.start_time && form.end_time) {
      setApplications([...applications, form]);
      setForm({ name: "", Federation: "", start_time: null, end_time: null });
    }
  };

  const handleApprove = (index) => {
    if (isAdmin) {
      setApproved([...approved, applications[index]]);
      setApplications(applications.filter((_, i) => i !== index));
    }
  };

  const handleAdminLogin = () => {
    // 管理者ログインのロジックを追加。ここでは仮に常にtrueを返す
    setIsAdmin(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">1135サーバー VPシステム(1135 Server VP System)</h1>
      <Card className="p-4 my-4">
        <h2 className="text-lg">副大統領応募フォーム(Vice President application form)</h2>
        <div className="mb-2 font-bold">Name</div>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="mb-2 font-bold">Federation</div>	
        <Input
          value={form.Federation}
          onChange={(e) => setForm({ ...form, Federation: e.target.value })}
        />
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
        <Button onClick={handleApply}>応募する(Application)</Button>
      </Card>
      <Button onClick={handleAdminLogin}>管理者ログイン</Button>
      {isAdmin && (
        <Card className="p-4 my-4">
          <h2 className="text-lg">応募一覧（管理者用）</h2>
          {applications.map((app, index) => (
            <div key={index} className="flex justify-between">
              <span>{app.name} - {app.Federation} ({app.start_time?.toLocaleString()}~{app.end_time?.toLocaleString()})</span>
              <Button onClick={() => handleApprove(index)}>承認</Button>
            </div>
          ))}
        </Card>
      )}
      <Card className="p-4 my-4">
        <h2 className="text-lg">副大統領スケジュール(Vice President's schedule)</h2>
        {approved.map((app, index) => (
          <div key={index}>{app.name} - {app.Federation} ({app.start_time?.toLocaleString()}~{app.end_time?.toLocaleString()})</div>
        ))}
      </Card>
    </div>
  );
}
