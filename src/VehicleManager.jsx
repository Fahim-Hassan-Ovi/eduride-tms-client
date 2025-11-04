import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import VehicleFormModal from './VehicleFormModal.jsx';

export default function VehicleManager({ vehiclesProp = [], token = '', onChange }) {
  // Initialize vehicles with the prop, but useEffect will overwrite it with fresh data
  const [vehicles, setVehicles] = useState(vehiclesProp.length ? vehiclesProp : []);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for loading indicator

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        // Fetch the list of vehicles from the API
        const res = await apiFetch('/api/vehicles', { method: 'GET' });
        if (!res.ok) {
          throw new Error(`Failed to fetch vehicles: ${res.status}`);
        }
        const data = await res.json();
        // Assuming the API returns { items: [...], total: ... }
        setVehicles(data.items || []);
        onChange && onChange(data.items || []);
      } catch (e) {
        console.error('Error fetching vehicles:', e);
        // Optionally display an error to the user here
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
    // The empty dependency array [] means this runs only once after the initial render
  }, []);
  // ----------------------------

  const filtered = (vehicles || []).filter(v => {
    const q = (query || '').toLowerCase();
    return (v.id || '').toLowerCase().includes(q) || (v.name || '').toLowerCase().includes(q);
  });

  const createVehicle = async (vehicle) => {
    try {
      // NOTE: The path for your API client likely already includes '/api', 
      // but keeping it here based on your original file's usage of apiFetch.
      const res = await apiFetch('/api/vehicles', { method: 'POST', body: JSON.stringify(vehicle) });

      if (!res.ok) {
        const text = await res.text();
        console.error('create vehicle failed:', res.status, text);
        // *** ACTION: Instead of adding it optimistically, throw an error to be caught by the user. ***
        // A failure here means the DB record was NOT created.
        throw new Error(`Failed to create vehicle: ${res.status} - ${text}`);
      }

      // If successful, get the document returned by the server (which includes DB-generated IDs, timestamps, etc.)
      const doc = await res.json();

      setVehicles(prev => {
        const updated = [doc, ...prev];
        onChange && onChange(updated);
        return updated;
      });
    } catch (e) {
      // Log all failures here (network error, error thrown above, etc.)
      console.warn('create vehicle failed', e);
      // IMPORTANT: DO NOT add the vehicle to state on failure.

      // CONSIDERATION: You should update VehicleFormModal to display the error message here.
      // For now, we are just preventing the failed item from being added to the list.
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await apiFetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      setVehicles(prev => {
        const updated = prev.filter(v => v.id !== id);
        onChange && onChange(updated);
        return updated;
      });
    } catch (e) { console.warn('delete vehicle failed', e); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        <div className="flex items-center space-x-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles" className="px-3 py-2 border rounded" />
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Add Vehicle</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading vehicles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No vehicles found.</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Number</th>
                <th className="px-4 py-2 text-left">Reg</th>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-left">Route</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-2">{v.id}</td>
                  <td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2">{v.number}</td>
                  <td className="px-4 py-2">{v.regNumber}</td>
                  <td className="px-4 py-2">{v.driver}</td>
                  <td className="px-4 py-2">{v.route}</td>
                  <td className="px-4 py-2 text-right"><button onClick={() => deleteVehicle(v.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <VehicleFormModal onCancel={() => setShowCreate(false)} onSubmit={(v) => { createVehicle(v); setShowCreate(false); }} />}
    </div>
  );
}
