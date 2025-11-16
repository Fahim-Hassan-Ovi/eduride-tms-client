import { useState } from 'react';

export default function VehicleFormModal({ vehicle, onCancel, onSubmit, drivers = [], routes = [] }) {
  const [id, setId] = useState(vehicle?.id || `V-${Date.now() % 10000}`);
  const [name, setName] = useState(vehicle?.name || '');
  const [number, setNumber] = useState(vehicle?.number || '');
  const [regNumber, setRegNumber] = useState(vehicle?.regNumber || '');
  const [driver, setDriver] = useState(vehicle?.driver || '');
  const [route, setRoute] = useState(vehicle?.route || '');
  const [pictureData, setPictureData] = useState(vehicle?.picture || '');

  const handleFile = (file) => {
    if (!file) { setPictureData(''); return; }
    const reader = new FileReader();
    reader.onload = () => setPictureData(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return alert('ID and name are required');
    // Only send fields that are in the Vehicle schema (driver and route are not stored in Vehicle model)
    const vehicle = { 
      id: id.trim(), 
      name: name.trim(), 
      number: number || '', 
      regNumber: regNumber || '', 
      picture: pictureData || ''
    };
    onSubmit && onSubmit(vehicle);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">{vehicle ? 'Edit Vehicle' : 'Create Vehicle'}</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Vehicle ID</label>
            <input value={id} onChange={(e) => setId(e.target.value)} disabled={!!vehicle} className="w-full px-3 py-2 border rounded disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Number</label>
              <input value={number} onChange={(e) => setNumber(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm">Registration</label>
              <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm">Default Driver (Optional)</label>
            <select 
              value={driver} 
              onChange={(e) => setDriver(e.target.value)} 
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">-- Select Driver --</option>
              {drivers.map(d => (
                <option key={d._id || d.id || d.email} value={d.email || d.id}>
                  {d.name} ({d.email || d.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Default Route (Optional)</label>
            <select 
              value={route} 
              onChange={(e) => setRoute(e.target.value)} 
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">-- Select Route --</option>
              {routes.map(r => (
                <option key={r._id || r.id} value={r.id}>
                  {r.name || r.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Picture</label>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="w-full" />
            {pictureData && <img src={pictureData} alt="preview" className="mt-2 w-24 h-auto rounded" />}
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">{vehicle ? 'Update Vehicle' : 'Create Vehicle'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


