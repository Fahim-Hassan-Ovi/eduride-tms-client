import { useState } from 'react';

export default function RouteFormModal({ onCancel, onSubmit }) {
  const [id, setId] = useState(`R-${Date.now() % 10000}`);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stops, setStops] = useState(3);
  const [departure, setDeparture] = useState('09:00');
  const [arrival, setArrival] = useState('09:45');
  const [pathText, setPathText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return alert('ID and name required');
    const path = pathText.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split(',').map(Number));
    const route = { id, name, start, end, stops: Number(stops), departure, arrival, path };
    onSubmit && onSubmit(route);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Create Route</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Route ID</label>
            <input value={id} onChange={(e) => setId(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Start</label>
              <input value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm">End</label>
              <input value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm">Stops</label>
            <input type="number" value={stops} onChange={(e) => setStops(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Path (lat,lng each line)</label>
            <textarea value={pathText} onChange={(e) => setPathText(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create Route</button>
          </div>
        </form>
      </div>
    </div>
  );
}


