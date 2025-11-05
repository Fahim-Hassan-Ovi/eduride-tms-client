import { useState } from 'react';

const nameRegex = /^[a-zA-Z\s'-]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const dobRegex = /^(\d{4})-(\d{2})-(\d{2})$/; // YYYY-MM-DD

export default function Registration({ onCancel, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [picture, setPicture] = useState('');
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPicture(base64);
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim() || !nameRegex.test(name)) e.name = 'Enter a valid name (letters, spaces, \' and - allowed)';
    if (!email.includes('@')) e.email = 'Enter a valid email';
    if (!dobRegex.test(dob)) e.dob = 'DOB must be in YYYY-MM-DD';
    else {
      const [_, y, m, d] = dob.match(dobRegex) || [];
      const date = new Date(`${y}-${m}-${d}`);
      if (isNaN(date.getTime())) e.dob = 'Enter a valid date';
    }
    if (!passwordRegex.test(password)) e.password = 'Password must be 8+ chars, 1 uppercase, 1 number, 1 special char';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const user = { id: `U-${Date.now()}`, name, email, dob, phone, picture };
    onRegister && onRegister(user, password);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Account</h2>
      <form onSubmit={submit} className="space-y-3 bg-white rounded shadow p-4">
        <div>
          <label className="block text-sm">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm">Date of Birth (YYYY-MM-DD)</label>
          <input value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3 py-2 border rounded" />
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border rounded" />
          {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
        </div>
        <div>
          <label className="block text-sm">Phone (Optional)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Profile Picture (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 border rounded" />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create Account</button>
        </div>
      </form>
    </div>
  );
}


