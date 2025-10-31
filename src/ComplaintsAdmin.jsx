import { useState } from 'react';

export default function ComplaintsAdmin({ complaints = [], onUpdate, onBack }) {
  const [editing, setEditing] = useState({});

  const submitFeedback = (id) => {
    const feedback = editing[id] || '';
    if (!feedback.trim()) return alert('Please enter feedback');
    onUpdate(id, { feedback, status: 'resolved' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Complaints</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded">Back</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Driver</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.student}</td>
                <td className="px-4 py-2">{c.driverId}</td>
                <td className="px-4 py-2">{c.message}</td>
                <td className="px-4 py-2">{c.status}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <input placeholder="Feedback" value={editing[c.id] || ''} onChange={(e) => setEditing(prev => ({ ...prev, [c.id]: e.target.value }))} className="px-2 py-1 border rounded" />
                    <button onClick={() => submitFeedback(c.id)} className="px-3 py-1 bg-green-600 text-white rounded">Submit</button>
                  </div>
                  {c.feedback && <p className="text-xs text-gray-600 mt-2">Feedback: {c.feedback}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


