import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import BusFormModal from './BusFormModal.jsx';
import { MapPin } from 'lucide-react';

export default function BusesManager({ busesProp = [], drivers = [], routes = [], vehicles = [], token = '', onChange, onNavigateToBus }) {
    const [buses, setBuses] = useState(busesProp.length ? busesProp : [
        { id: 'Bus-101', plate: 'ABC-101', vehicleId: vehicles[0]?.id || '', capacity: 40, upDriver: null, downDriver: null, route: routes[0]?.name || 'Route A', departure: '07:30' },
    ]);
    const [query, setQuery] = useState('');
    const [filterRoute, setFilterRoute] = useState('');

    const vehiclesList = Array.isArray(vehicles) ? vehicles : Object.values(vehicles || {});

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPassengersModal, setShowPassengersModal] = useState(false);
    const [passengersList, setPassengersList] = useState([]);
    const [activePassengersBus, setActivePassengersBus] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [passengerEditorOpen, setPassengerEditorOpen] = useState(false);
    const [passengerEditorSelections, setPassengerEditorSelections] = useState([]);

    const addBus = async () => {
        setShowCreateModal(true);
    };

    // load list of users for passenger assignment (admin only)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiFetch('/api/users');
                if (!res.ok) return setUsersList([]);
                const json = await res.json();
                const items = Array.isArray(json) ? json : (json.items || []);
                if (mounted) setUsersList(items.filter(u => u.role === 'student' || u.role === 'staff'));
            } catch (e) {
                console.warn('failed to load users for passenger assignment', e);
                if (mounted) setUsersList([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

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
            // Remove MongoDB internal fields, enriched fields (lat, lng, driver names), assignedPassengers and counts (managed separately), and clean null values to empty strings for string fields
            const { _id, __v, createdAt, updatedAt, lat, lng, upDriverName, downDriverName, assignedPassengers, studentCount, staffCount, ...payloadWithoutMeta } = payload;
            const cleanPayload = Object.fromEntries(
                Object.entries(payloadWithoutMeta).map(([k, v]) => [
                    k,
                    (['upDriver', 'downDriver', 'plate', 'vehicleId', 'route', 'departure'].includes(k) && v === null) ? '' : v
                ])
            );
            const res = await apiFetch(`/api/buses/${busId}`, { method: 'PUT', body: JSON.stringify(cleanPayload) });
            if (!res.ok) {
                const text = await res.text();
                console.error('save row failed:', res.status, text);
                alert(`Failed to update bus: ${text}`);
                return;
            }
            const doc = await res.json();
            const updated = buses.map(b => b.id === busId ? doc : b);
            setBuses(updated);
            onChange && onChange(updated);
            cancelEdit(busId);
        } catch (e) {
            console.warn('save row failed', e);
            alert('Failed to update bus. Check console for details.');
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
                  <BusFormModal existingBusIds={buses.map(x => x.id)} vehicles={vehiclesList} routes={routes} onCancel={() => setShowCreateModal(false)} onSubmit={async (bus) => {
                    try {
                      const res = await apiFetch('/api/buses', { method: 'POST', body: JSON.stringify(bus) });
                      if (!res.ok) {
                        const text = await res.text();
                        console.error('create bus failed:', res.status, text);
                        alert(`Failed to create bus: ${text}`);
                        return;
                      }
                      const doc = await res.json();
                      setBuses(prev => {
                        const updated = [doc, ...prev];
                        onChange && onChange(updated);
                        return updated;
                      });
                    } catch (e) {
                      console.warn('create bus failed', e);
                      alert('Failed to create bus. Check console for details.');
                    }
                    setShowCreateModal(false);
                  }} />
                )}

                {showPassengersModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Assigned Passengers</h3>
                          <p className="text-sm text-gray-500">Bus: {activePassengersBus}</p>
                        </div>
                        <button onClick={() => { setShowPassengersModal(false); setPassengersList([]); setActivePassengersBus(null); }} className="text-gray-400 hover:text-gray-600">Close</button>
                      </div>
                      <div className="mt-4">
                        {passengersList.length === 0 ? (
                          <div className="text-sm text-gray-500">No passengers assigned.</div>
                        ) : (
                          <ul className="space-y-2">
                            {passengersList.map(p => (
                              <li key={p.userId} className="flex items-center justify-between border rounded p-2">
                                <div>
                                  <div className="font-medium text-gray-800">{p.name || p.email}</div>
                                  <div className="text-xs text-gray-500">{p.email} · {p.role}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {passengerEditorOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Edit Assigned Passengers</h3>
                          <p className="text-sm text-gray-500">Bus: {activePassengersBus}</p>
                        </div>
                        <button onClick={() => { setPassengerEditorOpen(false); setPassengerEditorSelections([]); setActivePassengersBus(null); }} className="text-gray-400 hover:text-gray-600">Close</button>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Select students and staff to assign to this bus.</p>
                        <div className="border rounded p-3 max-h-72 overflow-auto">
                          {usersList.length === 0 ? (
                            <div className="text-sm text-gray-500">No users available.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {usersList.map(u => {
                                const uid = String(u._id || u.id);
                                const checked = passengerEditorSelections.includes(uid);
                                return (
                                  <label key={uid} className="flex items-center space-x-2 p-2 border rounded">
                                    <input type="checkbox" checked={checked} onChange={(e) => {
                                      setPassengerEditorSelections(prev => {
                                        if (e.target.checked) return [...prev, uid];
                                        return prev.filter(x => x !== uid);
                                      });
                                    }} className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium text-gray-800">{u.name || u.email}</div>
                                      <div className="text-xs text-gray-500">{u.email} · {u.role}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button onClick={() => { setPassengerEditorOpen(false); setPassengerEditorSelections([]); setActivePassengersBus(null); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                          <button onClick={async () => {
                            try {
                              const payload = { assignedPassengerIds: passengerEditorSelections };
                              const res = await apiFetch(`/api/buses/${activePassengersBus}/passengers`, { method: 'PUT', body: JSON.stringify(payload) });
                              if (!res.ok) {
                                const txt = await res.text();
                                console.error('failed to save passengers', txt);
                                alert(`Failed to save: ${txt}`);
                                return;
                              }
                              const json = await res.json();
                              if (json && json.bus) {
                                setBuses(prev => {
                                  const updated = prev.map(b => b.id === json.bus.id ? json.bus : b);
                                  onChange && onChange(updated);
                                  return updated;
                                });
                              }
                              setPassengerEditorOpen(false);
                              setPassengerEditorSelections([]);
                              setActivePassengersBus(null);
                            } catch (e) {
                              console.warn('save passengers failed', e);
                              alert('Failed to save passengers. Check console.');
                            }
                          }} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                                <th className={tableHeaderClass}>Stops</th>
                                <th className={tableHeaderClass}>Serves Students</th>
                                <th className={tableHeaderClass}>Serves Staff</th>
                                <th className={tableHeaderClass}>Students</th>
                                <th className={tableHeaderClass}>Staff</th>
                                <th className={tableHeaderClass}>Actions</th>
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
                                                {drivers.map(d => <option key={d._id || d.id} value={d.email}>{d.name} ({d.email})</option>)}
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
                                                {drivers.map(d => <option key={d._id || d.id} value={d.email}>{d.name} ({d.email})</option>)}
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

                                        {/* Stops */}
                                        <td className={tableDataClass}>
                                            {!editedRows[b.id] ? (
                                              <div className="text-sm text-gray-600">{Array.isArray(b.stops) && b.stops.length ? b.stops.join(', ') : '—'}</div>
                                            ) : (
                                              <input
                                                type="text"
                                                value={(editedRows[b.id]?.stops ?? (Array.isArray(b.stops) ? b.stops.join(', ') : ''))}
                                                onChange={(e) => updateField(b.id, 'stops', e.target.value)}
                                                placeholder="Comma-separated stops"
                                                className={`py-1 ${inputClass} text-sm`}
                                              />
                                            )}
                                        </td>

                                        {/* flags: serves students / staff */}
                                        <td className={tableDataClass}>
                                          {!editedRows[b.id] ? (
                                            <span className={`px-2 py-1 rounded-full text-xs ${b.studentBus ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500'}`}>
                                              {b.studentBus ? 'Yes' : 'No'}
                                            </span>
                                          ) : (
                                            <label className="inline-flex items-center space-x-2">
                                              <input type="checkbox" checked={!!(editedRows[b.id]?.studentBus)} onChange={(e) => updateField(b.id, 'studentBus', e.target.checked)} className="h-4 w-4" />
                                              <span className="text-sm text-gray-700">Students</span>
                                            </label>
                                          )}
                                        </td>
                                        <td className={tableDataClass}>
                                          {!editedRows[b.id] ? (
                                            <span className={`px-2 py-1 rounded-full text-xs ${b.staffBus ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500'}`}>
                                              {b.staffBus ? 'Yes' : 'No'}
                                            </span>
                                          ) : (
                                            <label className="inline-flex items-center space-x-2">
                                              <input type="checkbox" checked={!!(editedRows[b.id]?.staffBus)} onChange={(e) => updateField(b.id, 'staffBus', e.target.checked)} className="h-4 w-4" />
                                              <span className="text-sm text-gray-700">Staff</span>
                                            </label>
                                          )}
                                        </td>

                                        {/* student/staff counts */}
                                        <td className={`${tableDataClass} text-center`}>
                                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                            {b.studentCount ?? (Array.isArray(b.assignedPassengers) ? b.assignedPassengers.filter(p => p.role === 'student').length : 0)}
                                          </span>
                                        </td>
                                        <td className={`${tableDataClass} text-center`}>
                                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                                            {b.staffCount ?? (Array.isArray(b.assignedPassengers) ? b.assignedPassengers.filter(p => p.role === 'staff').length : 0)}
                                          </span>
                                        </td>
                                        {/* Actions */}
                                        <td className={tableDataClass}>
                                            {!editedRows[b.id] ? (
                                              <div className="flex items-center gap-2">
                                                {b.lat && b.lng && onNavigateToBus && (
                                                  <button 
                                                    onClick={() => onNavigateToBus(b.lat, b.lng)} 
                                                    className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                                    title="View on map"
                                                  >
                                                    <MapPin className="w-4 h-4" />
                                                  </button>
                                                )}
                                                <button onClick={() => startEdit(b.id)} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">Edit</button>
                                                <button onClick={async () => {
                                                    try {
                                                      setActivePassengersBus(b.id);
                                                      const res = await apiFetch(`/api/buses/${b.id}/passengers`);
                                                      if (!res.ok) {
                                                        const txt = await res.text();
                                                        console.error('failed to load passengers', txt);
                                                        setPassengersList([]);
                                                      } else {
                                                        const json = await res.json();
                                                        setPassengersList(Array.isArray(json.items) ? json.items : []);
                                                      }
                                                      setShowPassengersModal(true);
                                                    } catch (e) {
                                                      console.warn('load passengers failed', e);
                                                      setPassengersList([]);
                                                      setShowPassengersModal(true);
                                                    }
                                                }} className="px-2 py-1 bg-blue-50 text-blue-600 rounded">Passengers</button>
                                                <button onClick={() => {
                                                    // open passenger editor modal prefilled with current assigned passengers
                                                    const preSelected = Array.isArray(b.assignedPassengers) ? b.assignedPassengers.map(p => String(p.userId)) : [];
                                                    setPassengerEditorSelections(preSelected);
                                                    setActivePassengersBus(b.id);
                                                    setPassengerEditorOpen(true);
                                                }} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Manage</button>
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