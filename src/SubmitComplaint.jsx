import { useState } from 'react';

export default function SubmitComplaint({ vehicles = [], studentName = '', onSubmit, onBack }) {
  const [driverId, setDriverId] = useState(vehicles[0]?.id || '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrors('Please describe the complaint');
      return;
    }
    const newComplaint = {
      id: `C-${Date.now()}`,
      student: studentName || 'Anonymous',
      driverId,
      message: message.trim(),
      status: 'open',
      feedback: null,
    };
    onSubmit(newComplaint);
    setMessage('');
    setErrors('');
    if (onBack) onBack();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Submit Complaint</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded">Back</button>
      </div>

      <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-3">
        <label className="block text-sm">Against Driver</label>
        <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full px-3 py-2 border rounded">
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.driver}</option>)}
        </select>

        <label className="block text-sm">Complaint</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded" rows={4}></textarea>
        {errors && <p className="text-red-500 text-sm">{errors}</p>}

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit Complaint</button>
        </div>
      </form>
    </div>
  );
}


