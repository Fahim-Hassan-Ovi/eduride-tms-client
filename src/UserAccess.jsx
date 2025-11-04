import { useEffect, useState } from 'react';
import UserFormModal from './UserFormModal.jsx';
import { apiFetch } from './utils/api';

const roles = ['student','teacher','admin','staff','driver'];

export default function UserAccess({ token }) {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/auth/users');
        const data = await res.json();
        setUsers(data.items || data || []);
      } catch (e) {
        // fallback to empty list
        setUsers([]);
      }
    })();
  }, []);

  const changeRole = async (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await apiFetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
    } catch (e) { console.warn('change role failed', e); }
  };

  const createUser = async (user, password) => {
    try {
      const res = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: user.email, password, name: user.name, role: user.role }) });
      const data = await res.json();
      setUsers(prev => [{ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role }, ...prev]);
    } catch (e) { console.warn('create user failed', e); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Create User</button>
      </div>
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

      {showCreate && <UserFormModal onCancel={() => setShowCreate(false)} onSubmit={(user, password) => { createUser(user, password); setShowCreate(false); }} />}
    </div>
  );
}


