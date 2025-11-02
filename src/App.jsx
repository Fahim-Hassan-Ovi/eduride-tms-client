import { useState, useEffect } from 'react';
import { MapPin, User, Bus, LogOut, Users, Navigation } from 'lucide-react';
import LocationModal from './LocationModal.jsx';
import Registration from './Registration.jsx';
import Profile from './Profile.jsx';
import BusesManager from './BusesManager.jsx';
import DriversManager from './DriversManager.jsx';
import RoutesManager from './RoutesManager.jsx';
import SubmitComplaint from './SubmitComplaint.jsx';
import ComplaintsAdmin from './ComplaintsAdmin.jsx';
import LeafletMap from './LeafletMap.jsx';
import GoogleMapDev from './GoogleMapDev.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [viewMode, setViewMode] = useState('assigned');

  // location modal and user location
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // buses & drivers
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // complaint system
  const [complaints, setComplaints] = useState([]);
  const [activePage, setActivePage] = useState('live'); // 'live' | 'submitComplaint' | 'complaints'
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [userProfiles, setUserProfiles] = useState([]);

  // Use a realistic Dhaka -> Mymensingh highway mock route for demonstration
  const [mockRoutes] = useState([
    {
      id: 'R-DM-01',
      name: 'Dhaka - Mymensingh Hwy',
      path: [
        [23.8103, 90.4125], // Dhaka
        [23.8730, 90.3924], // Tongi area
        [24.0000, 90.4115], // Gazipur
        [24.2000, 90.3800], // north of Gazipur
        [24.4000, 90.3900], // approaching Gafargaon
        [24.5340, 90.3982], // Gafargaon
        [24.6500, 90.4100], // near Ishwarganj
        [24.7471, 90.4203], // Mymensingh
      ],
    },
  ]);

  // Vehicles state will be loaded from API; store as map by id for quick lookup
  const [vehicles, setVehicles] = useState({});
  const [routes, setRoutes] = useState([]);

  // auth
  const [token, setToken] = useState(() => localStorage.getItem('tms_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tms_user') || 'null'); } catch(e){ return null; }
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';


  const apiFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const res = await fetch(fullUrl, { ...options, headers });
    return res;
  };

  // load data from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, rRes, dRes, bRes, cRes] = await Promise.all([
          apiFetch('/api/vehicles'),
          apiFetch('/api/routes'),
          apiFetch('/api/drivers'),
          apiFetch('/api/buses'),
          apiFetch('/api/complaints'),
        ]);
        const [vJson, rJson, dJson, bJson, cJson] = await Promise.all([vRes.json(), rRes.json(), dRes.json(), bRes.json(), cRes.json()]);
        // vehicles API returns { items, page } or plain array depending on auth; normalize
        const vItems = Array.isArray(vJson) ? vJson : (vJson.items || []);
        const vehiclesMap = {};
        vItems.forEach(v => { vehiclesMap[v.id] = v; });
        setVehicles(vehiclesMap);
        setRoutes(rJson.items || rJson);
        setDrivers(dJson.items || dJson);
        setBuses(bJson.items || bJson);
        setComplaints(cJson.items || cJson);
      } catch (err) {
        console.warn('Error loading API data', err);
      }
    };
    load();
  }, [token]);


  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setVehicles(prev => {
        const updated = { ...prev };
        const keys = Object.keys(updated);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];

        if (updated[randomKey]) {
          updated[randomKey] = {
            ...updated[randomKey],
            lat: updated[randomKey].lat + (Math.random() - 0.5) * 0.01,
            lng: updated[randomKey].lng + (Math.random() - 0.5) * 0.01,
          };
        }

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = { username: '', password: '' };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    if (newErrors.username || newErrors.password) return;

    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      localStorage.setItem('tms_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('tms_user', JSON.stringify(data.user));
      setRole(data.user.role || selectedRole);
      setIsLoggedIn(true);
      setShowLocationModal(true);
      setActivePage('live');
    } catch (err) {
      setErrors({ ...newErrors, username: err.message });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setErrors({ username: '', password: '' });
  };

  const getFilteredVehicles = () => {
    if (role === 'admin' || viewMode === 'all') {
      return Object.values(vehicles);
    }
    return Object.values(vehicles).slice(0, 1);
  };

  const addComplaint = (complaint) => {
    // persist to API
    (async () => {
      try {
        const res = await apiFetch('/api/complaints', { method: 'POST', body: JSON.stringify(complaint) });
        const doc = await res.json();
        setComplaints(prev => [doc, ...prev]);
      } catch (e) { console.warn('submit complaint failed', e); setComplaints(prev => [complaint, ...prev]); }
    })();
  };

  const updateComplaintFeedback = (id, update) => {
    (async () => {
      try {
        const res = await apiFetch(`/api/complaints/${id}`, { method: 'PUT', body: JSON.stringify(update) });
        const doc = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? doc : c));
      } catch (e) { console.warn('update complaint failed', e); setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...update } : c)); }
    })();
  };

  const handleRegister = async (user, password) => {
    try {
      const res = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: user.email, password, name: user.name, role: user.role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      setToken(data.token);
      localStorage.setItem('tms_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('tms_user', JSON.stringify(data.user));
      setIsLoggedIn(true);
      setShowLocationModal(true);
    } catch (e) {
      alert('Register failed: ' + e.message);
    }
  };

  const handleRegisterDriver = (driver) => {
    (async () => {
      try {
        const res = await apiFetch('/api/drivers', { method: 'POST', body: JSON.stringify(driver) });
        const doc = await res.json();
        setDrivers(prev => [doc, ...prev]);
      } catch (e) { console.warn('register driver failed', e); setDrivers(prev => [driver, ...prev]); }
    })();
  };

  const handleSaveProfile = (updated) => {
    setUserProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    // optionally persist to API - left as mock for now
  };

  // Driver location watch: when a driver allows location, start watch and update their vehicle if matched
  const startDriverWatch = (coords) => {
    setUserLocation(coords);
    if (role !== 'driver') return;
    // try to find a vehicle matching username
    const driverName = username;
    const vehicleKey = Object.keys(vehicles).find(k => (vehicles[k].driver || '').toLowerCase() === driverName.toLowerCase());
    const vehicleId = vehicleKey || Object.keys(vehicles)[0];
    if (!vehicleId) return;
    // update that vehicle once
    setVehicles(prev => ({ ...prev, [vehicleId]: { ...prev[vehicleId], lat: coords.lat, lng: coords.lng } }));

    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition((pos) => {
      const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(newCoords);
      setVehicles(prev => ({ ...prev, [vehicleId]: { ...prev[vehicleId], lat: newCoords.lat, lng: newCoords.lng } }));
    }, (err) => console.warn('watch error', err), { enableHighAccuracy: true, maximumAge: 2000 });
    setWatchId(id);
  };

  const stopDriverWatch = () => {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <Bus className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Transport Management
            </h1>
            <p className="text-center text-gray-500 mb-8">Sign in to access the dashboard</p>

            {authView === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your username or email"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['admin', 'teacher', 'student', 'driver']).map((r) => (
                      <label key={r} className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${selectedRole === r ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="role" value={r} checked={selectedRole === r} onChange={(e) => setSelectedRole(e.target.value)} className="sr-only" />
                        <span className="text-sm font-medium capitalize">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl">Sign In</button>
                <div className="text-center text-sm mt-2">
                  <button type="button" onClick={() => setAuthView('register')} className="text-blue-600 underline">Create an account</button>
                </div>
              </form>
            ) : (
              <Registration onCancel={() => setAuthView('login')} onRegister={handleRegister} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl shadow-lg backdrop-blur-sm">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TMS Dashboard</h1>
                <p className="text-sm opacity-80">Real-time vehicle tracking & operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-white" />
                <span className="text-sm font-medium capitalize">{role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl shadow-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <span>Control Panel</span>
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setViewMode('assigned')}
                  disabled={role === 'admin'}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition transform hover:-translate-y-0.5 ${
                    viewMode === 'assigned' && role !== 'admin'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white/60 text-slate-700 hover:bg-white/70'
                  } ${role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium text-sm">My Assigned Vehicles</span>
                </button>

                <button
                  onClick={() => setViewMode('all')}
                  disabled={role !== 'admin'}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition transform hover:-translate-y-0.5 ${
                    viewMode === 'all' || role === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg'
                      : 'bg-white/60 text-slate-700 hover:bg-white/70'
                  } ${role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium text-sm">Find Nearby Vehicles</span>
                </button>
                {/* Complaint buttons */}
                {role === 'student' && (
                  <button onClick={() => setActivePage('submitComplaint')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                    <span className="font-medium text-sm">Submit Complaint</span>
                  </button>
                )}

                {role === 'admin' && (
                  <div className="space-y-2">
                    <button onClick={() => setActivePage('complaints')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Complaints</span>
                    </button>
                    <button onClick={() => setActivePage('buses')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Buses</span>
                    </button>
                    <button onClick={() => setActivePage('drivers')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Drivers</span>
                    </button>
                    <button onClick={() => setActivePage('routes')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Routes</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Vehicles</h3>
                <div className="space-y-2">
                  {getFilteredVehicles().map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-800">{vehicle.id}</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">Live</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{vehicle.route}</p>
                      <p className="text-xs text-gray-400 mt-1">Driver: {vehicle.driver}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activePage === 'live' && (
              <div className="bg-white/60 glass-card rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Live Vehicle Tracking</span>
                  </h2>
                </div>
                <div className="relative h-96">
                  {
                    import.meta.env.VITE_MAP_PROVIDER === 'google'
                      ? <GoogleMapDev vehicles={getFilteredVehicles()} routes={mockRoutes} center={{ lat: 40.75, lng: -73.99 }} />
                      : <LeafletMap vehicles={getFilteredVehicles()} routes={mockRoutes} center={{ lat: 40.75, lng: -73.99 }} />
                  }
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{getFilteredVehicles().length}</p>
                      <p className="text-xs text-gray-600">Vehicles Tracked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">100%</p>
                      <p className="text-xs text-gray-600">Online Status</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">Live</p>
                      <p className="text-xs text-gray-600">Update Mode</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'submitComplaint' && (
              <SubmitComplaint vehicles={getFilteredVehicles()} studentName={username} onSubmit={addComplaint} onBack={() => setActivePage('live')} />
            )}

            {activePage === 'complaints' && (
              <ComplaintsAdmin complaints={complaints} onUpdate={updateComplaintFeedback} onBack={() => setActivePage('live')} />
            )}
            {activePage === 'buses' && (
              <BusesManager busesProp={buses} drivers={drivers} routes={routes} vehicles={vehicles} token={token} onChange={(updated) => setBuses(updated)} />
            )}
            {activePage === 'drivers' && (
              <DriversManager driversProp={drivers} token={token} onChange={(updated) => setDrivers(updated)} onRegisterDriver={handleRegisterDriver} />
            )}
            {activePage === 'routes' && (
              <RoutesManager routesProp={routes} token={token} onChange={(updated) => setRoutes(updated)} />
            )}
          </div>
        </div>
      </div>
      {showLocationModal && (
        <LocationModal
          onAllow={(coords) => { setUserLocation(coords); setShowLocationModal(false); startDriverWatch(coords); }}
          onDismiss={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}

export default App;


