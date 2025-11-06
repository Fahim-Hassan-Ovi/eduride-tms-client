import { useState, useEffect, useCallback } from 'react';
import { MapPin, User, Bus, LogOut, Users, Navigation } from 'lucide-react';
import LocationModal from './LocationModal.jsx';
import Registration from './Registration.jsx';
import Profile from './Profile.jsx';
import BusesManager from './BusesManager.jsx';
import RoutesManager from './RoutesManager.jsx';
import SubmitComplaint from './SubmitComplaint.jsx';
import ComplaintsAdmin from './ComplaintsAdmin.jsx';
import StudentComplaints from './StudentComplaints.jsx';
import PaySemester from './PaySemester.jsx';
import PaymentSuccess from './PaymentSuccess.jsx';
import LeafletMap from './LeafletMap.jsx';
import GoogleMapDev from './GoogleMapDev.jsx';
import VehicleManager from './VehicleManager.jsx';
import UserAccess from './UserAccess.jsx';
import StudentPayments from './StudentPayments.jsx';
import PaymentsAdmin from './PaymentsAdmin.jsx';
import BusRequestsBoard from './BusRequestsBoard.jsx';
import BusRequestsAdmin from './BusRequestsAdmin.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [viewMode, setViewMode] = useState('assigned');
  const [nearbySearchRadius, setNearbySearchRadius] = useState(5); // km

  // location modal and user location
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // buses & users (drivers are users with role='driver')
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);

  // complaint system
  const [complaints, setComplaints] = useState([]);
  const [activePage, setActivePage] = useState('live'); // 'live' | 'submitComplaint' | 'complaints'
  const [paymentIdForSuccess, setPaymentIdForSuccess] = useState(null);
  const [myPayments, setMyPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [paymentsVersion, setPaymentsVersion] = useState(0);
  const [myBusRequests, setMyBusRequests] = useState([]);
  const [busRequests, setBusRequests] = useState([]);
  const [busRequestVersion, setBusRequestVersion] = useState(0);
  const [busRequestSubmitting, setBusRequestSubmitting] = useState(false);
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

  // If Stripe redirected back with a session_id, attempt to find the payment and show success view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session_id');
    if (!session) return;
    (async () => {
      try {
        const r = await apiFetch(`/api/payments/session/${session}`);
        if (!r.ok) {
          console.warn('No payment found for session', session);
          return;
        }
        const p = await r.json();
        if (p && p._id) {
          setPaymentIdForSuccess(p._id);
          setActivePage('paymentSuccess');
          setPaymentsVersion(v => v + 1);
        }
      } catch (e) {
        console.warn('Failed to lookup payment for session', e);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMyPayments([]);
      setAllPayments([]);
      return;
    }

    const loadPayments = async () => {
      try {
        const mineRes = await apiFetch('/api/payments/mine');
        if (mineRes.ok) {
          const mineJson = await mineRes.json();
          const mineItems = Array.isArray(mineJson.items) ? mineJson.items : [];
          setMyPayments(mineItems);
        } else if (mineRes.status === 404) {
          setMyPayments([]);
        }

        if (['admin', 'staff'].includes(role)) {
          const allRes = await apiFetch('/api/payments');
          if (allRes.ok) {
            const allJson = await allRes.json();
            const allItems = Array.isArray(allJson.items) ? allJson.items : [];
            setAllPayments(allItems);
          } else {
            setAllPayments([]);
          }
        } else {
          setAllPayments([]);
        }
      } catch (err) {
        console.warn('Failed to load payments', err);
      }
    };

    loadPayments();
  }, [token, role, paymentsVersion]);

  useEffect(() => {
    if (!token) {
      setMyBusRequests([]);
      setBusRequests([]);
      return;
    }

    const loadBusRequests = async () => {
      try {
        const mineRes = await apiFetch('/api/bus-requests/mine');
        if (mineRes.ok) {
          const mineJson = await mineRes.json();
          setMyBusRequests(Array.isArray(mineJson.items) ? mineJson.items : []);
        } else {
          setMyBusRequests([]);
        }

        if (['admin', 'staff'].includes(role)) {
          const allRes = await apiFetch('/api/bus-requests');
          if (allRes.ok) {
            const allJson = await allRes.json();
            setBusRequests(Array.isArray(allJson.items) ? allJson.items : []);
          } else {
            setBusRequests([]);
          }
        } else {
          setBusRequests([]);
        }
      } catch (err) {
        console.warn('Failed to load bus requests', err);
      }
    };

    loadBusRequests();
  }, [token, role, busRequestVersion]);

  // load data from API on mount
  useEffect(() => {
    if (!token) {
      setVehicles({});
      setRoutes([]);
      setUsers([]);
      setBuses([]);
      setComplaints([]);
      return;
    }
    const load = async () => {
      try {
        const [vRes, rRes, uRes, bRes, cRes] = await Promise.all([
          apiFetch('/api/vehicles'),
          apiFetch('/api/routes'),
          apiFetch('/api/users'),
          apiFetch('/api/buses'),
          apiFetch('/api/complaints'),
        ]);
        
        // Parse JSON only if response is ok
        const vJson = vRes.ok ? await vRes.json() : [];
        const rJson = rRes.ok ? await rRes.json() : { items: [] };
        const bJson = bRes.ok ? await bRes.json() : { items: [] };
        const cJson = cRes.ok ? await cRes.json() : { items: [] };
        
        // Handle users endpoint - may return 403 for non-admin users
        let uJson = { items: [] };
        if (uRes.ok) {
          uJson = await uRes.json();
        } else {
          // For non-admin users, set empty array (they don't need to see all users)
          console.warn('Users endpoint returned:', uRes.status, 'Setting users to empty array');
        }
        
        // vehicles API returns { items, page } or plain array depending on auth; normalize
        const vItems = Array.isArray(vJson) ? vJson : (vJson.items || []);
        setVehicles(vItems);
        setRoutes(Array.isArray(rJson) ? rJson : (rJson.items || []));
        
        // Ensure users is always an array
        const usersData = Array.isArray(uJson) ? uJson : (uJson.items || []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        
        setBuses(Array.isArray(bJson) ? bJson : (bJson.items || []));
        setComplaints(Array.isArray(cJson) ? cJson : (cJson.items || []));
      } catch (err) {
        console.warn('Error loading API data', err);
        // Ensure users is always an array even on error
        setUsers([]);
      }
    };
    load();
    
    // Refresh bus locations every 5 seconds to get updated driver locations
    const interval = setInterval(async () => {
      try {
        const bRes = await apiFetch('/api/buses');
        const bJson = await bRes.json();
        setBuses(bJson.items || bJson);
      } catch (err) {
        console.warn('Error refreshing bus locations', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
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

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const createBusRequest = async (payload) => {
    if (!payload?.routeId) {
      return { ok: false, error: 'Route is required' };
    }
    setBusRequestSubmitting(true);
    try {
      const res = await apiFetch('/api/bus-requests', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Failed to submit request' };
      setBusRequestVersion(v => v + 1);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setBusRequestSubmitting(false);
    }
  };

  const updateBusRequest = async (id, payload) => {
    try {
      const res = await apiFetch(`/api/bus-requests/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Failed to update request' };
      setBusRequestVersion(v => v + 1);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // Get nearby buses for students
  const getNearbyBuses = () => {
    if (!userLocation || role !== 'student') return [];
    return buses.filter(b => {
      if (!b.lat || !b.lng) return false;
      const distance = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distance <= nearbySearchRadius;
    }).sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  };

  // Get active buses (buses with assigned drivers that have location)
  const getActiveBuses = () => {
    return buses.filter(b => {
      // Bus must have an assigned driver and location
      return (b.upDriver || b.downDriver) && b.lat && b.lng;
    });
  };

  // Get active vehicles and buses combined
  const getActiveVehicles = () => {
    // Get vehicles with location (for backward compatibility)
    const vehiclesWithLocation = (Array.isArray(vehicles) ? vehicles : Object.values(vehicles))
      .filter(v => v.lat && v.lng);
    
    // Get active buses (with assigned drivers and location)
    const activeBuses = getActiveBuses();
    
    // Combine and format buses as vehicles for display
    const busesAsVehicles = activeBuses.map(bus => ({
      id: bus.id,
      name: bus.plate || bus.id,
      lat: bus.lat,
      lng: bus.lng,
      type: 'bus', // Mark as bus for identification
      route: bus.route,
      upDriverName: bus.upDriverName,
      downDriverName: bus.downDriverName
    }));
    
    // Combine vehicles and buses
    return [...vehiclesWithLocation, ...busesAsVehicles];
  };

  const getFilteredVehicles = () => {
    if (role === 'admin' || viewMode === 'all') {
      return Array.isArray(vehicles) ? vehicles : Object.values(vehicles);
    }
    return (Array.isArray(vehicles) ? vehicles : Object.values(vehicles)).slice(0, 1);
  };

  const addComplaint = (complaint) => {
    // Complaint is already persisted by SubmitComplaint component
    // Just update local state
    setComplaints(prev => {
      const exists = prev.find(c => c.id === complaint.id);
      if (exists) return prev;
      return [complaint, ...prev];
    });
  };

  const updateComplaintFeedback = (id, update) => {
    // Update is already persisted by ComplaintsAdmin component
    // Just update local state
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
  };

  const handleRegister = async (user, password) => {
    try {
      const res = await apiFetch('/api/auth/register', { 
        method: 'POST', 
        body: JSON.stringify({ 
          email: user.email, 
          password, 
          name: user.name, 
          role: user.role || 'student',
          phone: user.phone || '',
          picture: user.picture || ''
        }) 
      });
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


  const handleSaveProfile = (updated) => {
    setUserProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    // optionally persist to API - left as mock for now
  };

  // Driver location watch: when a driver allows location, start watch and update their assigned bus
  const startDriverWatch = async (coords) => {
    setUserLocation(coords);
    if (role !== 'driver') return;
    
    // Update user location in backend (using current user's ID)
    const userId = currentUser?.id;
    if (!userId) {
      console.warn('User ID not found');
      return;
    }
    
    try {
      const res = await apiFetch(`/api/users/${userId}/location`, {
        method: 'PUT',
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng })
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('Failed to update user location:', res.status, text);
      }
    } catch (e) {
      console.warn('Failed to update user location in backend:', e);
    }
    
    // Find bus assigned to this driver (using email)
    const userEmail = currentUser?.email;
    const assignedBus = buses.find(b => b.upDriver === userEmail || b.downDriver === userEmail);
    if (assignedBus) {
      // Update bus location in local state (will be refreshed from API)
      setBuses(prev => prev.map(b => 
        (b.id === assignedBus.id) 
          ? { ...b, lat: coords.lat, lng: coords.lng }
          : b
      ));
    }

    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(async (pos) => {
      const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(newCoords);
      
      // Update backend
      try {
        const res = await apiFetch(`/api/users/${userId}/location`, {
          method: 'PUT',
          body: JSON.stringify({ lat: newCoords.lat, lng: newCoords.lng })
        });
        if (!res.ok) {
          const text = await res.text();
          console.warn('Failed to update user location:', res.status, text);
        }
      } catch (e) {
        console.warn('Failed to update user location in backend:', e);
      }
      
      // Update bus location in local state
      if (assignedBus) {
        setBuses(prev => prev.map(b => 
          (b.id === assignedBus.id) 
            ? { ...b, lat: newCoords.lat, lng: newCoords.lng }
            : b
        ));
      }
    }, (err) => console.warn('watch error', err), { enableHighAccuracy: true, maximumAge: 2000 });
    setWatchId(id);
  };

  const stopDriverWatch = async () => {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Clear location from backend
    const userId = currentUser?.id;
    if (userId && role === 'driver') {
      try {
        // Clear location by setting it to null
        const res = await apiFetch(`/api/users/${userId}/location`, {
          method: 'PUT',
          body: JSON.stringify({ lat: null, lng: null })
        });
        if (!res.ok) {
          console.warn('Failed to clear location from backend');
        } else {
          setUserLocation(null);
          // Also clear from assigned bus
          const userEmail = currentUser?.email;
          const assignedBus = buses.find(b => b.upDriver === userEmail || b.downDriver === userEmail);
          if (assignedBus) {
            setBuses(prev => prev.map(b =>
              (b.id === assignedBus.id)
                ? { ...b, lat: null, lng: null }
                : b
            ));
          }
        }
      } catch (e) {
        console.warn('Failed to clear location from backend:', e);
      }
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
                {/* Driver location toggle */}
                {role === 'driver' && (
                  <div className="space-y-2">
                    {watchId != null ? (
                      <button 
                        onClick={stopDriverWatch} 
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-red-600 text-white hover:bg-red-700"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium text-sm">Stop Location Tracking</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => startDriverWatch({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                              (err) => alert('Unable to retrieve location: ' + err.message)
                            );
                          } else {
                            alert('Geolocation is not supported by your browser');
                          }
                        }} 
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-green-600 text-white hover:bg-green-700"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium text-sm">Start Location Tracking</span>
                      </button>
                    )}
                  </div>
                )}
                {/* Complaint buttons */}
                {role === 'student' && (
                  <>
                    <button onClick={() => setActivePage('busRequests')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Bus Requests</span>
                    </button>
                    <button onClick={() => setActivePage('submitComplaint')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Submit Complaint</span>
                    </button>
                    <button onClick={() => setActivePage('payments')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Payments &amp; Card</span>
                    </button>
                    <button onClick={() => setActivePage('myComplaints')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">My Complaints</span>
                    </button>
                  </>
                )}

                {role === 'admin' && (
                  <div className="space-y-2">
                    <button onClick={() => setActivePage('complaints')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Complaints</span>
                    </button>
                    <button onClick={() => setActivePage('buses')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Buses</span>
                    </button>
                    <button onClick={() => setActivePage('routes')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Routes</span>
                    </button>
                    <button onClick={() => setActivePage('vehicles')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Vehicles</span>
                    </button>
                    <button onClick={() => setActivePage('users')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Manage Users</span>
                    </button>
                    <button onClick={() => setActivePage('busRequestsAdmin')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Bus Requests</span>
                    </button>
                    <button onClick={() => setActivePage('paymentsAdmin')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Payments Overview</span>
                    </button>
                  </div>
                )}

                {role === 'staff' && (
                  <div className="space-y-2">
                    <button onClick={() => setActivePage('busRequests')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Bus Requests</span>
                    </button>
                    <button onClick={() => setActivePage('complaints')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Complaints</span>
                    </button>
                    <button onClick={() => setActivePage('paymentsAdmin')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition bg-white/60 text-slate-700 hover:bg-white/70">
                      <span className="font-medium text-sm">Payments Overview</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Vehicles</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getActiveVehicles().map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => {
                        if (vehicle.lat && vehicle.lng) {
                          setActivePage('live');
                          // Center map on this vehicle/bus (will be handled by LeafletMap)
                          setTimeout(() => {
                            const event = new CustomEvent('centerMap', { detail: { lat: vehicle.lat, lng: vehicle.lng } });
                            window.dispatchEvent(event);
                          }, 100);
                        }
                      }}
                      className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${vehicle.lat && vehicle.lng ? 'cursor-pointer hover:bg-gray-100 transition' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {vehicle.type === 'bus' && <Bus className="w-3 h-3 text-blue-600" />}
                          <span className="font-medium text-sm text-gray-800">{vehicle.id}</span>
                        </div>
                        {vehicle.lat && vehicle.lng && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Live</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{vehicle.name || vehicle.id}</p>
                      {vehicle.type === 'bus' && (
                        <div className="mt-1 space-y-0.5">
                          {vehicle.upDriverName && (
                            <p className="text-xs text-blue-600">Up: {vehicle.upDriverName}</p>
                          )}
                          {vehicle.downDriverName && (
                            <p className="text-xs text-blue-600">Down: {vehicle.downDriverName}</p>
                          )}
                          {vehicle.route && (
                            <p className="text-xs text-gray-400">Route: {vehicle.route}</p>
                          )}
                        </div>
                      )}
                      {vehicle.lat && vehicle.lng && (
                        <p className="text-xs text-blue-600 mt-1">Click to view on map</p>
                      )}
                    </div>
                  ))}
                  {getActiveVehicles().length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No active vehicles</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activePage === 'live' && (
              <div className="bg-white/60 glass-card rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Live Vehicle Tracking</span>
                    </h2>
                    {role === 'student' && userLocation && (
                      <div className="flex items-center space-x-2">
                        <label className="text-white text-sm">Search radius:</label>
                        <select 
                          value={nearbySearchRadius} 
                          onChange={(e) => setNearbySearchRadius(Number(e.target.value))}
                          className="px-2 py-1 rounded bg-white/20 text-white border border-white/30"
                        >
                          <option value={1} className="text-gray-800">1 km</option>
                          <option value={3} className="text-gray-800">3 km</option>
                          <option value={5} className="text-gray-800">5 km</option>
                          <option value={10} className="text-gray-800">10 km</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative h-96">
                  {
                    import.meta.env.VITE_MAP_PROVIDER === 'google'
                      ? <GoogleMapDev vehicles={getFilteredVehicles()} routes={mockRoutes} center={{ lat: 40.75, lng: -73.99 }} />
                      : <LeafletMap 
                          vehicles={role === 'student' ? [] : getFilteredVehicles()} 
                          buses={
                            role === 'student' && userLocation 
                              ? getNearbyBuses() 
                              : role === 'driver' 
                                ? buses.filter(b => {
                                    // Show driver's assigned bus if it has location
                                    const userEmail = currentUser?.email;
                                    return (b.upDriver === userEmail || b.downDriver === userEmail) && b.lat && b.lng;
                                  })
                                : buses.filter(b => b.lat && b.lng)
                          } 
                          drivers={Array.isArray(users) ? users.filter(u => u.role === 'driver') : []} 
                          routes={mockRoutes} 
                          center={userLocation || { lat: 40.75, lng: -73.99 }} 
                        />
                  }
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {role === 'student' && userLocation ? (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Nearby Buses ({getNearbyBuses().length})</h3>
                      {getNearbyBuses().length === 0 ? (
                        <p className="text-sm text-gray-500">No buses found within {nearbySearchRadius} km</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getNearbyBuses().slice(0, 6).map(b => {
                            const distance = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                            return (
                              <div key={b.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{b.plate || b.id}</p>
                                    <p className="text-xs text-gray-500">{b.route || 'No route'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-semibold text-blue-600">{distance.toFixed(1)} km</p>
                                    <p className="text-xs text-gray-500">away</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{getActiveVehicles().length}</p>
                        <p className="text-xs text-gray-600">Active Vehicles</p>
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
                  )}
                </div>
              </div>
            )}

            {activePage === 'submitComplaint' && (
              <SubmitComplaint drivers={Array.isArray(users) ? users.filter(u => u.role === 'driver') : []} studentName={username} onSubmit={addComplaint} onBack={() => setActivePage('live')} />
            )}

            {activePage === 'busRequests' && (
              <BusRequestsBoard
                routes={routes}
                buses={buses}
                requests={myBusRequests}
                submitting={busRequestSubmitting}
                onCreateRequest={createBusRequest}
              />
            )}

            {activePage === 'myComplaints' && (
              <StudentComplaints studentEmail={currentUser?.email || username} onBack={() => setActivePage('live')} token={token} />
            )}

            {activePage === 'complaints' && (
              <ComplaintsAdmin complaints={complaints} onUpdate={updateComplaintFeedback} onBack={() => setActivePage('live')} token={token} />
            )}
            {activePage === 'buses' && (
              <BusesManager 
                busesProp={buses} 
                drivers={Array.isArray(users) ? users.filter(u => u.role === 'driver') : []} 
                routes={routes} 
                vehicles={vehicles} 
                token={token} 
                onChange={(updated) => setBuses(updated)}
                onNavigateToBus={(lat, lng) => {
                  setActivePage('live');
                  setTimeout(() => {
                    const event = new CustomEvent('centerMap', { detail: { lat, lng } });
                    window.dispatchEvent(event);
                  }, 100);
                }}
              />
            )}
            {activePage === 'routes' && (
              <RoutesManager routesProp={routes} token={token} onChange={(updated) => setRoutes(updated)} />
            )}
            {activePage === 'vehicles' && (
              <VehicleManager 
                vehiclesProp={vehicles} 
                token={token} 
                onChange={(updated) => setVehicles(updated)}
                drivers={Array.isArray(users) ? users.filter(u => u.role === 'driver') : []}
                routes={routes}
              />
            )}
            {activePage === 'users' && (
              <UserAccess token={token} />
            )}
            {activePage === 'payments' && (
              <StudentPayments
                studentId={currentUser?.id || currentUser?._id}
                payments={myPayments}
                apiBase={API_BASE}
                onStartPayment={(pid) => {
                  setPaymentIdForSuccess(pid);
                  setActivePage('paymentSuccess');
                }}
              />
            )}
            {activePage === 'paymentsAdmin' && (
              <PaymentsAdmin payments={allPayments} apiBase={API_BASE} />
            )}
            {activePage === 'busRequestsAdmin' && (
              <BusRequestsAdmin
                requests={busRequests}
                buses={buses}
                users={Array.isArray(users) ? users : []}
                onUpdateRequest={updateBusRequest}
              />
            )}
            {activePage === 'paymentSuccess' && paymentIdForSuccess && (
              <PaymentSuccess
                paymentId={paymentIdForSuccess}
                onDone={() => {
                  setPaymentsVersion(v => v + 1);
                  setPaymentIdForSuccess(null);
                  setActivePage('live');
                }}
              />
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


