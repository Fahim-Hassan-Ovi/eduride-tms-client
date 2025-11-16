import { useState, useEffect } from 'react';

export default function RouteFormModal({ route, onCancel, onSubmit }) {
  const [id, setId] = useState(route?.id || `R-${Date.now() % 10000}`);
  const [name, setName] = useState(route?.name || '');
  const [start, setStart] = useState(route?.start || '');
  const [end, setEnd] = useState(route?.end || '');
  const [stops, setStops] = useState(route?.stops && Array.isArray(route.stops) ? route.stops : (route?.stops ? [route.stops] : []));
  const [stopInput, setStopInput] = useState('');
  const [departure, setDeparture] = useState(route?.departure || '09:00');
  const [arrival, setArrival] = useState(route?.arrival || '09:45');
  const [pathText, setPathText] = useState(route?.path ? route.path.map(p => p.join(',')).join('\n') : '');

  useEffect(() => {
    if (route) {
      setId(route.id);
      setName(route.name || '');
      setStart(route.start || '');
      setEnd(route.end || '');
      setStops(route.stops && Array.isArray(route.stops) ? route.stops : []);
      setDeparture(route.departure || '');
      setArrival(route.arrival || '');
      setPathText(route.path ? route.path.map(p => p.join(',')).join('\n') : '');
    }
  }, [route]);

  const addStop = () => {
    if (stopInput.trim()) {
      setStops([...stops, stopInput.trim()]);
      setStopInput('');
    }
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return alert('ID and name required');
    const path = pathText.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split(',').map(Number);
      return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? parts : null;
    }).filter(Boolean);
    const route = { 
      id: id.trim(), 
      name: name.trim(), 
      start: start || '', 
      end: end || '', 
      stops: stops.filter(s => s.trim()),
      departure: departure || '', 
      arrival: arrival || '', 
      path: path.length > 0 ? path : undefined 
    };
    onSubmit && onSubmit(route);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">{route ? 'Edit Route' : 'Create Route'}</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Route ID</label>
            <input value={id} onChange={(e) => setId(e.target.value)} disabled={!!route} className="w-full px-3 py-2 border rounded disabled:bg-gray-100" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
            <div className="flex space-x-2 mb-2">
              <input 
                type="text" 
                value={stopInput} 
                onChange={(e) => setStopInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                placeholder="Enter stop name and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <button type="button" onClick={addStop} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stops.map((stop, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{stop}</span>
                  <button type="button" onClick={() => removeStop(idx)} className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm">Path (lat,lng each line)</label>
            <textarea value={pathText} onChange={(e) => setPathText(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">{route ? 'Update Route' : 'Create Route'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


