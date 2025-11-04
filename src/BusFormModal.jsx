import { useState } from 'react';

export default function BusFormModal({ vehicles = [], routes = [], onCancel, onSubmit }) {
  const [id, setId] = useState(`Bus-${Date.now() % 10000}`);
  const [plate, setPlate] = useState('');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [capacity, setCapacity] = useState(40);
  const [route, setRoute] = useState(routes[0]?.name || '');
  const [departure, setDeparture] = useState('08:00');

  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !plate.trim()) return alert('ID and plate are required');
    const bus = { id, plate, vehicleId, capacity: Number(capacity), upDriver: null, downDriver: null, route, departure };
    onSubmit && onSubmit(bus);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Create Bus</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Bus ID</label>
            <input value={id} onChange={(e) => setId(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Plate</label>
            <input value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Vehicle</label>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">-- select --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm">Capacity</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Route</label>
              <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">-- select --</option>
                {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm">Departure</label>
              <input type="time" value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create Bus</button>
          </div>
        </form>
      </div>
    </div>
  );
}


