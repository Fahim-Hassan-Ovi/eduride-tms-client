import { useState } from 'react';

export default function DriverFormModal({ onCancel, onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pictureData, setPictureData] = useState('');

  const handleFile = (file) => {
    if (!file) { setPictureData(''); return; }
    const reader = new FileReader();
    reader.onload = () => setPictureData(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name required');
    const driver = { id: `D-${Date.now()}`, name: name.trim(), phone: phone.trim(), email: email.trim(), picture: pictureData };
    onSubmit && onSubmit(driver);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Register Driver</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Picture (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="w-full" />
            {pictureData && <img src={pictureData} alt="preview" className="mt-2 w-24 h-auto rounded" />}
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Register Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
}


