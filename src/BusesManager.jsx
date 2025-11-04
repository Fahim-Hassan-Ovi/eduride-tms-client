import { useState } from 'react';
import { apiFetch } from './utils/api';
import BusFormModal from './BusFormModal.jsx';

export default function BusesManager({ busesProp = [], drivers = [], routes = [], vehicles = [], token = '', onChange }) {
    const [buses, setBuses] = useState(busesProp.length ? busesProp : [
        { id: 'Bus-101', plate: 'ABC-101', vehicleId: vehicles[0]?.id || '', capacity: 40, upDriver: null, downDriver: null, route: routes[0]?.name || 'Route A', departure: '07:30' },
    ]);
    const [query, setQuery] = useState('');
    const [filterRoute, setFilterRoute] = useState('');

    const vehiclesList = Array.isArray(vehicles) ? vehicles : Object.values(vehicles || {});

    const [showCreateModal, setShowCreateModal] = useState(false);

    const addBus = async () => {
        setShowCreateModal(true);
    };

    const qLower = (query || '').toLowerCase();
    const filtered = (buses || []).filter(b => {
        const id = (b && b.id) ? String(b.id).toLowerCase() : '';
        const plate = (b && b.plate) ? String(b.plate).toLowerCase() : '';
        return id.includes(qLower) || plate.includes(qLower);
    }).filter(b => !filterRoute || b.route === filterRoute);

    // edits are staged locally until saved to API
    const [editedRows, setEditedRows] = useState({});

    const startEdit = (id) => {
        const row = buses.find(b => b.id === id);
        setEditedRows(prev => ({ ...prev, [id]: { ...row } }));
    };

    const cancelEdit = (id) => {
        setEditedRows(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    };

    const assignDriver = (busId, role, driverId) => {
        setEditedRows(prev => ({ ...prev, [busId]: { ...(prev[busId] || buses.find(b => b.id === busId)), [role]: driverId } }));
    };

    const updateField = (busId, field, value) => {
        setEditedRows(prev => ({ ...prev, [busId]: { ...(prev[busId] || buses.find(b => b.id === busId)), [field]: value } }));
    };

    const saveRow = async (busId) => {
        const payload = editedRows[busId];
        if (!payload) return;
        try {
            const res = await apiFetch(`/api/buses/${busId}`, { method: 'PUT', body: JSON.stringify(payload) });
            const doc = await res.json();
            const updated = buses.map(b => b.id === busId ? doc : b);
            setBuses(updated);
            onChange && onChange(updated);
            cancelEdit(busId);
        } catch (e) {
            console.warn('save row failed', e);
        }
    };

    // --- Custom Class Definitions ---
    const inputClass = "px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out w-full";
    const buttonClass = "px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out";
    const tableHeaderClass = "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sticky top-0 bg-indigo-50 border-b border-gray-200";

    // NEW CLASS: Select for the control panel (search bar area)
    const controlSelectClass = "px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer transition duration-150 ease-in-out w-40";
    
    // NEW CLASS: Select for the table (wider to fit content)
    const tableSelectClass = "px-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer text-sm min-w-40 w-full"; // Added min-w-40 (or min-w-48) to force width
    
    // Adjusted class to give padding and ensure content fits
    const tableDataClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-800"; 
    // Added an extra wide class for the driver/vehicle dropdowns
    const wideTableDataClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-800 w-48"; 


    return (
        <div className="p-8 bg-gray-50 min-h-screen"> 
            <div className="max-w-7xl mx-auto">
                {/* --- Header and Controls --- */}
                <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Fleet Assignment</h2>
                    <div className="flex items-center space-x-3">
                        <input
                            placeholder="Search bus ID or Plate"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`w-56 ${inputClass}`}
                        />
                        {/* Using the new controlSelectClass */}
                        <select
                            value={filterRoute}
                            onChange={(e) => setFilterRoute(e.target.value)}
                            className={controlSelectClass}
                        >
                            <option value="">All Routes</option>
                            {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                        <button onClick={addBus} className={buttonClass}>
                            + Add New Bus
                        </button>
                    </div>
                </div>
                {showCreateModal && (
                  <BusFormModal vehicles={vehiclesList} routes={routes} onCancel={() => setShowCreateModal(false)} onSubmit={async (bus) => {
                    try {
                      const res = await apiFetch('/api/buses', { method: 'POST', body: JSON.stringify(bus) });
                      const doc = await res.json();
                      setBuses(prev => [doc, ...prev]);
                      onChange && onChange([doc, ...buses]);
                    } catch (e) { console.warn('create bus failed', e); setBuses(prev => [bus, ...prev]); onChange && onChange([bus, ...buses]); }
                    setShowCreateModal(false);
                  }} />
                )}

                {/* --- Enhanced Table Structure --- */}
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-x-auto overflow-y-auto max-h-[70vh]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50 sticky top-0 z-10">
                            <tr>
                                <th className={tableHeaderClass}>ID</th>
                                <th className={tableHeaderClass}>Plate</th>
                                <th className={tableHeaderClass}>Capacity</th>
                                {/* Used wideTableDataClass headers to align column width */}
                                <th className={`${tableHeaderClass} w-48`}>Vehicle</th>
                                <th className={`${tableHeaderClass} w-48`}>Up Driver</th>
                                <th className={`${tableHeaderClass} w-48`}>Down Driver</th>
                                <th className={tableHeaderClass}>Route</th>
                                <th className={tableHeaderClass}>Departure</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map((b, index) => {
                                // ... data finding logic remains the same
                                
                                return (
                                    <tr 
                                        key={b.id || index} 
                                        className="odd:bg-white even:bg-gray-50 hover:bg-indigo-50 transition duration-150 ease-in-out" 
                                    >
                                        <td className={`font-medium text-indigo-600 ${tableDataClass}`}>{b.id}</td>
                                        <td className={tableDataClass}>{b.plate}</td>
                                        <td className={tableDataClass}>{b.capacity}</td>
                                        
                                        {/* Vehicle Dropdown (Using wideTableDataClass and tableSelectClass) */}
                                        <td className={wideTableDataClass}>
                                            <select
                                                value={(editedRows[b.id]?.vehicleId ?? b.vehicleId) || ''}
                                                onChange={(e) => updateField(b.id, 'vehicleId', e.target.value)}
                                                className={tableSelectClass} 
                                            >
                                                <option value="">-- select vehicle --</option>
                                                {vehiclesList.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                                            </select>
                                        </td>
                                        
                                        {/* Up Driver Dropdown */}
                                        <td className={wideTableDataClass}>
                                            <select
                                                value={(editedRows[b.id]?.upDriver ?? b.upDriver) || ''}
                                                onChange={(e) => assignDriver(b.id, 'upDriver', e.target.value)}
                                                className={tableSelectClass}
                                            >
                                                <option value="">-- assign --</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </td>
                                        
                                        {/* Down Driver Dropdown */}
                                        <td className={wideTableDataClass}>
                                            <select
                                                value={(editedRows[b.id]?.downDriver ?? b.downDriver) || ''}
                                                onChange={(e) => assignDriver(b.id, 'downDriver', e.target.value)}
                                                className={tableSelectClass}
                                            >
                                                <option value="">-- assign --</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </td>
                                        
                                        {/* Route Dropdown */}
                                        <td className={tableDataClass}>
                                            <select
                                                value={(editedRows[b.id]?.route ?? b.route) || ''}
                                                onChange={(e) => updateField(b.id, 'route', e.target.value)}
                                                className={tableSelectClass}
                                            >
                                                <option value="">-- select route --</option>
                                                {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                            </select>
                                        </td>
                                        
                                        {/* Departure Input */}
                                        <td className={tableDataClass}>
                                            <input
                                                type="time" 
                                                value={(editedRows[b.id]?.departure ?? b.departure) || ''}
                                                onChange={(e) => updateField(b.id, 'departure', e.target.value)}
                                                className={`py-1 ${inputClass} w-24 text-sm`} 
                                            />
                                        </td>
                                        {/* Actions */}
                                        <td className={tableDataClass}>
                                            {!editedRows[b.id] ? (
                                              <div className="flex items-center gap-2">
                                                <button onClick={() => startEdit(b.id)} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">Edit</button>
                                                <button onClick={async () => {
                                                    try {
                                                        await apiFetch(`/api/buses/${b.id}`, { method: 'DELETE' });
                                                        const updated = buses.filter(x => x.id !== b.id);
                                                        setBuses(updated);
                                                        onChange && onChange(updated);
                                                    } catch (e) { console.warn('delete bus failed', e); }
                                                }} className="px-2 py-1 bg-red-50 text-red-600 rounded">Delete</button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <button onClick={() => saveRow(b.id)} className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                                                <button onClick={() => cancelEdit(b.id)} className="px-2 py-1 bg-gray-100 rounded">Cancel</button>
                                              </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}