import { useEffect, useState } from 'react';
import UserFormModal from './UserFormModal.jsx';
import UserViewModal from './UserViewModal.jsx';
import { apiFetch } from './utils/api';
import { Eye, Pencil, Trash } from 'lucide-react';

const roles = ['student','teacher','admin','staff','driver'];

export default function UserAccess({ token }) {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/users');
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setUsers(data.items || data || []);
      } catch (e) {
        console.error('Error fetching users:', e);
        setUsers([]);
      }
    })();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      const res = await apiFetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
      if (!res.ok) {
        const text = await res.text();
        console.error('change role failed:', res.status, text);
        return;
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u._id === userId || u.id === userId ? updated : u));
    } catch (e) { 
      console.warn('change role failed', e); 
    }
  };

  const createUser = async (user, password) => {
    try {
      const res = await apiFetch('/api/auth/register', { 
        method: 'POST', 
        body: JSON.stringify({ 
          email: user.email, 
          password, 
          name: user.name, 
          role: user.role,
          phone: user.phone || '',
          picture: user.picture || ''
        }) 
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('create user failed:', res.status, text);
        alert(`Failed to create user: ${text}`);
        return;
      }
      const data = await res.json();
      setUsers(prev => [data.user, ...prev]);
    } catch (e) { 
      console.warn('create user failed', e);
      alert('Failed to create user. Check console for details.');
    }
  };

  const updateUser = async (user, password) => {
    try {
      const userId = user._id || user.id;
      const updateData = {
        name: user.name,
        role: user.role,
        phone: user.phone || '',
        picture: user.picture || ''
      };
      if (password) {
        // Password update would need separate endpoint with hash
        alert('Password update not implemented yet');
      }
      const res = await apiFetch(`/api/users/${userId}`, { 
        method: 'PUT', 
        body: JSON.stringify(updateData) 
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('update user failed:', res.status, text);
        alert(`Failed to update user: ${text}`);
        return;
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? updated : u));
      setEditingUser(null);
    } catch (e) { 
      console.warn('update user failed', e);
      alert('Failed to update user. Check console for details.');
    }
  };

  const deleteUser = async (userId) => {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text();
      console.error('delete user failed:', res.status, text);
      alert('Failed to delete user');
      return;
    }

    setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
  } catch (e) {
    console.warn('delete user failed', e);
    alert('Failed to delete. Check console.');
  }
};

  const filteredUsers = users.filter(u => {
    const q = query.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || 
           (u.email || '').toLowerCase().includes(q) ||
           (u.role || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create User
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(u => {
              const userId = u._id || u.id;
              return (
                <tr key={userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{u.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <select 
                      value={u.role || 'student'} 
                      onChange={(e) => changeRole(userId, e.target.value)} 
                      className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setViewingUser(u)} 
                        className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(u)} 
                        className="p-2 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                      onClick={() => deleteUser(userId)}
                        className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-yellow-100"
                        title="Edit user"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <UserFormModal 
          onCancel={() => setShowCreate(false)} 
          onSubmit={(user, password) => { createUser(user, password); setShowCreate(false); }} 
        />
      )}
      {editingUser && (
        <UserFormModal 
          user={editingUser}
          onCancel={() => setEditingUser(null)} 
          onSubmit={(user, password) => { updateUser(user, password); }} 
        />
      )}
      {viewingUser && (
        <UserViewModal 
          user={viewingUser}
          onClose={() => setViewingUser(null)} 
        />
      )}
    </div>
  );
}


