import { useState } from 'react';

export default function BusesManager({ busesProp = [], drivers = [], onChange }) {
  const [buses, setBuses] = useState(busesProp.length ? busesProp : [
    { id: 'Bus-101', plate: 'ABC-101', capacity: 40, upDriver: null, downDriver: null, route: 'Route A', departure: '07:30' },
  ]);

  const addBus = () => {
    const newBus = { id: `Bus-${Math.floor(Math.random()*900)+200}`, plate: 'NEW-PLT', capacity: 30, upDriver: null, downDriver: null, route: 'New Route', departure: '08:00' };
    const updated = [newBus, ...buses];
    setBuses(updated);
    onChange && onChange(updated);
  };

  const assignDriver = (busId, role, driverId) => {
    const updated = buses.map(b => b.id === busId ? { ...b, [role]: driverId } : b);
    setBuses(updated);
    onChange && onChange(updated);
  };

  const updateField = (busId, field, value) => {
    const updated = buses.map(b => b.id === busId ? { ...b, [field]: value } : b);
    setBuses(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Buses</h2>
        <button onClick={addBus} className="px-3 py-2 bg-blue-600 text-white rounded">Add Bus</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Plate</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              <th className="px-4 py-2 text-left">Up Driver</th>
              <th className="px-4 py-2 text-left">Down Driver</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(b => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2">{b.id}</td>
                <td className="px-4 py-2">{b.plate}</td>
                <td className="px-4 py-2">{b.capacity}</td>
                <td className="px-4 py-2">
                  <select value={b.upDriver || ''} onChange={(e) => assignDriver(b.id, 'upDriver', e.target.value)} className="px-2 py-1 border rounded">
                    <option value="">-- assign --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select value={b.downDriver || ''} onChange={(e) => assignDriver(b.id, 'downDriver', e.target.value)} className="px-2 py-1 border rounded">
                    <option value="">-- assign --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input value={b.route} onChange={(e) => updateField(b.id, 'route', e.target.value)} className="px-2 py-1 border rounded" />
                </td>
                <td className="px-4 py-2">
                  <input value={b.departure} onChange={(e) => updateField(b.id, 'departure', e.target.value)} className="px-2 py-1 border rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


