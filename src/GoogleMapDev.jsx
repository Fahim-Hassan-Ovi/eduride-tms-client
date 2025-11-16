import { useEffect, useRef, useState } from 'react';

function loadGoogleMapsNoKey() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps);
    const existing = document.getElementById('gmaps-dev-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'gmaps-dev-script';
    // Intentionally omit key for development; this shows 'For Development Purposes Only' watermark
    script.src = `https://maps.googleapis.com/maps/api/js`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

export default function GoogleMapDev({ vehicles = [], routes = [], center = { lat: 40.75, lng: -73.99 } }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polysRef = useRef({});
  const animIntervals = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadGoogleMapsNoKey().then((maps) => {
      if (!mounted) return;
      mapRef.current = new maps.Map(mapElRef.current, { center, zoom: 13 });
      setLoaded(true);
      console.warn('Google Maps loaded without API key — development watermark may appear.');
    }).catch(err => console.error('Google Maps dev load error', err));

    return () => {
      mounted = false;
      animIntervals.current.forEach(clearInterval);
      animIntervals.current = [];
      try {
        if (markersRef.current) Object.values(markersRef.current).forEach(m => { try { m.setMap && m.setMap(null); } catch(e){} });
        if (polysRef.current) Object.values(polysRef.current).forEach(p => { try { p.setMap && p.setMap(null); } catch(e){} });
      } catch (e) {}

      // Attempt safe DOM cleanup of map children to avoid React removeChild mismatches
      try {
        if (mapRef.current && mapRef.current.getDiv) {
          const div = mapRef.current.getDiv();
          if (div) {
            // remove all children inserted by the maps SDK
            while (div.firstChild) {
              try { div.removeChild(div.firstChild); } catch (e) { break; }
            }
          }
        }
      } catch (e) {}

      // Try to clear any remaining instance listeners
      try {
        if (window.google && window.google.maps && window.google.maps.event && window.google.maps.event.clearInstanceListeners) {
          try { window.google.maps.event.clearInstanceListeners(mapRef.current); } catch(e){}
        }
      } catch(e) {}
    };
  }, []);

  useEffect(() => {
    if (!loaded || !window.google || !mapRef.current) return;
    const maps = window.google.maps;

    const existingKeys = Object.keys(markersRef.current);
    const vehicleKeys = vehicles.map(v => v.id);
    existingKeys.forEach(k => { if (!vehicleKeys.includes(k)) { try { markersRef.current[k].setMap(null); } catch(e){} delete markersRef.current[k]; } });

    vehicles.forEach(v => {
      const pos = { lat: v.lat, lng: v.lng };
      if (markersRef.current[v.id]) {
        try { markersRef.current[v.id].setPosition(pos); } catch(e){}
      } else {
        try {
          if (maps.marker && maps.marker.AdvancedMarkerElement) {
            const el = document.createElement('div');
            el.innerHTML = `<div style="background:#4f46e5;color:white;padding:6px 10px;border-radius:20px;font-weight:700">${v.id}</div>`;
            const adv = new maps.marker.AdvancedMarkerElement({ position: pos, map: mapRef.current, content: el });
            adv.addListener && adv.addListener('click', () => {
              try { new maps.InfoWindow({ content: `<div><strong>${v.name || v.id}</strong><div>Number: ${v.number || 'N/A'}</div></div>` }).open({ anchor: adv, map: mapRef.current }); } catch(e){}
            });
            markersRef.current[v.id] = adv;
          } else {
            const marker = new maps.Marker({ position: pos, map: mapRef.current, title: v.id });
            const info = new maps.InfoWindow({ content: `<div><strong>${v.name || v.id}</strong><div>Number: ${v.number || 'N/A'}</div></div>` });
            marker.addListener('click', () => info.open({ anchor: marker, map: mapRef.current }));
            markersRef.current[v.id] = marker;
          }
        } catch (mkErr) { console.warn('marker create err', mkErr); }
      }
    });
  }, [loaded, vehicles]);

  useEffect(() => {
    if (!loaded || !window.google || !mapRef.current) return;
    const maps = window.google.maps;

    Object.values(polysRef.current).forEach(p => p.setMap(null));
    polysRef.current = {};
    animIntervals.current.forEach(clearInterval);
    animIntervals.current = [];

    routes.forEach((r) => {
      const path = r.path.map(p => ({ lat: p[0], lng: p[1] }));
      const line = new maps.Polyline({ path, geodesic: true, strokeColor: '#2563EB', strokeOpacity: 0.6, strokeWeight: 4, map: mapRef.current });
      polysRef.current[r.id] = line;
      let offset = 0;
      const id = setInterval(() => {
        offset = (offset + 1) % 100;
        const icons = line.get('icons') || [];
        if (icons[0]) { icons[0].offset = offset + '%'; line.set('icons', icons); }
      }, 80);
      animIntervals.current.push(id);
    });
  }, [loaded, routes]);

  return (
    <div ref={mapElRef} style={{ width: '100%', height: '100%', minHeight: 360 }} className="rounded-md overflow-hidden">
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-sm text-gray-600">Loading Google Maps (dev mode)...</div>
        </div>
      )}
    </div>
  );
}


