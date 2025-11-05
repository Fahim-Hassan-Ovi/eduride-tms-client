import { useEffect, useRef, useState } from 'react';

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);

    // Add CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (document.getElementById('leaflet-script')) {
      const s = document.getElementById('leaflet-script');
      s.addEventListener('load', () => resolve(window.L));
      s.addEventListener('error', () => reject(new Error('Failed to load Leaflet')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-script';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

// simple linear interpolation
function interpolate(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export default function LeafletMap({ vehicles = [], buses = [], drivers = [], routes = [], center = { lat: 40.75, lng: -73.99 } }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polysRef = useRef({});
  const animIntervals = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadLeaflet().then((L) => {
      if (!mounted) return;
      mapRef.current = L.map(mapElRef.current, { zoomControl: true }).setView([center.lat, center.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      setLoaded(true);
    }).catch(err => console.error('Leaflet load err', err));

    // Listen for centerMap events
    const handleCenterMap = (e) => {
      if (mapRef.current && e.detail) {
        mapRef.current.setView([e.detail.lat, e.detail.lng], 15);
      }
    };
    window.addEventListener('centerMap', handleCenterMap);

    return () => {
      mounted = false;
      window.removeEventListener('centerMap', handleCenterMap);
      animIntervals.current.forEach(clearInterval);
      animIntervals.current = [];
      try {
        if (mapRef.current) {
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) { console.warn('leaflet cleanup', e); }
    };
  }, []);

  // update markers when vehicles and buses change
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const L = window.L;

    // Remove old markers that are no longer in vehicles or buses
    const existingKeys = Object.keys(markersRef.current);
    const vKeys = vehicles.map(v => `v_${v.id}`);
    const bKeys = buses.filter(b => b.lat && b.lng).map(b => `b_${b.id}`);
    const allKeys = [...vKeys, ...bKeys];
    existingKeys.forEach(k => { 
      if (!allKeys.includes(k)) { 
        try { markersRef.current[k].remove(); } catch(e){} 
        delete markersRef.current[k]; 
      } 
    });

    // Add/update vehicle markers
    vehicles.forEach(v => {
      if (!v.lat || !v.lng) return;
      const pos = [v.lat, v.lng];
      const key = `v_${v.id}`;
      if (markersRef.current[key]) {
        try { markersRef.current[key].setLatLng(pos); } catch(e){}
      } else {
        try {
          const label = v.name || v.id;
          const reg = v.regNumber ? `<div>Reg: ${v.regNumber}</div>` : '';
          const pic = v.picture ? `<div class="mt-2"><img src="${v.picture}" alt="${label}" style="width:120px;height:auto;border-radius:6px;"/></div>` : '';
          const html = `<div style="font-weight:700;color:white;background:#4f46e5;padding:6px 10px;border-radius:18px">${label}</div>`;
          const icon = L.divIcon({ className: 'leaflet-marker-custom', html });
          const m = L.marker(pos, { icon }).addTo(mapRef.current);
          m.bindPopup(`<div><strong>Vehicle: ${label}</strong><div>Number: ${v.number || 'N/A'}</div>${reg}${pic}</div>`);
          m.on('click', () => {
            mapRef.current.setView(pos, Math.max(mapRef.current.getZoom(), 15));
            m.openPopup();
          });
          markersRef.current[key] = m;
        } catch(err) { console.warn('marker add err', err); }
      }
    });

    // Add/update bus markers (with click to view location)
    buses.forEach(b => {
      if (!b.lat || !b.lng) return;
      const pos = [b.lat, b.lng];
      const key = `b_${b.id}`;
      if (markersRef.current[key]) {
        try { markersRef.current[key].setLatLng(pos); } catch(e){}
      } else {
        try {
          const label = b.plate || b.id;
          // Use driver names from bus object (already enriched by API)
          // Fallback to drivers array lookup if names not in bus object
          const upDriverName = b.upDriverName || (drivers.find(d => d.email === b.upDriver)?.name) || null;
          const downDriverName = b.downDriverName || (drivers.find(d => d.email === b.downDriver)?.name) || null;
          const driverInfo = upDriverName ? `<div>Up Driver: ${upDriverName}</div>` : '';
          const downDriverInfo = downDriverName ? `<div>Down Driver: ${downDriverName}</div>` : '';
          const html = `<div style="font-weight:700;color:white;background:#10b981;padding:6px 10px;border-radius:18px">🚌 ${label}</div>`;
          const icon = L.divIcon({ className: 'leaflet-marker-custom', html });
          const m = L.marker(pos, { icon }).addTo(mapRef.current);
          m.bindPopup(`<div><strong>Bus: ${b.id}</strong><div>Plate: ${b.plate || 'N/A'}</div><div>Route: ${b.route || 'N/A'}</div><div>Capacity: ${b.capacity || 'N/A'}</div>${driverInfo}${downDriverInfo}<div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;"><strong>Location:</strong><br/>Lat: ${b.lat.toFixed(6)}<br/>Lng: ${b.lng.toFixed(6)}</div></div>`);
          m.on('click', () => {
            mapRef.current.setView(pos, Math.max(mapRef.current.getZoom(), 15));
            m.openPopup();
          });
          markersRef.current[key] = m;
        } catch(err) { console.warn('bus marker add err', err); }
      }
    });
  }, [loaded, vehicles, buses]);

  // draw routes and animate a moving marker along each route
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const L = window.L;

    // clear old
    Object.values(polysRef.current).forEach(p => { try { p.line.remove(); p.movingMarker && p.movingMarker.remove(); } catch(e){} });
    polysRef.current = {};
    animIntervals.current.forEach(clearInterval);
    animIntervals.current = [];

    routes.forEach(r => {
      const latlngs = r.path.map(p => [p[0], p[1]]);
      const line = L.polyline(latlngs, { color: '#2563EB', weight: 4, opacity: 0.7 }).addTo(mapRef.current);
      // moving marker
      const moving = L.circleMarker(latlngs[0], { radius: 6, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }).addTo(mapRef.current);

      let i = 0; let t = 0; const speed = 0.02; // controls animation smoothness
      const id = setInterval(() => {
        if (!latlngs[i+1]) { i = 0; t = 0; }
        const a = { lat: latlngs[i][0], lng: latlngs[i][1] };
        const b = { lat: latlngs[i+1] ? latlngs[i+1][0] : latlngs[0][0], lng: latlngs[i+1] ? latlngs[i+1][1] : latlngs[0][1] };
        const pos = interpolate(a, b, t);
        try { moving.setLatLng([pos.lat, pos.lng]); } catch(e){}
        t += speed;
        if (t >= 1) { t = 0; i = (i + 1) % (latlngs.length - 0); }
      }, 80);
      animIntervals.current.push(id);

      polysRef.current[r.id] = { line, moving };
    });
  }, [loaded, routes]);

  return (
    <div ref={mapElRef} style={{ width: '100%', height: '100%', minHeight: 360 }} className="rounded-md overflow-hidden">
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-sm text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
}


