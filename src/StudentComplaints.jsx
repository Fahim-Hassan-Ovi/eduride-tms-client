import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';

export default function StudentComplaints({ studentEmail, onBack, token }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch('/api/complaints');
        if (!res.ok) throw new Error(`Failed to fetch complaints: ${res.status}`);
        const data = await res.json();
        const allComplaints = data.items || data || [];
        // Filter complaints for this student
        const studentComplaints = allComplaints.filter(c => c.student === studentEmail || c.student === studentEmail?.split('@')[0]);
        setComplaints(studentComplaints);
      } catch (e) {
        console.error('Error fetching complaints:', e);
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [studentEmail]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Complaints</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">Back</button>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No complaints found.</p>
          <p className="text-sm mt-2">You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.id}</td>
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
                      <p className="text-gray-400 italic">No feedback yet</p>
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

