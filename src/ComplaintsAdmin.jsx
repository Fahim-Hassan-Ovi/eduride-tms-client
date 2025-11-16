import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';

export default function ComplaintsAdmin({ complaints: complaintsProp = [], onUpdate, onBack, token }) {
  const [complaints, setComplaints] = useState(complaintsProp);
  const [editing, setEditing] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch('/api/complaints');
        if (!res.ok) throw new Error(`Failed to fetch complaints: ${res.status}`);
        const data = await res.json();
        setComplaints(data.items || data || []);
      } catch (e) {
        console.error('Error fetching complaints:', e);
        setComplaints(complaintsProp);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const submitFeedback = async (id, status = 'resolved') => {
    const feedback = editing[id] || '';
    try {
      const update = { 
        status,
        ...(feedback.trim() ? { feedback: feedback.trim() } : {})
      };
      const res = await apiFetch(`/api/complaints/${id}`, { method: 'PUT', body: JSON.stringify(update) });
      if (!res.ok) {
        const text = await res.text();
        console.error('update complaint failed:', res.status, text);
        alert(`Failed to update complaint: ${text}`);
        return;
      }
      const doc = await res.json();
      setComplaints(prev => prev.map(c => c.id === id ? doc : c));
      setEditing(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      onUpdate && onUpdate(id, update);
    } catch (e) {
      console.warn('update complaint failed', e);
      alert('Failed to update complaint. Check console for details.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Complaints</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded">Back</button>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No complaints found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.student || 'Anonymous'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.driverId || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{c.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      c.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.status || 'open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    {c.feedback ? (
                      <p className="text-gray-600">{c.feedback}</p>
                    ) : (
                      <input 
                        type="text"
                        placeholder="Enter feedback..." 
                        value={editing[c.id] || ''} 
                        onChange={(e) => setEditing(prev => ({ ...prev, [c.id]: e.target.value }))} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {!c.feedback ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => submitFeedback(c.id, 'in_progress')} 
                          className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                          Mark In Progress
                        </button>
                        <button 
                          onClick={() => submitFeedback(c.id, 'resolved')} 
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-600 text-xs">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


