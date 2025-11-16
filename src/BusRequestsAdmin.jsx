import React, { useMemo, useState } from "react";
import { Bus, Users, Check, XCircle, ClipboardCheck } from "lucide-react";

const statusColors = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  approved: "bg-green-50 text-green-600 border border-green-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

export default function BusRequestsAdmin({
  requests = [],
  buses = [],
  users = [],
  onUpdateRequest,
}) {
  const [activeRequest, setActiveRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: 'pending',
    assignedBusId: '',
    assignedTrip: '',
    assignedPassengerIds: [],
    adminNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const stats = useMemo(() => {
    return requests.reduce(
      (acc, req) => {
        acc.total += 1;
        if (req.status === 'approved') acc.approved += 1;
        if (req.status === 'pending') acc.pending += 1;
        if (req.status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );
  }, [requests]);

  const openEditor = (req) => {
    setActiveRequest(req);
    setFeedback(null);
    const basePassengers = (req.assignedPassengers || []).map((p) => String(p.userId || p._id || ''));
    const requesterId = req.requester?._id || req.requester || req.requesterId;
    if (requesterId && !basePassengers.includes(String(requesterId))) {
      basePassengers.push(String(requesterId));
    }
    setFormData({
      status: req.status || 'pending',
      assignedBusId: req.assignedBusId || '',
      assignedTrip: req.assignedTrip || '',
      assignedPassengerIds: basePassengers,
      adminNotes: req.adminNotes || '',
    });
  };

  const closeEditor = () => {
    setActiveRequest(null);
    setSubmitting(false);
    setFeedback(null);
  };

  const passengersOptions = useMemo(() => {
    return users.filter((u) => u.role === 'student' || u.role === 'staff');
  }, [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    setSubmitting(true);
    setFeedback(null);
    const payload = {
      status: formData.status,
      assignedBusId: formData.assignedBusId || null,
      assignedTrip: formData.assignedTrip,
      assignedPassengerIds: formData.assignedPassengerIds,
      adminNotes: formData.adminNotes,
    };
    const result = await onUpdateRequest(activeRequest._id, payload);
    if (result.ok) {
      setFeedback({ type: 'success', message: 'Request updated successfully.' });
      setTimeout(closeEditor, 600);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to update request.' });
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status) => statusColors[status] || "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Requests</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Approved</p>
          <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Rejected</p>
          <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Bus Requests</h2>
              <p className="text-sm text-gray-500">Approve or assign buses to student/staff requests.</p>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No requests available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Stop</th>
                  <th className="px-4 py-3">Preferred Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Bus</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id} className="text-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{req.routeName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{req.requester?.name || req.requesterName || '—'}</div>
                      <div className="text-xs text-gray-500">{req.requester?.email || req.requesterEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.stop || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.preferredDeparture || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {req.assignedBusId ? (
                        <div>
                          <div>{req.assignedBusPlate || req.assignedBusId}</div>
                          {req.assignedTrip && <div className="text-xs text-gray-400">{req.assignedTrip} trip</div>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => openEditor(req)}
                        className="px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeRequest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={closeEditor}
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <Bus className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Update Request</h3>
                <p className="text-sm text-gray-500">
                  {activeRequest.routeName} — {activeRequest.requester?.name || activeRequest.requesterName}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Bus</label>
                  <select
                    value={formData.assignedBusId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, assignedBusId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- None --</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.plate || bus.id} · {bus.route || 'No route'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip</label>
                  <select
                    value={formData.assignedTrip}
                    onChange={(e) => setFormData((prev) => ({ ...prev, assignedTrip: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <select
                    multiple
                    value={formData.assignedPassengerIds}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      setFormData((prev) => ({ ...prev, assignedPassengerIds: options }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28"
                  >
                    {passengersOptions.map((user) => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name || user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">Requester will be added automatically.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  rows={3}
                  placeholder="Instructions or reasons for approval/rejection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {feedback && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


