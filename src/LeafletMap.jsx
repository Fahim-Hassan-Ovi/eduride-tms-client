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

export default function LeafletMap({ vehicles = [], routes = [], center = { lat: 40.75, lng: -73.99 } }) {
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

    return () => {
      mounted = false;
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

  // update markers when vehicles change
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const L = window.L;

    const existingKeys = Object.keys(markersRef.current);
    const vKeys = vehicles.map(v => v.id);
    existingKeys.forEach(k => { if (!vKeys.includes(k)) { try { markersRef.current[k].remove(); } catch(e){} delete markersRef.current[k]; } });

    vehicles.forEach(v => {
      const pos = [v.lat, v.lng];
      if (markersRef.current[v.id]) {
        try { markersRef.current[v.id].setLatLng(pos); } catch(e){}
      } else {
        try {
          const icon = L.divIcon({ className: 'leaflet-marker-custom', html: `<div style="background:#4f46e5;color:white;padding:6px 10px;border-radius:20px;font-weight:700">${v.id.split('-')[1]}</div>` });
          const m = L.marker(pos, { icon }).addTo(mapRef.current).bindPopup(`<strong>${v.id}</strong><div>Driver: ${v.driver}</div><div>Route: ${v.route}</div>`);
          markersRef.current[v.id] = m;
        } catch(err) { console.warn('marker add err', err); }
      }
    });
  }, [loaded, vehicles]);

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


