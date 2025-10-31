import { useState, useMemo } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';

export default function RoutesManager() {
  const [routes, setRoutes] = useState([
    { id: 'R-001', name: 'Route A', start: 'School', end: 'Downtown', stops: 6, departure: '07:30', arrival: '08:15' },
    { id: 'R-002', name: 'Route B', start: 'North Gate', end: 'East Park', stops: 4, departure: '08:00', arrival: '08:40' },
  ]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('name');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return routes
      .filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .sort((a,b) => (a[sortKey] > b[sortKey] ? 1 : -1));
  }, [routes, query, sortKey]);

  const addRoute = () => {
    const newRoute = {
      id: `R-${String(Math.floor(Math.random()*900)+100)}`,
      name: `Route ${String.fromCharCode(65 + routes.length)}`,
      start: 'New Start',
      end: 'New End',
      stops: 3,
      departure: '09:00',
      arrival: '09:45',
    };
    setRoutes(prev => [newRoute, ...prev]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Routes Manager</h2>
        <div className="flex items-center space-x-3">
          <input
            placeholder="Search routes or id..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="name">Name</option>
            <option value="id">ID</option>
          </select>
          <button onClick={addRoute} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> <span>Add Route</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.stops}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.departure}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.arrival}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="inline-flex items-center space-x-2">
                    <button className="p-2 rounded-md bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 rounded-md bg-red-50 text-red-600"><Trash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


