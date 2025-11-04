import { useState } from 'react';

export default function UserFormModal({ onCancel, onSubmit, roles = ['student','teacher','driver','staff','admin'] }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return alert('Email and password required');
    onSubmit && onSubmit({ email, name, role }, password);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Create User</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}


