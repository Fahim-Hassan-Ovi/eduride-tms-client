import { useState } from 'react';

export default function LocationModal({ onAllow, onDismiss }) {
  const [requesting, setRequesting] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRequesting(false);
        onAllow({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setRequesting(false);
        alert('Unable to retrieve location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50 pointer-events-none">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 pointer-events-auto">
        <h3 className="text-lg font-semibold">Location Permission</h3>
        <p className="text-sm text-gray-600 mt-2">We use your location to provide live tracking features. Please allow location access to continue.</p>
        <div className="mt-4 flex justify-end space-x-3">
          <button onClick={onDismiss} className="px-3 py-1 bg-gray-100 rounded">Ask Later</button>
          <button onClick={requestLocation} disabled={requesting} className="px-3 py-1 bg-blue-600 text-white rounded">
            {requesting ? 'Requesting...' : 'Allow Location'}
          </button>
        </div>
      </div>
    </div>
  );
}


