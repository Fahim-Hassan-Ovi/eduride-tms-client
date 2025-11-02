import { useState } from 'react';
import DriverFormModal from './DriverFormModal.jsx';

export default function DriversManager({ driversProp = [], onChange, onRegisterDriver }) {
  const [drivers, setDrivers] = useState(driversProp.length ? driversProp : [
    { id: 'D-201', name: 'John Doe', phone: '555-0101', email: 'john@example.com', picture: 'https://placehold.co/64x64?text=J' },
    { id: 'D-202', name: 'Mamun Khan', phone: '01711-000000', email: 'mamun@example.com', picture: 'https://placehold.co/64x64?text=M' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');

  const addDriver = (driver) => {
    const newDriver = driver || { id: `D-${Math.floor(Math.random()*900)+200}`, name: `Driver ${drivers.length+1}`, phone: '' };
    const updated = [newDriver, ...drivers];
    setDrivers(updated);
    onChange && onChange(updated);
    if (driver && onRegisterDriver) onRegisterDriver(driver);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Drivers</h2>
        <div className="flex items-center space-x-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search drivers" className="px-3 py-2 border rounded" />
          <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Add Driver</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {drivers.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase())).map(d => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-2">{d.id}</td>
                <td className="px-4 py-2 flex items-center space-x-3"><img src={d.picture} alt={d.name} className="w-8 h-8 rounded-full" /> <span>{d.name}</span></td>
                <td className="px-4 py-2">{d.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DriverFormModal
          onCancel={() => setShowModal(false)}
          onSubmit={(driver) => { addDriver(driver); setShowModal(false); }}
        />
      )}
    </div>
  );
}


