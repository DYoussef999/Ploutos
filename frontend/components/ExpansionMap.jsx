'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ── Fallback listings (used only while backend loads or if it's unreachable) ─
// Once the backend responds, these are replaced with geocoded coordinates.
const DEFAULT_RECOMMENDATIONS = [
  {
    id: 1, name: 'Uptown Waterloo', address: '144 King St N, Waterloo, ON',
    latitude: 43.470999, longitude: -80.523882,
    opportunity_score: 85, estimated_rent: 4200, square_footage: 850, projected_profit_margin: 0.22,
    hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
  },
  {
    id: 2, name: 'Uptown Waterloo', address: '187 King St N, Waterloo, ON',
    latitude: 43.472932, longitude: -80.524608,
    opportunity_score: 80, estimated_rent: 5800, square_footage: 1200, projected_profit_margin: 0.18,
    hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
  },
  {
    id: 3, name: 'Uptown Waterloo', address: '22 Erb St W, Waterloo, ON',
    latitude: 43.464355, longitude: -80.525261,
    opportunity_score: 76, estimated_rent: 6500, square_footage: 1450, projected_profit_margin: 0.14,
    hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
  },
  {
    id: 4, name: 'Uptown Waterloo', address: '75 King St S, Waterloo, ON',
    latitude: 43.463424, longitude: -80.523406,
    opportunity_score: 83, estimated_rent: 3900, square_footage: 780, projected_profit_margin: 0.24,
    hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
  },
  {
    id: 5, name: 'Uptown Waterloo', address: '51 Erb St E, Waterloo, ON',
    latitude: 43.465630, longitude: -80.519046,
    opportunity_score: 81, estimated_rent: 4750, square_footage: 950, projected_profit_margin: 0.20,
    hourly: [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
  },
  {
    id: 6, name: 'Near WLU', address: '314 King St N, Waterloo, ON',
    latitude: 43.478965, longitude: -80.525533,
    opportunity_score: 78, estimated_rent: 2800, square_footage: 620, projected_profit_margin: 0.27,
    hourly: [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5],
  },
  {
    id: 7, name: 'Near WLU', address: '270 King St N, Waterloo, ON',
    latitude: 43.477325, longitude: -80.525189,
    opportunity_score: 75, estimated_rent: 3200, square_footage: 700, projected_profit_margin: 0.25,
    hourly: [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5],
  },
  {
    id: 8, name: 'Near WLU', address: '232 King St N, Waterloo, ON',
    latitude: 43.475377, longitude: -80.524337,
    opportunity_score: 73, estimated_rent: 3550, square_footage: 760, projected_profit_margin: 0.23,
    hourly: [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5],
  },
  {
    id: 9, name: 'University Corridor', address: '180 University Ave W, Waterloo, ON',
    latitude: 43.472000, longitude: -80.536385,
    opportunity_score: 72, estimated_rent: 2950, square_footage: 640, projected_profit_margin: 0.26,
    hourly: [5,5,5,5,5,5,10,25,65,80,75,70,55,50,70,75,65,45,35,25,15,10,8,5],
  },
  {
    id: 10, name: 'University Corridor', address: '152 University Ave W, Waterloo, ON',
    latitude: 43.472136, longitude: -80.536021,
    opportunity_score: 74, estimated_rent: 2600, square_footage: 580, projected_profit_margin: 0.28,
    hourly: [5,5,5,5,5,5,10,25,65,80,75,70,55,50,70,75,65,45,35,25,15,10,8,5],
  },
  {
    id: 11, name: 'Bridgeport', address: '89 Bridgeport Rd E, Waterloo, ON',
    latitude: 43.469492, longitude: -80.513335,
    opportunity_score: 55, estimated_rent: 2200, square_footage: 520, projected_profit_margin: 0.22,
    hourly: [3,3,3,3,3,5,10,20,40,55,60,65,60,55,50,45,40,35,30,20,12,8,5,3],
  },
  {
    id: 12, name: 'Bridgeport', address: '135 Bridgeport Rd E, Waterloo, ON',
    latitude: 43.470850, longitude: -80.510221,
    opportunity_score: 53, estimated_rent: 2450, square_footage: 560, projected_profit_margin: 0.21,
    hourly: [3,3,3,3,3,5,10,20,40,55,60,65,60,55,50,45,40,35,30,20,12,8,5,3],
  },
  {
    id: 13, name: 'North King', address: '410 King St N, Waterloo, ON',
    latitude: 43.484759, longitude: -80.526322,
    opportunity_score: 60, estimated_rent: 3100, square_footage: 680, projected_profit_margin: 0.23,
    hourly: [3,3,3,3,3,5,10,20,35,50,60,65,65,60,55,50,45,40,35,25,15,10,5,3],
  },
  {
    id: 14, name: 'North King', address: '450 King St N, Waterloo, ON',
    latitude: 43.487645, longitude: -80.526294,
    opportunity_score: 58, estimated_rent: 3350, square_footage: 720, projected_profit_margin: 0.22,
    hourly: [3,3,3,3,3,5,10,20,35,50,60,65,65,60,55,50,45,40,35,25,15,10,5,3],
  },
  {
    id: 15, name: 'Near WLU', address: '18 William St W, Waterloo, ON',
    latitude: 43.460154, longitude: -80.523023,
    opportunity_score: 76, estimated_rent: 2750, square_footage: 600, projected_profit_margin: 0.27,
    hourly: [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5],
  },
  {
    id: 16, name: 'Uptown Fringe', address: '44 Noecker St, Waterloo, ON',
    latitude: 43.471834, longitude: -80.521150,
    opportunity_score: 50, estimated_rent: 2100, square_footage: 490, projected_profit_margin: 0.23,
    hourly: [3,3,3,3,3,5,8,15,30,40,50,55,60,55,50,45,40,38,42,40,30,20,12,5],
  },
  {
    id: 17, name: 'Uptown Fringe', address: '11 Willow St W, Waterloo, ON',
    latitude: 43.465161, longitude: -80.518066,
    opportunity_score: 48, estimated_rent: 1950, square_footage: 460, projected_profit_margin: 0.24,
    hourly: [3,3,3,3,3,5,8,15,30,40,50,55,60,55,50,45,40,38,42,40,30,20,12,5],
  },
  {
    id: 18, name: 'University Corridor', address: '320 Albert St, Waterloo, ON',
    latitude: 43.477864, longitude: -80.534700,
    opportunity_score: 70, estimated_rent: 2850, square_footage: 630, projected_profit_margin: 0.26,
    hourly: [5,5,5,5,5,5,10,25,65,80,75,70,55,50,70,75,65,45,35,25,15,10,8,5],
  },
  {
    id: 19, name: 'Uptown Fringe', address: '88 Regina St N, Waterloo, ON',
    latitude: 43.469637, longitude: -80.522330,
    opportunity_score: 52, estimated_rent: 2300, square_footage: 510, projected_profit_margin: 0.22,
    hourly: [3,3,3,3,3,5,8,15,30,40,50,55,60,55,50,45,40,38,42,40,30,20,12,5],
  },
  {
    id: 20, name: 'North King', address: '500 King St N, Waterloo, ON',
    latitude: 43.491352, longitude: -80.526462,
    opportunity_score: 62, estimated_rent: 3600, square_footage: 800, projected_profit_margin: 0.21,
    hourly: [3,3,3,3,3,5,10,20,35,50,60,65,65,60,55,50,45,40,35,25,15,10,5,3],
  },
];

const HOURS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
const BUILDING_SIZE = 0.00022; // fallback square ~20m

// ── Helpers ───────────────────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 75) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function getScoreBg(score) {
  if (score >= 75) return 'rgba(74,222,128,0.1)';
  if (score >= 50) return 'rgba(251,191,36,0.1)';
  return 'rgba(248,113,113,0.1)';
}

