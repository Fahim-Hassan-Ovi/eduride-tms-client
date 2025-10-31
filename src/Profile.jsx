import { useState } from 'react';

export default function Profile({ user, onSave, onBack }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded">Back</button>
      </div>
      <div className="bg-white rounded shadow p-4 space-y-3">
        <div>
          <label className="block text-sm">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Date of Birth</label>
          <input value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="flex justify-end">
          <button onClick={() => onSave && onSave({ ...user, name, email, dob })} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}


