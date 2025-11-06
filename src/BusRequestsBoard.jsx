import React, { useEffect, useMemo, useState } from "react";
import { Bus, CheckCircle2, Clock, MapPin, ClipboardList } from "lucide-react";

const statusStyles = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
};

export default function BusRequestsBoard({
  routes = [],
  buses = [],
  requests = [],
  onCreateRequest,
  submitting = false,
}) {
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || "");
  const [stop, setStop] = useState("");
  const [preferredDeparture, setPreferredDeparture] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!routes.length) {
      setSelectedRouteId("");
      return;
    }
    if (!routes.find((r) => r.id === selectedRouteId)) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes]);

  const routeMap = useMemo(() => {
    const map = new Map();
    routes.forEach((r) => {
      map.set(r.id, r);
    });
    return map;
  }, [routes]);

  const selectedRoute = selectedRouteId ? routeMap.get(selectedRouteId) : null;
  const stops = selectedRoute?.stops || [];

  const matchingBuses = useMemo(() => {
    if (!selectedRoute) return [];
    return buses.filter((b) => (b.route || "") === selectedRoute.name);
  }, [buses, selectedRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) {
      setFeedback({ type: "error", message: "Please select a route." });
      return;
    }
    setFeedback(null);
    const payload = {
      routeId: selectedRouteId,
      stop,
      preferredDeparture,
      notes,
    };
    const result = await onCreateRequest(payload);
    if (result.ok) {
      setStop("");
      setPreferredDeparture("");
      setNotes("");
      setFeedback({ type: "success", message: "Request submitted successfully." });
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to submit request." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Request a Scheduled Bus</h2>
            <p className="text-sm text-gray-500">
              Choose a route, stop, and preferred time. Admins will review and assign you to the best available bus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {routes.length === 0 && <option value="">No routes available</option>}
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Stop</label>
              <select
                value={stop}
                onChange={(e) => setStop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any stop</option>
                {stops.map((s, idx) => (
                  <option key={`${s}-${idx}`} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Departure Time</label>
              <input
                type="time"
                value={preferredDeparture}
                onChange={(e) => setPreferredDeparture(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special requirements or timing constraints"
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

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {selectedRoute && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bus className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Buses on {selectedRoute.name}</h3>
              <p className="text-sm text-gray-500">Stops: {stops.length ? stops.join(' → ') : 'No stops recorded'}</p>
            </div>
          </div>

          {matchingBuses.length === 0 ? (
            <p className="text-sm text-gray-500">No buses currently assigned to this route.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchingBuses.map((bus) => (
                <div key={bus.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{bus.plate || bus.id}</p>
                      <p className="text-xs text-gray-500">Vehicle: {bus.vehicleId || 'TBD'}</p>
                    </div>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {bus.departure || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                      <span>Route: {bus.route || 'Unassigned'}</span>
                    </div>
                    {bus.upDriverName && (
                      <div>Up Driver: {bus.upDriverName}</div>
                    )}
                    {bus.downDriverName && (
                      <div>Down Driver: {bus.downDriverName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">My Requests</h3>
            <p className="text-sm text-gray-500">Track the status of your bus scheduling requests.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const pill = statusStyles[req.status] || 'bg-gray-100 text-gray-600';
              return (
                <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{req.routeName}</p>
                      <p className="text-xs text-gray-500">Requested on {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pill}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {req.stop && <div>Stop: {req.stop}</div>}
                    {req.preferredDeparture && <div>Preferred departure: {req.preferredDeparture}</div>}
                    {req.assignedBusId && (
                      <div>
                        Assigned Bus: {req.assignedBusPlate || req.assignedBusId}{' '}
                        {req.assignedTrip && <span className="text-xs text-gray-400">({req.assignedTrip} trip)</span>}
                      </div>
                    )}
                    {req.assignedPassengers?.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Passengers: {req.assignedPassengers.map((p) => p.name || p.email).join(', ')}
                      </div>
                    )}
                    {req.adminNotes && (<div className="text-xs text-gray-400">Admin notes: {req.adminNotes}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