function getScoreLabel(score) {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function getFootColor(busyness) {
  if (busyness >= 80) return '#86efac';
  if (busyness >= 60) return '#6ee7b7';
  if (busyness >= 40) return '#5eead4';
  if (busyness >= 20) return '#67e8f9';
  return '#7dd3fc';
}

function getTrafficLabel(busyness) {
  if (busyness >= 80) return 'Peak';
  if (busyness >= 60) return 'Busy';
  if (busyness >= 40) return 'Moderate';
  if (busyness >= 20) return 'Quiet';
  return 'Very Quiet';
}

function buildingSquare(lng, lat, size = BUILDING_SIZE) {
  return [
    [lng - size, lat - size],
    [lng + size, lat - size],
    [lng + size, lat + size],
    [lng - size, lat + size],
    [lng - size, lat - size],
  ];
}

function emptyGeoJSON() {
  return { type: 'FeatureCollection', features: [] };
}

function bufferPolygon(geometry, amount = 0.000015) {
  const expandRing = (ring) => {
    const cx = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const cy = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return ring.map(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      const len = Math.hypot(dx, dy) || 1;
      return [x + (dx / len) * amount, y + (dy / len) * amount];
    });
  };

  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: geometry.coordinates.map(expandRing) };
  }
  if (geometry.type === 'MultiPolygon') {
    return { ...geometry, coordinates: geometry.coordinates.map((poly) => poly.map(expandRing)) };
  }
  return geometry;
}

