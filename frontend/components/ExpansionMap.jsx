'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ── Opportunity Locations ────────────────────────────────────────────────────
const DEFAULT_RECOMMENDATIONS = [
  { id: 1, name: 'Uptown Waterloo', latitude: 43.4668, longitude: -80.5224, opportunity_score: 87, estimated_rent: 3200, projected_profit_margin: 0.24 },
  { id: 2, name: 'Downtown Kitchener', latitude: 43.4516, longitude: -80.4925, opportunity_score: 72, estimated_rent: 2750, projected_profit_margin: 0.19 },
  { id: 3, name: 'University Ave Plaza', latitude: 43.4723, longitude: -80.5449, opportunity_score: 91, estimated_rent: 3800, projected_profit_margin: 0.28 },
  { id: 4, name: 'Laurelwood District', latitude: 43.4455, longitude: -80.5612, opportunity_score: 45, estimated_rent: 2100, projected_profit_margin: 0.14 },
];

// ── Foot Traffic Data ────────────────────────────────────────────────────────
const FOOT_TRAFFIC_VENUES = [
  { name: 'Tim Hortons', lat: 43.4723, lng: -80.5449, hourly: [10,8,15,5,10,30,65,80,75,70,60,55,50,60,70,65,55,50,45,40,35,30,20,10] },
  { name: 'Waterloo Town Square', lat: 43.4668, lng: -80.5164, hourly: [5,5,5,5,5,10,20,40,60,75,85,90,88,85,80,75,70,65,55,40,30,20,10,5] },
  { name: 'Conestoga Mall', lat: 43.5016, lng: -80.5198, hourly: [5,5,5,5,5,5,10,15,20,50,75,90,95,90,85,80,70,60,45,30,20,10,5,5] },
  { name: 'WLU Campus', lat: 43.4723, lng: -80.5271, hourly: [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5] },
  { name: 'Uptown Waterloo', lat: 43.4668, lng: -80.5222, hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15] },
];

const HOURS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getRecommendationReason(rec) {
  if (rec.opportunity_score >= 75) return 'High foot traffic area with strong consumer demand and favorable rent-to-revenue ratio.';
  if (rec.opportunity_score >= 50) return 'Moderate opportunity with growing local market. Competitive rent supports healthy margins.';
  return 'Higher competition zone. Strong brand differentiation recommended before entering.';
}

function getMarkerColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function getMarkerRgba(score, alpha) {
  if (score >= 75) return `rgba(34,197,94,${alpha})`;
  if (score >= 50) return `rgba(234,179,8,${alpha})`;
  return `rgba(239,68,68,${alpha})`;
}

function getFootColor(score) {
  if (score >= 80) return '#ff0000';
  if (score >= 60) return '#ff8800';
  if (score >= 40) return '#ffcc00';
  if (score >= 20) return '#00cc44';
  return '#0066ff';
}

function buildFootGeoJSON(hour) {
  return {
    type: 'FeatureCollection',
    features: FOOT_TRAFFIC_VENUES.map((v) => ({
      type: 'Feature',
      properties: { intensity: v.hourly[hour] / 100, busyness: v.hourly[hour] },
      geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
    })),
  };
}

function getPulseAnimation(score) {
  if (score >= 75) return 'pulse-ring-green 2s cubic-bezier(0.4,0,0.6,1) infinite';
  if (score >= 50) return 'pulse-ring-yellow 2s cubic-bezier(0.4,0,0.6,1) infinite';
  return 'pulse-ring-red 2s cubic-bezier(0.4,0,0.6,1) infinite';
}

