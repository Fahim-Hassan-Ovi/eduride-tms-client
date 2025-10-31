import { useState } from 'react';

const roles = ['student','teacher','admin','staff','driver'];

export default function UserAccess() {
  const [users, setUsers] = useState([
    { id: 'U-100', name: 'Alice Johnson', email: 'alice@example.com', role: 'student' },
    { id: 'U-101', name: 'Bob Smith', email: 'bob@example.com', role: 'teacher' },
    { id: 'U-102', name: 'Clara Lee', email: 'clara@example.com', role: 'driver' },
  ]);

  const changeRole = (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 text-sm text-gray-700">{u.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{u.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="px-2 py-1 border rounded">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button onClick={() => alert(`Viewing ${u.name}`)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


