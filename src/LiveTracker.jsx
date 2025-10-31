import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export default function LiveTracker() {
  const [vehicles, setVehicles] = useState([
    { id: 'Bus-101', lat: 40.71, lng: -74.00, status: 'en route' },
    { id: 'Bus-102', lat: 40.75, lng: -73.98, status: 'stopped' },
  ]);

  useEffect(() => {
    const intv = setInterval(() => {
      setVehicles(prev => prev.map(v => ({ ...v, lat: v.lat + (Math.random()-0.5)*0.01, lng: v.lng + (Math.random()-0.5)*0.01 })));
    }, 3000);
    return () => clearInterval(intv);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Live Vehicle Tracking</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden md:flex">
        <div className="md:w-3/4 p-6 border-r">
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-3 opacity-60" />
              <p className="font-semibold">Live Map Integration</p>
              <p className="text-sm text-gray-500 mt-1">Placeholder area for map provider (e.g., Google Maps)</p>
            </div>
          </div>
        </div>

        <div className="md:w-1/4 p-4">
          <h3 className="font-medium mb-3">Active Vehicles</h3>
          <div className="space-y-3">
            {vehicles.map(v => (
              <div key={v.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{v.id}</div>
                    <div className="text-xs text-gray-500">{v.status}</div>
                  </div>
                  <div className="text-xs text-gray-600">{v.lat.toFixed(3)}, {v.lng.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


