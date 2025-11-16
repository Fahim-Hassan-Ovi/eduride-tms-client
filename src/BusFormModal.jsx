import { useState } from 'react';

export default function BusFormModal({ vehicles = [], routes = [], existingBusIds = [], onCancel, onSubmit }) {
  // generate a highly unique id
  const makeId = () => `Bus-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  const [id, setId] = useState(makeId());
  const [plate, setPlate] = useState('');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [capacity, setCapacity] = useState(40);
  const [route, setRoute] = useState(routes[0]?.name || '');
  const [departure, setDeparture] = useState('08:00');
  const [studentBus, setStudentBus] = useState(false);
  const [staffBus, setStaffBus] = useState(false);

  // Replaced alert() with console.warn since alert() is not supported in the live environment
  const submit = (e) => {
    e.preventDefault();
    if (!id.trim() || !plate.trim()) return console.warn('Bus ID and plate are required');
    // ensure client-side uniqueness for the generated id
    let uniqueId = id;
    let attempts = 0;
    while (existingBusIds.includes(uniqueId) && attempts < 5) {
      uniqueId = makeId();
      attempts += 1;
    }
    if (existingBusIds.includes(uniqueId)) {
      console.warn('unable to generate unique bus id');
      return;
    }
    setId(uniqueId);
    const bus = { 
      id: uniqueId, 
      plate: plate || '', 
      vehicleId: vehicleId || '', 
      capacity: Number(capacity) || 40, 
      upDriver: '', 
      downDriver: '', 
      route: route || '', 
      departure: departure || '',
      studentBus: !!studentBus,
      staffBus: !!staffBus
    };
    onSubmit && onSubmit(bus);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 scale-100">
        <h3 className="text-2xl font-bold mb-4 text-indigo-700">Create New Bus Assignment</h3>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bus ID</label>
              {/* Bus ID is now pre-filled with a highly unique timestamp value */}
              <input 
                value={id} 
                onChange={(e) => setId(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" 
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plate (Required)</label>
              <input 
                value={plate} 
                onChange={(e) => setPlate(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g., ABC-123"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <select 
                value={vehicleId} 
                onChange={(e) => setVehicleId(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">-- select vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity (Seats)</label>
              <input 
                type="number" 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                min="1" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Route</label>
              <select 
                value={route} 
                onChange={(e) => setRoute(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">-- select route --</option>
                {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Departure Time</label>
              <input 
                type="time" 
                value={departure} 
                onChange={(e) => setDeparture(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <input id="studentBus" type="checkbox" checked={studentBus} onChange={(e) => setStudentBus(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="studentBus" className="text-sm text-gray-700">Serves Students</label>
            </div>
            <div className="flex items-center space-x-2">
              <input id="staffBus" type="checkbox" checked={staffBus} onChange={(e) => setStaffBus(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="staffBus" className="text-sm text-gray-700">Serves Staff</label>
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
              Create Bus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