function createMarkerElement(rec) {
  const color = getMarkerColor(rec.opportunity_score);
  const glowRgba = getMarkerRgba(rec.opportunity_score, 0.35);
  const el = document.createElement('div');
  el.style.cssText = `
    width:40px;height:40px;border-radius:50%;background:${color};
    display:flex;align-items:center;justify-content:center;
    font-weight:800;font-size:13px;color:#0f172a;cursor:pointer;
    box-shadow:0 0 12px 4px ${glowRgba};
    animation:${getPulseAnimation(rec.opportunity_score)};
    border:2px solid rgba(255,255,255,0.25);
    font-family:'Inter',system-ui,sans-serif;
  `;
  el.textContent = rec.opportunity_score;
  return el;
}

let stylesInjected = false;
function injectStyles() {
  if (typeof window === 'undefined' || stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-ring-green {
      0%   { transform:scale(0.95); box-shadow:0 0 0 0 rgba(34,197,94,0.6); }
      70%  { transform:scale(1);    box-shadow:0 0 0 10px rgba(34,197,94,0); }
      100% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(34,197,94,0); }
    }
    @keyframes pulse-ring-yellow {
      0%   { transform:scale(0.95); box-shadow:0 0 0 0 rgba(234,179,8,0.6); }
      70%  { transform:scale(1);    box-shadow:0 0 0 10px rgba(234,179,8,0); }
      100% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(234,179,8,0); }
    }
    @keyframes pulse-ring-red {
      0%   { transform:scale(0.95); box-shadow:0 0 0 0 rgba(239,68,68,0.6); }
      70%  { transform:scale(1);    box-shadow:0 0 0 10px rgba(239,68,68,0); }
      100% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(239,68,68,0); }
    }
    .expansion-popup .mapboxgl-popup-content {
      background:#0f172a !important;
      border:1px solid #334155;
      border-radius:10px;
      padding:0;
      box-shadow:0 25px 50px rgba(0,0,0,0.5);
    }
    .expansion-popup .mapboxgl-popup-tip {
      border-top-color:#0f172a !important;
    }
  `;
  document.head.appendChild(style);
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ExpansionMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [footTrafficVisible, setFootTrafficVisible] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(null);

  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // ── Init Map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    injectStyles();
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-80.5204, 43.4643],
      zoom: 13,
      pitch: 55,
      bearing: -17.6,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      // 3D buildings
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find((l) => l.type === 'symbol' && l.layout['text-field'])?.id;
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 12,
        paint: {
          'fill-extrusion-color': '#1a1a2e',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.85,
        },
      }, labelLayerId);

      // ── Foot traffic heatmap ──
      map.addSource('foot-traffic', {
        type: 'geojson',
        data: buildFootGeoJSON(new Date().getHours()),
      });

      map.addLayer({
        id: 'foot-traffic-heat',
        type: 'heatmap',
        source: 'foot-traffic',
        maxzoom: 22,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 40, 13, 80, 16, 120],
          'heatmap-opacity': 0.75,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,255,0)',
            0.1, '#0066ff',
            0.3, '#00cc44',
            0.5, '#ffcc00',
            0.7, '#ff8800',
            1.0, '#ff0000',
          ],
        },
      });
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // ── Add opportunity markers + opportunity heatmap ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof window === 'undefined') return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    function addMarkersAndHeatmap() {
      if (map.getSource('recommendations-heat')) {
        map.removeLayer('recommendations-heatmap');
        map.removeSource('recommendations-heat');
      }

      recommendations.forEach((rec) => {
        const el = createMarkerElement(rec);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          new mapboxgl.Popup({ offset: 25, className: 'expansion-popup' })
            .setLngLat([rec.longitude, rec.latitude])
            .setHTML(`
              <div style="font-family:'Inter',sans-serif;padding:12px;min-width:220px;background:#0f172a;border-radius:10px;color:#f1f5f9;">
                <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#f8fafc;">${rec.name}</h3>
                <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
                  <div>🎯 <strong>Opportunity Score:</strong> <span style="color:${getMarkerColor(rec.opportunity_score)};font-weight:700;">${rec.opportunity_score}/100</span></div>
                  <div>🏠 <strong>Est. Monthly Rent:</strong> $${rec.estimated_rent.toLocaleString()}</div>
                  <div>📈 <strong>Projected Margin:</strong> ${(rec.projected_profit_margin * 100).toFixed(1)}%</div>
                </div>
                <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">${getRecommendationReason(rec)}</p>
              </div>
            `)
            .addTo(map);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([rec.longitude, rec.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });

      map.addSource('recommendations-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: recommendations.map((r) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
            properties: { score: r.opportunity_score },
          })),
        },
      });

      map.addLayer({
        id: 'recommendations-heatmap',
        type: 'heatmap',
        source: 'recommendations-heat',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'score'], 0, 0, 100, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.2, 'rgba(239,68,68,0.6)',
            0.5, 'rgba(234,179,8,0.7)',
            1,   'rgba(34,197,94,0.9)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 15, 60],
          'heatmap-opacity': 0.6,
        },
      });
    }

    if (map.isStyleLoaded()) addMarkersAndHeatmap();
    else map.once('load', addMarkersAndHeatmap);
  }, [recommendations]);

  // ── Toggle opportunity heatmap ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current.getLayer('recommendations-heatmap')) {
      mapRef.current.setLayoutProperty('recommendations-heatmap', 'visibility', heatmapVisible ? 'visible' : 'none');
    }
  }, [heatmapVisible]);

  // ── Update foot traffic on hour change ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('foot-traffic');
    if (!source) return;
    source.setData(buildFootGeoJSON(currentHour));
  }, [currentHour]);

  // ── Toggle foot traffic layer ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('foot-traffic-heat')) return;
    map.setLayoutProperty('foot-traffic-heat', 'visibility', footTrafficVisible ? 'visible' : 'none');
  }, [footTrafficVisible]);

  // ── Play animation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => setCurrentHour((h) => (h + 1) % 24), 800);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAutoFill = () => {
    setBusinessType('Café / Coffee Shop');
    setLocation('Waterloo, ON');
    setBudget(4500);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 3000);
  };

  const handleSearch = () => {
    if (!businessType) { setSearchError('Please select a business type.'); return; }
    if (!location.trim()) { setSearchError('Please enter a target location.'); return; }
    setSearchError('');
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">

      {/* Map base layer */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* Search Panel */}
      <div className="absolute top-20 left-4 z-10 w-80 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <h2 className="text-white font-bold text-base mb-4 tracking-wide">🔍 Find Expansion Locations</h2>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1">Business Type</label>
          <select value={businessType} onChange={(e) => { setBusinessType(e.target.value); setSearchError(''); }}
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition">
            <option value="" disabled>Select type...</option>
            <option>Retail Store</option>
            <option>Café / Coffee Shop</option>
            <option>Restaurant</option>
            <option>Fitness Studio</option>
            <option>Salon &amp; Spa</option>
            <option>Medical / Dental Clinic</option>
            <option>Co-working Space</option>
            <option>Grocery / Convenience</option>
            <option>Boutique Hotel</option>
            <option>Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-400 mb-1">Target City or Region</label>
          <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setSearchError(''); }}
            placeholder="e.g. Waterloo, ON"
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
        </div>

        <div className="mb-3">
          <button onClick={handleAutoFill}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-500/60 bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all duration-200">
            ⚡ Auto-Fill with My Finances
          </button>
          {autoFilled && <p className="text-xs text-blue-400 text-center mt-1 animate-pulse">✓ Filled from your Financial Sandbox</p>}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Max Monthly Rent Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
            <input type="number" value={budget || ''} onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 4500"
              className="w-full bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
          </div>
        </div>

        {searchError && <p className="text-xs text-red-400 mb-2">{searchError}</p>}

        <button onClick={handleSearch} disabled={isSearching}
          className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-slate-900 font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20">
          {isSearching ? 'Searching...' : '🚀 Find Best Locations'}
        </button>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-6 left-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 text-xs text-slate-300 pointer-events-auto">
        <div className="font-semibold text-white mb-2">Opportunity Score</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> High (75–100)</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Medium (50–74)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Low (0–49)</div>

        <div className="border-t border-slate-700 mt-3 pt-3">
          <div className="font-semibold text-white mb-2">Foot Traffic</div>
          {[['#ff0000','Peak'],['#ff8800','High'],['#ffcc00','Medium'],['#00cc44','Low'],['#0066ff','Very Low']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2 mb-1">
              <span style={{ background: c }} className="w-3 h-3 rounded-full inline-block" /> {l}
            </div>
          ))}
        </div>
      </div>

      {/* Opportunity heatmap toggle */}
      <button onClick={() => setHeatmapVisible((prev) => !prev)}
        className={`absolute bottom-32 right-6 z-10 pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-xl border transition-all duration-200 ${
          heatmapVisible ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30' : 'bg-slate-800/90 border-slate-600 text-slate-400 hover:bg-slate-700'
        }`}>
        <span className={`w-2 h-2 rounded-full ${heatmapVisible ? 'bg-green-400' : 'bg-slate-500'}`} />
        {heatmapVisible ? 'Opportunity: ON' : 'Opportunity: OFF'}
      </button>

      {/* Foot traffic toggle */}
      <button onClick={() => setFootTrafficVisible((prev) => !prev)}
        className={`absolute bottom-20 right-6 z-10 pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-xl border transition-all duration-200 ${
          footTrafficVisible ? 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30' : 'bg-slate-800/90 border-slate-600 text-slate-400 hover:bg-slate-700'
        }`}>
        <span className={`w-2 h-2 rounded-full ${footTrafficVisible ? 'bg-blue-400' : 'bg-slate-500'}`} />
        {footTrafficVisible ? 'Foot Traffic: ON' : 'Foot Traffic: OFF'}
      </button>

      {/* Timeline — bottom center */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, background: 'rgba(15,23,42,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, padding: '12px 16px',
        backdropFilter: 'blur(8px)', minWidth: 580,
      }} className="pointer-events-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: '#3a6aaa', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
            FOOT TRAFFIC TIMELINE · {HOURS[currentHour]} {currentHour === new Date().getHours() ? '· NOW' : '· FORECAST'}
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{
            background: isPlaying ? 'rgba(255,80,80,0.2)' : 'rgba(0,229,160,0.15)',
            border: isPlaying ? '1px solid rgba(255,80,80,0.5)' : '1px solid rgba(0,229,160,0.4)',
            borderRadius: 4, padding: '4px 12px',
            color: isPlaying ? '#ff5050' : '#00e5a0',
            fontSize: 10, cursor: 'pointer', fontFamily: 'monospace',
          }}>
            {isPlaying ? '⏹ STOP' : '▶ PLAY'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
          {HOURS.map((h, i) => {
            const avg = FOOT_TRAFFIC_VENUES.reduce((sum, v) => sum + v.hourly[i], 0) / FOOT_TRAFFIC_VENUES.length;
            const color = getFootColor(avg);
            const isNow = i === new Date().getHours();
            const isSelected = i === currentHour;
            return (
              <div key={i} onClick={() => setCurrentHour(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 18, height: 40,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3, overflow: 'hidden',
                  border: isSelected ? `1px solid ${color}` : isNow ? '1px solid #4a9eff' : '1px solid transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, width: '100%',
                    height: `${avg}%`,
                    background: isSelected ? color : `${color}77`,
                    borderRadius: 2, transition: 'height 0.3s',
                  }} />
                </div>
                <div style={{
                  fontSize: 7, marginTop: 3, fontFamily: 'monospace',
                  color: isSelected ? 'white' : isNow ? '#4a9eff' : 'rgba(255,255,255,0.25)',
                  fontWeight: isSelected || isNow ? 'bold' : 'normal',
                }}>
                  {i % 3 === 0 ? h : ''}
                </div>
                {isNow && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4a9eff', marginTop: 1 }} />}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}