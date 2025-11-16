import { X } from 'lucide-react';

export default function VehicleViewModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">Vehicle Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicle.picture && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Image</label>
                <img 
                  src={vehicle.picture} 
                  alt={vehicle.name || vehicle.id}
                  className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
              <p className="text-gray-900 font-medium">{vehicle.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{vehicle.name || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <p className="text-gray-900">{vehicle.number || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <p className="text-gray-900">{vehicle.regNumber || 'N/A'}</p>
            </div>
            
            
            {(vehicle.lat !== undefined && vehicle.lng !== undefined) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <p className="text-gray-900">{vehicle.lat.toFixed(6)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <p className="text-gray-900">{vehicle.lng.toFixed(6)}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

