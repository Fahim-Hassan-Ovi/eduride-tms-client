import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';

export default function SubmitComplaint({ drivers: driversProp = [], studentName = '', onSubmit, onBack }) {
  const [drivers, setDrivers] = useState(driversProp);
  const [driverId, setDriverId] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch drivers if not provided
  useEffect(() => {
    const fetchDrivers = async () => {
      if (driversProp.length > 0) {
        setDrivers(driversProp);
        return;
      }
      try {
        const res = await apiFetch('/api/users/drivers');
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.items || []);
        } else {
          console.warn('Failed to fetch drivers:', res.status);
        }
      } catch (e) {
        console.warn('Error fetching drivers:', e);
      }
    };
    fetchDrivers();
  }, [driversProp]);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrors('Please describe the complaint');
      return;
    }
    if (!driverId) {
      setErrors('Please select a driver');
      return;
    }
    setIsSubmitting(true);
    try {
      const newComplaint = {
        id: `C-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        student: studentName || 'Anonymous',
        driverId: driverId || '',
        message: message.trim(),
        status: 'open',
        feedback: '',
      };
      const res = await apiFetch('/api/complaints', { method: 'POST', body: JSON.stringify(newComplaint) });
      if (!res.ok) {
        const text = await res.text();
        console.error('submit complaint failed:', res.status, text);
        setErrors(`Failed to submit: ${text}`);
        setIsSubmitting(false);
        return;
      }
      const doc = await res.json();
      onSubmit && onSubmit(doc);
      setMessage('');
      setErrors('');
      setIsSubmitting(false);
      if (onBack) onBack();
    } catch (e) {
      console.warn('submit complaint failed', e);
      setErrors('Failed to submit complaint. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Submit Complaint</h2>
        <button onClick={onBack} className="px-3 py-1 bg-gray-100 rounded">Back</button>
      </div>

      <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Against Driver</label>
        <select 
          value={driverId} 
          onChange={(e) => { setDriverId(e.target.value); setErrors(''); }} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">-- Select Driver --</option>
          {drivers.map(d => <option key={d._id || d.id} value={d.email}>{d.name} ({d.email})</option>)}
        </select>

        <label className="block text-sm font-medium text-gray-700">Complaint Message</label>
        <textarea 
          value={message} 
          onChange={(e) => { setMessage(e.target.value); setErrors(''); }} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          rows={4}
          placeholder="Describe your complaint..."
          required
        ></textarea>
        {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}