function buildFromRealFeature(feature, height) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { height },
      geometry: bufferPolygon(feature.geometry),
    }],
  };
}

function buildFallbackGeoJSON(rec) {
  if (!rec) return emptyGeoJSON();
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { height: 30 + rec.opportunity_score * 0.5 },
      geometry: { type: 'Polygon', coordinates: [buildingSquare(rec.longitude, rec.latitude)] },
    }],
  };
}

function buildHeatGeoJSON(recs, hour) {
  return {
    type: 'FeatureCollection',
    features: recs.map((rec) => ({
      type: 'Feature',
      properties: { intensity: rec.hourly[hour] / 100 },
      geometry: { type: 'Point', coordinates: [rec.longitude, rec.latitude] },
    })),
  };
}

let stylesInjected = false;
function injectStyles() {
  if (typeof window === 'undefined' || stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .expansion-popup .mapboxgl-popup-content {
      background: #0f172a !important;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 0;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .expansion-popup .mapboxgl-popup-tip { border-top-color: #0f172a !important; }
    .expansion-popup .mapboxgl-popup-close-button {
      color: #94a3b8;
      font-size: 18px;
      padding: 6px 10px;
      line-height: 1;
      background: transparent;
      border-radius: 0 10px 0 0;
    }
    .expansion-popup .mapboxgl-popup-close-button:hover {
      color: #f1f5f9;
      background: rgba(255,255,255,0.08);
    }
    .loc-card:hover { background: rgba(255,255,255,0.06) !important; }
    .loc-card.active { background: rgba(34,197,94,0.1) !important; border-color: rgba(34,197,94,0.4) !important; }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExpansionMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(null);

  // Stores building-centroid coords keyed by listing id.
  // Heatmap + popups use these so everything sits on the mesh, not the road.
  const snappedCoordsRef = useRef({});

  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearch, setShowSearch] = useState(true);

  const selectedRec = recommendations.find((r) => r.id === selectedId) || null;

  // ── Helper: find nearest building centroid for a listing ────────────────────
  function findBuildingCenter(map, lng, lat) {
    const point = map.project([lng, lat]);
    for (const radius of [30, 50, 75, 100]) {
      const bbox = [
        [point.x - radius, point.y - radius],
        [point.x + radius, point.y + radius],
      ];
      const buildings = map.queryRenderedFeatures(bbox, { layers: ['3d-buildings'] });
      if (buildings.length > 0) {
        const closest = buildings.reduce((best, f) => {
          if (!f.geometry) return best;
          const coords = f.geometry.type === 'Polygon'
            ? f.geometry.coordinates[0]
            : f.geometry.coordinates[0][0];
          const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
          const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
          const dist = Math.hypot(cx - lng, cy - lat);
          return !best || dist < best.dist ? { f, dist, cx, cy } : best;
        }, null);
        return { lng: closest.cx, lat: closest.cy, feature: closest.f };
      }
    }
    return null;
  }

  // ── Helper: build heatmap GeoJSON using snapped coords when available ──────
  function buildSnappedHeatGeoJSON(recs, hour) {
    const snapped = snappedCoordsRef.current;
    return {
      type: 'FeatureCollection',
      features: recs.map((rec) => {
        const s = snapped[rec.id];
        return {
          type: 'Feature',
          properties: { intensity: rec.hourly[hour] / 100 },
          geometry: {
            type: 'Point',
            coordinates: s ? [s.lng, s.lat] : [rec.longitude, rec.latitude],
          },
        };
      }),
    };
  }

  // ── Snap all listings to building centroids once tiles are loaded ──────────
  function snapAllListings(map, recs) {
    const snapped = {};
    let count = 0;
    for (const rec of recs) {
      const result = findBuildingCenter(map, rec.longitude, rec.latitude);
      if (result) {
        snapped[rec.id] = { lng: result.lng, lat: result.lat };
        count++;
      }
    }
    snappedCoordsRef.current = snapped;
    console.log(`📍 Snapped ${count}/${recs.length} listings to building centroids`);
    // Rebuild heatmap with snapped coords
    const src = map.getSource('foot-heat');
    if (src) src.setData(buildSnappedHeatGeoJSON(recs, currentHour));
  }

  // ── Fetch geocoded listings from backend on mount ─────────────────────────
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    fetch(`${API}/api/locations/all`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && data.locations?.length) {
          setRecommendations(data.locations);
          console.log('✅ Loaded geocoded listings from backend');
          // Re-snap to buildings with the new coords and update heatmap
          const map = mapRef.current;
          if (map && map.isStyleLoaded()) {
            map.once('idle', () => snapAllListings(map, data.locations));
          }
        }
      })
      .catch((err) => {
        console.warn('Backend not reachable, using hardcoded defaults:', err.message);
      });
  }, []);

  // ── Init Map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    injectStyles();
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-80.5230, 43.4730],
      zoom: 13,
      pitch: 30,
      bearing: -10,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find((l) => l.type === 'symbol' && l.layout['text-field'])?.id;

      // Dark city buildings
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

      // Foot traffic heatmap — starts empty, populated after building snap
      map.addSource('foot-heat', {
        type: 'geojson',
        data: emptyGeoJSON(),
      });
      map.addLayer({
        id: 'foot-heat-layer',
        type: 'heatmap',
        source: 'foot-heat',
        maxzoom: 22,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1.2],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 1.2, 17, 1.8],
          // Tight radius so each listing is a distinct circle, not a merged blob
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'],
            10, 6,    // zoomed out — tiny dots
            13, 12,   // city level — small circles
            15, 18,   // neighbourhood — clear circles
            17, 25,   // street level — visible on building
            19, 30,   // close up — sits on the building
          ],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 15, 0.75, 19, 0.85],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(14,116,144,0)',
            0.15, '#164e63',
            0.35, '#0e7490',
            0.55, '#0d9488',
            0.75, '#059669',
            1.0,  '#16a34a',
          ],
        },
      });

      // Selected building
      map.addSource('selected-building', {
        type: 'geojson',
        data: emptyGeoJSON(),
      });
      map.addLayer({
        id: 'selected-extrusion',
        type: 'fill-extrusion',
        source: 'selected-building',
        paint: {
          'fill-extrusion-color': '#2d6a4f',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.75,
        },
      });
      map.addLayer({
        id: 'selected-outline',
        type: 'line',
        source: 'selected-building',
        paint: {
          'line-color': '#4ade80',
          'line-width': 2,
          'line-opacity': 0.7,
        },
      });

      // Once tiles are loaded, snap all listings to building centroids
      // so the heatmap and popups sit on the meshes, not the road
      map.once('idle', () => {
        snapAllListings(map, DEFAULT_RECOMMENDATIONS);
      });
    });

    mapRef.current = map;
    return () => { map.remove(); };
  }, []);

  const moveEndRef = useRef(null);

  // ── When a card is selected: fly + snap green outline to real building ──────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const src = map.getSource('selected-building');
    if (!src) return;

    if (moveEndRef.current) {
      map.off('moveend', moveEndRef.current);
      moveEndRef.current = null;
    }
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

    if (!selectedRec) {
      src.setData(emptyGeoJSON());
      return;
    }

    // Use snapped (building centroid) coords if available, otherwise raw geocoded
    const snapped = snappedCoordsRef.current[selectedRec.id];
    const flyLng = snapped ? snapped.lng : selectedRec.longitude;
    const flyLat = snapped ? snapped.lat : selectedRec.latitude;

    map.flyTo({
      center: [flyLng, flyLat],
      zoom: 17,
      pitch: 58,
      bearing: -18,
      duration: 1800,
      essential: true,
    });

    const recSnapshot = selectedRec;

    const onMoveEnd = () => {
      if (moveEndRef.current !== onMoveEnd) return;
      moveEndRef.current = null;

      // Use the building finder helper
      const result = findBuildingCenter(map, recSnapshot.longitude, recSnapshot.latitude);

      // Determine popup position — prefer building centroid
      let popupLng = recSnapshot.longitude;
      let popupLat = recSnapshot.latitude;

      if (result) {
        const osmHeight = (result.feature.properties?.height || result.feature.properties?.render_height || 12) * 1.4;
        src.setData(buildFromRealFeature(result.feature, osmHeight));
        popupLng = result.lng;
        popupLat = result.lat;

        // Save to snap cache so heatmap stays in sync
        snappedCoordsRef.current[recSnapshot.id] = { lng: result.lng, lat: result.lat };
        // Refresh heatmap with this new snap
        const heatSrc = map.getSource('foot-heat');
        if (heatSrc) heatSrc.setData(buildSnappedHeatGeoJSON(recommendations, currentHour));
      } else {
        src.setData(buildFallbackGeoJSON(recSnapshot));
      }

      const busyness = recSnapshot.hourly[currentHour];
      if (popupRef.current) { popupRef.current.remove(); }
      popupRef.current = new mapboxgl.Popup({ offset: 30, className: 'expansion-popup', closeButton: true })
        .setLngLat([popupLng, popupLat])
        .setHTML(`
          <div style="font-family:'Inter',sans-serif;padding:14px;min-width:230px;color:#f1f5f9;">
            <h3 style="margin:0 0 4px;font-size:15px;font-weight:700;">${recSnapshot.name}</h3>
            <p style="margin:0 0 10px;font-size:11px;color:#64748b;">${recSnapshot.address}</p>
            <div style="display:flex;flex-direction:column;gap:5px;font-size:12px;">
              <div>🎯 <b>Score:</b> <span style="color:${getScoreColor(recSnapshot.opportunity_score)};font-weight:700;">${recSnapshot.opportunity_score}/100 · ${getScoreLabel(recSnapshot.opportunity_score)}</span></div>
              <div>🏠 <b>Est. Rent:</b> $${recSnapshot.estimated_rent.toLocaleString()}/mo</div>
              <div>📐 <b>Size:</b> ${recSnapshot.square_footage.toLocaleString()} sq ft</div>
              <div>📈 <b>Projected Margin:</b> ${(recSnapshot.projected_profit_margin * 100).toFixed(1)}%</div>
              <div>🚶 <b>Traffic Now:</b> <span style="color:${getFootColor(busyness)}">${busyness}% · ${getTrafficLabel(busyness)}</span></div>
            </div>
          </div>
        `)
        .addTo(map);
    };

    moveEndRef.current = onMoveEnd;
    map.on('moveend', onMoveEnd);
  }, [selectedId]);

  // ── Update foot traffic heatmap on hour change ────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('foot-heat');
    if (src) src.setData(buildSnappedHeatGeoJSON(recommendations, currentHour));
  }, [currentHour, recommendations]);

  // ── Toggle heatmap ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('foot-heat-layer')) return;
    map.setLayoutProperty('foot-heat-layer', 'visibility', heatmapVisible ? 'visible' : 'none');
  }, [heatmapVisible]);

  // ── Play animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => setCurrentHour((h) => (h + 1) % 24), 800);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying]);

  const handleAutoFill = () => {
    setBusinessType('Café / Coffee Shop');
    setLocation('Waterloo, ON');
    setBudget(4500);
    setSquareFootage(800);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 3000);
  };

  const handleSearch = async () => {
    if (!businessType) { setSearchError('Please select a business type.'); return; }
    if (!location.trim()) { setSearchError('Please enter a target location.'); return; }
    setSearchError('');
    setIsSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/locations/search`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_type: businessType,
            location: location,
            budget: budget ? parseFloat(budget) : null,
            square_footage: squareFootage ? parseFloat(squareFootage) : null,
          }),
        }
      );
      const data = await res.json();
      if (data.status === 'ok' && data.locations?.length) {
        setRecommendations(data.locations);
        setSelectedId(null);
        // Re-snap new results to building centroids
        const map = mapRef.current;
        if (map && map.isStyleLoaded()) {
          map.once('idle', () => snapAllListings(map, data.locations));
        }
      } else {
        setSearchError('No locations found. Try adjusting your filters.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Could not reach backend. Using demo data.');
      setRecommendations(DEFAULT_RECOMMENDATIONS);
    } finally {
      setIsSearching(false);
      setShowSearch(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">

      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* ── Left Sidebar ── */}
      <div className="absolute top-16 left-0 bottom-0 w-80 z-10 flex flex-col pointer-events-auto"
        style={{ background: 'rgba(10,14,28,0.97)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Search panel — collapses after search */}
        {showSearch ? (
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm mb-3 tracking-wide">🔍 Find Expansion Locations</h2>

            <div className="mb-2">
              <select value={businessType} onChange={(e) => { setBusinessType(e.target.value); setSearchError(''); }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500 transition">
                <option value="" disabled>Business type...</option>
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

            <div className="mb-2">
              <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setSearchError(''); }}
                placeholder="Target city or region..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500 transition" />
            </div>

            <div className="mb-2 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                <input type="number" value={budget || ''} onChange={(e) => setBudget(e.target.value)}
                  placeholder="Max rent/mo"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg pl-6 pr-2 py-2 text-xs focus:outline-none focus:border-green-500 transition" />
              </div>
              <div className="relative flex-1">
                <input type="number" value={squareFootage || ''} onChange={(e) => setSquareFootage(e.target.value)}
                  placeholder="Sq ft needed"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div className="mb-2 flex justify-end">
              <button onClick={handleAutoFill}
                className="px-2 py-1.5 rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition whitespace-nowrap">
                ⚡ Auto-fill demo
              </button>
            </div>
            {autoFilled && <p className="text-xs text-blue-400 mb-1 animate-pulse">✓ Filled from Financial Sandbox</p>}
            {searchError && <p className="text-xs text-red-400 mb-1">{searchError}</p>}

            <button onClick={handleSearch} disabled={isSearching}
              className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 text-slate-900 font-bold text-xs transition disabled:opacity-50 shadow-lg shadow-green-500/20">
              {isSearching ? 'Searching...' : '🚀 Find Best Locations'}
            </button>
          </div>
        ) : (
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-white text-xs font-semibold">{businessType || 'All types'} · {location || 'Waterloo'}</div>
              <div className="text-slate-400 text-xs mt-0.5">{recommendations.length} locations found</div>
            </div>
            <button onClick={() => setShowSearch(true)}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded px-2 py-1 transition">
              Edit
            </button>
          </div>
        )}

        {/* Location cards list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
          {recommendations
            .sort((a, b) => b.opportunity_score - a.opportunity_score)
            .map((rec, idx) => {
              const busyness = rec.hourly[currentHour];
              const isActive = selectedId === rec.id;
              return (
                <div key={rec.id}
                  className="loc-card"
                  onClick={() => setSelectedId(isActive ? null : rec.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}>

                  {/* Row 1: rank + name + score badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', minWidth: 14 }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isActive ? '#4ade80' : '#f1f5f9' }}>
                      {rec.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      color: getScoreColor(rec.opportunity_score),
                      background: getScoreBg(rec.opportunity_score),
                      border: `1px solid ${getScoreColor(rec.opportunity_score)}44`,
                    }}>
                      {rec.opportunity_score}
                    </span>
                  </div>

                  {/* Row 2: address */}
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, paddingLeft: 22 }}>
                    {rec.address}
                  </div>

                  {/* Row 3: stats */}
                  <div style={{ display: 'flex', gap: 10, paddingLeft: 22, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      🏠 <span style={{ color: '#cbd5e1' }}>${rec.estimated_rent.toLocaleString()}/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      📐 <span style={{ color: '#cbd5e1' }}>{rec.square_footage.toLocaleString()} ft²</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      📈 <span style={{ color: '#cbd5e1' }}>{(rec.projected_profit_margin * 100).toFixed(0)}% margin</span>
                    </div>
                  </div>

                  {/* Row 4: foot traffic bar */}
                  <div style={{ paddingLeft: 22, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: '#475569' }}>🚶 Foot traffic · {HOURS[currentHour]}</span>
                      <span style={{ fontSize: 10, color: getFootColor(busyness), fontWeight: 600 }}>
                        {getTrafficLabel(busyness)}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${busyness}%`,
                        background: getFootColor(busyness),
                        borderRadius: 4, transition: 'width 0.4s, background 0.4s',
                      }} />
                    </div>
                  </div>

                  {/* Expand hint */}
                  {isActive && (
                    <div style={{ paddingLeft: 22, marginTop: 8, fontSize: 10, color: '#22c55e', opacity: 0.7 }}>
                      ↑ Viewing on map · click again to deselect
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Foot traffic heatmap toggle at bottom of sidebar */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setHeatmapVisible((prev) => !prev)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: heatmapVisible ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.04)',
              border: heatmapVisible ? '1px solid rgba(20,184,166,0.35)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
            <span style={{ fontSize: 12, color: heatmapVisible ? '#14b8a6' : '#475569', fontWeight: 600 }}>
              🌡 Foot Traffic Heatmap
            </span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700,
              background: heatmapVisible ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
              color: heatmapVisible ? '#14b8a6' : '#475569',
            }}>
              {heatmapVisible ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Timeline — bottom center (accounts for sidebar) ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-20%)',
        zIndex: 10, background: 'rgba(10,14,28,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: '10px 14px',
        backdropFilter: 'blur(8px)', minWidth: 520,
      }} className="pointer-events-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#14b8a6', letterSpacing: '0.18em', fontFamily: 'monospace' }}>
            FOOT TRAFFIC · {HOURS[currentHour]}{currentHour === new Date().getHours() ? ' · NOW' : ' · FORECAST'}
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{
            background: isPlaying ? 'rgba(255,80,80,0.15)' : 'rgba(20,184,166,0.12)',
            border: isPlaying ? '1px solid rgba(255,80,80,0.4)' : '1px solid rgba(20,184,166,0.35)',
            borderRadius: 4, padding: '3px 10px',
            color: isPlaying ? '#ff5050' : '#14b8a6',
            fontSize: 10, cursor: 'pointer', fontFamily: 'monospace',
          }}>
            {isPlaying ? '⏹ STOP' : '▶ PLAY'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {HOURS.map((h, i) => {
            const avg = recommendations.reduce((sum, r) => sum + r.hourly[i], 0) / recommendations.length;
            const color = getFootColor(avg);
            const isNow = i === new Date().getHours();
            const isSelected = i === currentHour;
            return (
              <div key={i} onClick={() => setCurrentHour(i)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 17, height: 36,
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 3, overflow: 'hidden',
                  border: isSelected ? `1px solid ${color}` : isNow ? '1px solid #4a9eff' : '1px solid transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, width: '100%',
                    height: `${avg}%`,
                    background: isSelected ? color : `${color}66`,
                    borderRadius: 2, transition: 'height 0.3s',
                  }} />
                </div>
                <div style={{
                  fontSize: 7, marginTop: 2, fontFamily: 'monospace',
                  color: isSelected ? 'white' : isNow ? '#4a9eff' : 'rgba(255,255,255,0.2)',
                  fontWeight: isSelected || isNow ? 'bold' : 'normal',
                }}>
                  {i % 3 === 0 ? h : ''}
                </div>
                {isNow && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#4a9eff', marginTop: 1 }} />}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}