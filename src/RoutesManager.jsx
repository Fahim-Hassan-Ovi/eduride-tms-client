import { useState, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { Plus, Edit, Trash } from 'lucide-react';

export default function RoutesManager({ routesProp = [], token = '', onChange }) {
  const [routes, setRoutes] = useState(routesProp.length ? routesProp : [
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

  const [editingPath, setEditingPath] = useState('');

  const addRoute = () => {
    const newRoute = {
      id: `R-${String(Math.floor(Math.random()*900)+100)}`,
      name: `Route ${String.fromCharCode(65 + routes.length)}`,
      start: 'New Start',
      end: 'New End',
      stops: 3,
      departure: '09:00',
      arrival: '09:45',
      path: [],
    };
    (async () => {
      try {
        const res = await apiFetch('/api/routes', { method: 'POST', body: JSON.stringify(newRoute) });
        const doc = await res.json();
        setRoutes(prev => [doc, ...prev]);
        onChange && onChange([doc, ...routes]);
      } catch (e) { console.warn('create route failed', e); setRoutes(prev => [newRoute, ...prev]); onChange && onChange([newRoute, ...routes]); }
    })();
  };

  const startEdit = (r) => {
    setEditingPath(r.path ? r.path.map(p => p.join(',')).join('\n') : '');
  };

  const savePath = (id) => {
    const lines = editingPath.split('\n').map(l => l.trim()).filter(Boolean);
    const path = lines.map(l => { const [lat,lng] = l.split(',').map(Number); return [lat, lng]; });
    (async () => {
      try {
        const res = await apiFetch(`/api/routes/${id}`, { method: 'PUT', body: JSON.stringify({ path }) });
        const doc = await res.json();
        setRoutes(prev => prev.map(r => r.id === id ? doc : r));
        onChange && onChange(routes.map(r => r.id === id ? doc : r));
      } catch (e) { console.warn('save path failed', e); setRoutes(prev => prev.map(r => r.id === id ? { ...r, path } : r)); onChange && onChange(routes); }
      setEditingPath('');
    })();
  };

  const handleSaveCurrentPath = () => {
    const found = routes.find(r => r.path && r.path.map(p => p.join(',')).join('\n') === editingPath);
    const id = found ? found.id : (routes[0] ? routes[0].id : undefined);
    if (id) savePath(id);
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
                    <button onClick={() => startEdit(r)} className="p-2 rounded-md bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        try {
                          await fetch(`/api/routes/${r.id}`, { method: 'DELETE', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                          setRoutes(prev => prev.filter(pr => pr.id !== r.id));
                          onChange && onChange(routes.filter(pr => pr.id !== r.id));
                        } catch(e) { console.warn('delete route failed', e); setRoutes(prev => prev.filter(pr => pr.id !== r.id)); }
                    }} className="p-2 rounded-md bg-red-50 text-red-600"><Trash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPath !== '' && (
        <div className="mt-4 bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Edit Route Path (lat,lng per line)</h3>
          <textarea value={editingPath} onChange={(e) => setEditingPath(e.target.value)} rows={6} className="w-full border rounded p-2"></textarea>
          <div className="mt-2 flex justify-end space-x-2">
            <button onClick={() => setEditingPath('')} className="px-3 py-1 bg-gray-100 rounded">Cancel</button>
            <button onClick={handleSaveCurrentPath} className="px-3 py-1 bg-blue-600 text-white rounded">Save Path</button>
          </div>
        </div>
      )}
    </div>
  );
}


