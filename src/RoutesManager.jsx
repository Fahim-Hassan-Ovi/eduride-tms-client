import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { Plus, Edit, Trash, X } from 'lucide-react';
import RouteFormModal from './RouteFormModal.jsx';

export default function RoutesManager({ routesProp = [], token = '', onChange }) {
  const [routes, setRoutes] = useState(routesProp.length ? routesProp : []);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [editingRoute, setEditingRoute] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await apiFetch('/api/routes');
        if (!res.ok) throw new Error(`Failed to fetch routes: ${res.status}`);
        const data = await res.json();
        setRoutes(data.items || data || []);
        onChange && onChange(data.items || data || []);
      } catch (e) {
        console.error('Error fetching routes:', e);
        setRoutes(routesProp);
      }
    };
    fetchRoutes();
  }, []);

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase();
    return (routes || [])
      .filter(r => {
        const name = (r && r.name) ? String(r.name).toLowerCase() : '';
        const id = (r && r.id) ? String(r.id).toLowerCase() : '';
        return name.includes(q) || id.includes(q);
      })
      .sort((a,b) => ((a && a[sortKey]) > (b && b[sortKey]) ? 1 : -1));
  }, [routes, query, sortKey]);

  const addRoute = () => {
    setShowCreateModal(true);
  };

  const startEdit = (r) => {
    setEditingRoute(r);
  };

  const saveRoute = async (routeData) => {
    try {
      const res = await apiFetch(`/api/routes/${routeData.id}`, { method: 'PUT', body: JSON.stringify(routeData) });
      if (!res.ok) {
        const text = await res.text();
        console.error('save route failed:', res.status, text);
        alert(`Failed to update route: ${text}`);
        return;
      }
      const doc = await res.json();
      setRoutes(prev => {
        const updated = prev.map(r => r.id === routeData.id ? doc : r);
        onChange && onChange(updated);
        return updated;
      });
      setEditingRoute(null);
    } catch (e) { 
      console.warn('save route failed', e);
      alert('Failed to update route. Check console for details.');
    }
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
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
                <td className="px-6 py-4 text-sm text-gray-700">
                  {Array.isArray(r.stops) && r.stops.length > 0 ? (
                    <span className="text-xs">{r.stops.length} stops</span>
                  ) : (
                    <span className="text-gray-400">No stops</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.start || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.end || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.departure || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.arrival || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="inline-flex items-center space-x-2">
                    <button onClick={() => startEdit(r)} className="p-2 rounded-md bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        try {
                          const res = await apiFetch(`/api/routes/${r.id}`, { method: 'DELETE' });
                          if (!res.ok) {
                            const text = await res.text();
                            console.error('delete route failed:', res.status, text);
                            alert(`Failed to delete route: ${text}`);
                            return;
                          }
                          setRoutes(prev => {
                            const updated = prev.filter(pr => pr.id !== r.id);
                            onChange && onChange(updated);
                            return updated;
                          });
                        } catch(e) { 
                          console.warn('delete route failed', e);
                          alert('Failed to delete route. Check console for details.');
                        }
                    }} className="p-2 rounded-md bg-red-50 text-red-600"><Trash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRoute && (
        <RouteFormModal 
          route={editingRoute}
          onCancel={() => setEditingRoute(null)} 
          onSubmit={saveRoute} 
        />
      )}

      {showCreateModal && (
        <RouteFormModal onCancel={() => setShowCreateModal(false)} onSubmit={async (route) => {
          try {
            const res = await apiFetch('/api/routes', { method: 'POST', body: JSON.stringify(route) });
            if (!res.ok) {
              const txt = await res.text();
              console.error('route create error', res.status, txt);
              alert(`Failed to create route: ${txt}`);
              return;
            }
            const doc = await res.json();
            setRoutes(prev => {
              const updated = [doc, ...prev];
              onChange && onChange(updated);
              return updated;
            });
          } catch (e) { 
            console.warn('route create failed', e);
            alert('Failed to create route. Check console for details.');
          }
          setShowCreateModal(false);
        }} />
      )}
    </div>
  );
}


