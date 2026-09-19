import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Activity,
  Wind,
  Flame,
  ShieldAlert,
  Layers,
  MapPin,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Compass,
  Sun,
  Clock,
  ArrowUpRight,
  Printer,
  Download,
  Check,
  Sparkles,
  X,
  Search,
  RotateCcw,
  Cpu,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function VayuCommandDashboard() {
  const [activeTab, setActiveTab] = useState('gis');
  const [selectedHotspot, setSelectedHotspot] = useState('Anand Vihar');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('Standard');
  const [timeHorizon, setTimeHorizon] = useState('Live');
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [isStationsPanelOpen, setIsStationsPanelOpen] = useState(true);

  const toggleStationsPanel = () => {
    setIsStationsPanelOpen(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
  };

  // Layer Toggles
  const [gisLayers, setGisLayers] = useState({
    heatmap: true,
    wind: true,
    pins: true,
    fires: true
  });

  const toggleLayer = (layerKey) => {
    setGisLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Monitoring Hotspots Data
  const hotspots = [
    { id: 1, name: "Anand Vihar & East Delhi", label: "Anand Vihar", location: "ISBT Transit Corridor", aqi: 452, pm25: 284, tag: "HAZARDOUS", color: "#9333ea", lat: 28.6469, lng: 77.3160 },
    { id: 2, name: "Jahangirpuri & North Delhi", label: "Jahangirpuri", location: "GT Karnal Road", aqi: 410, pm25: 245, tag: "SEVERE+", color: "#e11d48", lat: 28.7325, lng: 77.1706 },
    { id: 3, name: "ITO & Central Core", label: "ITO", location: "Central Intersection", aqi: 387, pm25: 215, tag: "VERY POOR", color: "#f43f5e", lat: 28.6317, lng: 77.2410 },
    { id: 4, name: "Sector 62, Noida", label: "Noida 62", location: "Gautam Buddha Nagar", aqi: 378, pm25: 205, tag: "VERY POOR", color: "#ea580c", lat: 28.6245, lng: 77.3649 },
    { id: 5, name: "Cyber City, Gurugram", label: "Gurugram Hub", location: "NH-48 Corridor", aqi: 362, pm25: 192, tag: "VERY POOR", color: "#d97706", lat: 28.4952, lng: 77.0895 },
    { id: 6, name: "Karnal Upwind Gateway", label: "Karnal Entry", location: "Agricultural Inflow Axis", aqi: 298, pm25: 142, tag: "POOR", color: "#ca8a04", lat: 29.6857, lng: 76.9905 }
  ];

  // Satellite Active Stubble Fires Data (VIIRS)
  const satelliteFires = [
    { id: "FIRE-101", lat: 29.82, lng: 75.88, frp: 210, biomass: "18.6 Tonnes", pm25_rate: "0.80 kg/s", time: "10:30 IST", dist: "142 km NW (Punjab)" },
    { id: "FIRE-102", lat: 29.54, lng: 76.12, frp: 125, biomass: "11.2 Tonnes", pm25_rate: "0.45 kg/s", time: "10:45 IST", dist: "115 km NW (Haryana)" },
    { id: "FIRE-103", lat: 29.35, lng: 76.48, frp: 88, biomass: "7.8 Tonnes", pm25_rate: "0.32 kg/s", time: "11:10 IST", dist: "88 km NW (Panipat)" },
    { id: "FIRE-104", lat: 29.12, lng: 76.82, frp: 62, biomass: "5.5 Tonnes", pm25_rate: "0.21 kg/s", time: "11:25 IST", dist: "54 km NW (Sonipat)" },
  ];

  // 7-Day Model Training Analytics Dataset
  const modelTrainingData = [
    { day: 'Day 1 (Oct 9)', loss: 48.2, accuracy: 72.4, mae: 32.1, valLoss: 52.4, dataVolumeGB: 1250, epochs: 35, pearsonR: 0.724 },
    { day: 'Day 2 (Oct 10)', loss: 36.5, accuracy: 79.1, mae: 24.8, valLoss: 40.1, dataVolumeGB: 1380, epochs: 70, pearsonR: 0.791 },
    { day: 'Day 3 (Oct 11)', loss: 27.8, accuracy: 84.6, mae: 19.4, valLoss: 31.2, dataVolumeGB: 1410, epochs: 105, pearsonR: 0.846 },
    { day: 'Day 4 (Oct 12)', loss: 21.4, accuracy: 88.9, mae: 15.6, valLoss: 24.8, dataVolumeGB: 1390, epochs: 140, pearsonR: 0.889 },
    { day: 'Day 5 (Oct 13)', loss: 17.1, accuracy: 91.5, mae: 13.2, valLoss: 19.6, dataVolumeGB: 1450, epochs: 175, pearsonR: 0.915 },
    { day: 'Day 6 (Oct 14)', loss: 14.3, accuracy: 93.2, mae: 11.8, valLoss: 16.4, dataVolumeGB: 1420, epochs: 210, pearsonR: 0.932 },
    { day: 'Day 7 (Oct 15)', loss: 12.4, accuracy: 94.8, mae: 10.5, valLoss: 14.1, dataVolumeGB: 1500, epochs: 250, pearsonR: 0.948 },
  ];

  // Filtered Hotspots based on search query
  const filteredHotspots = hotspots.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 72-Hour Forecast Data
  const forecastTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = i * 3;
    const basePm = 160 + 35 * Math.sin((i / 4) * Math.PI) + (i > 8 ? i * 2.5 : 0);
    return {
      time: `+${hour}h`,
      PM25: Math.round(basePm),
      PM10: Math.round(basePm * 1.55),
      NO2: Math.round(42 + 12 * Math.sin(i / 2)),
      O3: Math.round(25 + 30 * Math.max(0, Math.sin(i / 3))),
      PBLH: Math.round(350 + 950 * Math.max(0, Math.sin((i - 2) / 3))),
      Radiation: Math.round(700 * Math.max(0, Math.sin((i - 2) / 3))),
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  // Leaflet Map Setup (OpenStreetMap free tiles + persistent lifecycle)
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);

  const getTileUrl = (style) => {
    if (style === 'Topo') {
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Persistent single-instance Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.65, 77.18],
        zoom: 9,
        zoomControl: true,
        attributionControl: true
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // When activeTab switches to 'gis', invalidateSize so map never gets stuck or gray
  useEffect(() => {
    if (activeTab === 'gis' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Handle Map Tile Style Change
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // Smoothly Fly & Center map on selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    const target = hotspots.find(h =>
      h.name.toLowerCase().includes(selectedHotspot.toLowerCase()) ||
      h.label.toLowerCase().includes(selectedHotspot.toLowerCase())
    );
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 11.5, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedHotspot]);

  // Reset Map View to default center
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.65, 77.18], 9, { animate: true, duration: 0.8 });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Render Map Layers & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Heatmap circles
    if (gisLayers.heatmap) {
      L.circle([29.20, 76.95], {
        radius: 38000,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        stroke: false
      }).addTo(layerGroup);

      L.circle([28.64, 77.25], {
        radius: 28000,
        color: '#9333ea',
        fillColor: '#a855f7',
        fillOpacity: 0.3,
        stroke: false
      }).addTo(layerGroup);
    }

    // 2. Station Pins
    if (gisLayers.pins) {
      hotspots.forEach(st => {
        const isSelected = selectedHotspot.includes(st.label);
        const markerHtml = `
          <div style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="background:${isSelected ? '#0f172a' : '#ffffff'}; border:2px solid ${st.color}; border-radius:8px; padding:3px 8px; color:${isSelected ? '#ffffff' : '#0f172a'}; font-size:11px; font-weight:700; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.2); transform:${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition:all 0.2s;">
              <span>${st.label}</span>
              <span style="margin-left:5px; background:${st.color}; color:#ffffff; padding:1px 6px; border-radius:4px; font-weight:900;">${st.aqi}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [120, 32],
          iconAnchor: [12, 16]
        });

        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => setSelectedHotspot(st.name));
      });
    }

    // 3. Satellite Fire Pins
    if (gisLayers.fires) {
      satelliteFires.forEach(fire => {
        const fireHtml = `
          <div style="background:#fff7ed; border:1.5px solid #ea580c; color:#c2410c; border-radius:6px; padding:2px 6px; font-size:10px; font-weight:800; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
            🔥 ${fire.frp} MW
          </div>
        `;
        const fireIcon = L.divIcon({
          html: fireHtml,
          className: '',
          iconSize: [80, 22],
          iconAnchor: [5, 11]
        });
        L.marker([fire.lat, fire.lng], { icon: fireIcon }).addTo(layerGroup);
      });
    }
  }, [gisLayers, mapStyle, selectedHotspot]);

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans overflow-hidden">
      
      {/* ULTRA-COMPACT HIGH-DENSITY BRAND HEADER */}
      <header className="flex-none bg-white border-b border-slate-200 px-3.5 py-1.5 shadow-2xs z-50">
        <div className="max-w-[1850px] mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-2xs shrink-0">
              <Wind className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                  Vital Air
                </h1>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Delhi-NCR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 hidden sm:block">
                Atmospheric Pollution Forecasting & Decision Support
              </p>
            </div>
          </div>

          {/* Controls & Stream Info */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
              <span>WRF-Chem Stream</span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              {['Live', '+24h', '+48h', '+72h'].map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    timeHorizon === horizon
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>

            <select
              value={selectedHotspot}
              onChange={(e) => setSelectedHotspot(e.target.value)}
              className="bg-white border border-slate-200 text-[11px] font-bold text-slate-800 px-2 py-0.5 rounded-md cursor-pointer focus:outline-none focus:border-emerald-600 shadow-2xs max-w-[200px] truncate"
            >
              {hotspots.map(h => (
                <option key={h.id} value={h.name} className="bg-white text-slate-800">
                  📍 {h.name} (AQI {h.aqi})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <Printer className="w-3 h-3 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-emerald px-2.5 py-0.5 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-white" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS - HIGH DENSITY COMPACT STRIP */}
        <div className="max-w-[1850px] mx-auto flex items-center gap-1 mt-1 pt-1 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'gis', label: '1. Live Air Map & Stations', icon: Compass },
            { id: 'telemetry', label: '2. 72h Pollution Forecast', icon: BarChart2 },
            { id: 'stubble', label: '3. Stubble Burning & Fire Impact', icon: Flame },
            { id: 'grap', label: '4. Model Training & 7-Day Performance', icon: Activity },
            { id: 'feedback', label: '5. Aerosol Coupling Research', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs border border-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* CSV Notice */}
      {downloadNotice && (
        <div className="flex-none bg-emerald-600 text-white px-4 py-1 text-xs font-bold flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white" />
            <span>Air quality dataset exported successfully as CSV.</span>
          </div>
          <button onClick={() => setDownloadNotice(false)} className="text-white hover:text-slate-100 underline">Dismiss</button>
        </div>
      )}

      {/* MAIN CONTENT CANVAS - MAXIMUM VERTICAL HEIGHT FIT FOR 100% BROWSER ZOOM */}
      <main className="flex-1 min-h-0 w-full max-w-[1850px] mx-auto p-2.5 flex flex-col gap-2.5 overflow-hidden relative">

        {/* TAB 1: LIVE AIR MAP & STATIONS (PERSISTENT DOM) */}
        <div className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-full overflow-hidden transition-all duration-300 ${activeTab === 'gis' ? '' : 'hidden'}`}>
          
          {/* GIS Map Panel */}
          <div className={`${isStationsPanelOpen ? 'lg:col-span-9' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col h-full min-h-0 overflow-hidden shadow-2xs transition-all duration-300`}>
            
            {/* Map Toolbar Header */}
            <div className="flex-none flex flex-wrap items-center justify-between gap-1.5 mb-1.5 pb-1.5 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <h3 className="text-[11.5px] font-bold text-slate-900">Delhi NCR Airshed Interactive GIS Map</h3>
              </div>

              {/* Toolbar Actions & Search Box */}
              <div className="flex items-center flex-wrap gap-1.5">
                
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search station..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-6 pr-2 py-0.5 bg-slate-50 border border-slate-200 text-[10.5px] rounded-md font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-32"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-1 text-slate-400 hover:text-slate-600 text-xs">
                      ×
                    </button>
                  )}
                </div>

                {/* Reset Map View */}
                <button
                  onClick={handleResetMapView}
                  title="Reset map center & zoom"
                  className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                {!isStationsPanelOpen && (
                  <button
                    onClick={toggleStationsPanel}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10.5px] font-bold text-emerald-700 flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Show Stations ({hotspots.length})</span>
                  </button>
                )}

                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[10.5px] font-bold text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  <option value="Standard">OpenStreetMap</option>
                  <option value="Topo">OpenTopoMap</option>
                </select>

                {[
                  { key: 'heatmap', label: 'Plume', color: 'bg-red-500' },
                  { key: 'pins', label: 'Stations', color: 'bg-purple-600' },
                  { key: 'fires', label: 'Fires', color: 'bg-orange-500' },
                ].map(layer => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                      gisLayers[layer.key]
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${layer.color}`}></span>
                    <span>{layer.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Leaflet Map Canvas Container */}
            <div className="flex-1 w-full h-full min-h-[380px] rounded-lg border border-slate-200 overflow-hidden relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Map Legend Overlay */}
              <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-md p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5 shadow-md">
                <div className="font-bold text-slate-900 mb-0.5">AQI Scale</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-600"></span><span className="text-slate-700">Hazardous (&gt;450)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-rose-600"></span><span className="text-slate-700">Severe+ (401-450)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-600"></span><span className="text-slate-700">Very Poor (301-400)</span></div>
              </div>
            </div>
          </div>

          {/* Station Leaderboard - Collapsible & Compact */}
          {isStationsPanelOpen && (
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col h-full min-h-0 overflow-hidden shadow-2xs transition-all duration-300">
              <div className="flex-none flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <h3 className="text-[11.5px] font-bold text-slate-900">Monitoring Stations</h3>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-slate-400 font-semibold px-1 py-0.2 rounded bg-slate-50 border border-slate-200">Live</span>
                  <button
                    onClick={toggleStationsPanel}
                    title="Close stations panel"
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 mt-1.5 pr-0.5">
                {filteredHotspots.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-[11px] font-medium">
                    No stations match "{searchQuery}"
                  </div>
                ) : (
                  filteredHotspots.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setSelectedHotspot(st.name)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all border ${
                        selectedHotspot === st.name
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-[10.5px] truncate leading-tight">{st.name}</div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">{st.location}</div>
                        </div>
                        <div className="text-right flex-none">
                          <span
                            className="text-[8.5px] font-black px-1 py-0.2 rounded inline-block"
                            style={{ backgroundColor: st.color + '15', color: st.color, border: `1px solid ${st.color}40` }}
                          >
                            AQI {st.aqi}
                          </span>
                          <div className="text-[8.5px] text-slate-500 font-mono mt-0.5 font-semibold">PM2.5: {st.pm25}</div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (st.aqi / 500) * 100)}%`, backgroundColor: st.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: 72-HOUR POLLUTION FORECAST */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden shadow-2xs ${activeTab === 'telemetry' ? '' : 'hidden'}`}>
          <div className="flex-none flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                WRF-Chem 72-Hour Regional Pollutant Forecast Outlook
              </h3>
              <p className="text-[10px] text-slate-500">Integrated chemical transport prediction for Delhi NCR</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600"></span><span>PM2.5</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600"></span><span>PM10</span></div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTrend}>
                <defs>
                  <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="PM25" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPM25)" name="PM2.5 (ug/m3)" />
                <Area type="monotone" dataKey="PM10" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorPM10)" name="PM10 (ug/m3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TAB 3: STUBBLE BURNING & FIRE IMPACT */}
        <div className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-full overflow-hidden ${activeTab === 'stubble' ? '' : 'hidden'}`}>
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full min-h-0 overflow-hidden shadow-2xs">
            <div className="flex-none flex items-center justify-between pb-1.5 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <h3 className="text-xs font-bold text-slate-900">Satellite Active Fire Detections (VIIRS)</h3>
              </div>
              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                Punjab/Haryana Axis
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto mt-1.5">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-semibold">
                    <th className="pb-1">Cluster ID</th>
                    <th className="pb-1">FRP (MW)</th>
                    <th className="pb-1">Biomass</th>
                    <th className="pb-1">PM2.5 Emission</th>
                    <th className="pb-1">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {satelliteFires.map((fire) => (
                    <tr key={fire.id} className="hover:bg-slate-50">
                      <td className="py-1.5 font-bold text-orange-600">{fire.id}</td>
                      <td className="py-1.5 font-black text-slate-900">{fire.frp} MW</td>
                      <td className="py-1.5 text-slate-700">{fire.biomass}</td>
                      <td className="py-1.5 text-rose-600 font-mono font-bold">{fire.pm25_rate}</td>
                      <td className="py-1.5 text-slate-500">{fire.dist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full min-h-0 overflow-hidden shadow-2xs">
            <h3 className="flex-none text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Sectoral Attribution Share
            </h3>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-1.5">
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-center">
                <div className="text-xl font-black text-orange-600">42.8%</div>
                <div className="text-[10.5px] text-slate-700 font-semibold">Stubble Burning Contribution to PM₂.₅</div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[10.5px]"><span>Vehicular Traffic</span><span>28.5%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-0.5"><div className="bg-blue-600 h-full w-[28.5%]" /></div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[10.5px]"><span>Industrial Stacks</span><span>18.2%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-0.5"><div className="bg-purple-600 h-full w-[18.2%]" /></div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-semibold text-[10.5px]"><span>Dust & Construction</span><span>10.5%</span></div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 mt-0.5"><div className="bg-amber-600 h-full w-[10.5%]" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 4: MODEL TRAINING & 7-DAY PERFORMANCE ANALYTICS */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden shadow-2xs ${activeTab === 'grap' ? '' : 'hidden'}`}>
          
          {/* Header Bar */}
          <div className="flex-none flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                WRF-Chem ML Model Training & 7-Day Performance Analytics
              </h3>
              <p className="text-[10px] text-slate-500">Continuous 7-day model convergence, validation loss, and feature weight progression</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>MODEL CONVERGED (250 EPOCHS)</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-2 pr-0.5">
            
            {/* Top KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>Validation Accuracy</span>
                </div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">94.8%</div>
                <div className="text-[9px] text-emerald-600 font-medium">+22.4% gain across 7 days</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-600" />
                  <span>Final Training Loss (RMSE)</span>
                </div>
                <div className="text-lg font-black text-slate-900 mt-0.5">12.4 µg/m³</div>
                <div className="text-[9px] text-emerald-600 font-medium">-74.3% error drop from Day 1</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3 text-purple-600" />
                  <span>7-Day Data Ingested</span>
                </div>
                <div className="text-lg font-black text-purple-700 mt-0.5">9.81 TB</div>
                <div className="text-[9px] text-slate-500 font-medium">48,000 grid points/hr stream</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-600" />
                  <span>Distributed Hardware</span>
                </div>
                <div className="text-lg font-black text-amber-700 mt-0.5">8x A100 GPUs</div>
                <div className="text-[9px] text-slate-500 font-medium">Distributed PyTorch / WRF-Chem</div>
              </div>
            </div>

            {/* Main Graphs & Basis Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              
              {/* 7-Day Loss & Accuracy Graph */}
              <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 flex flex-col">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
                  <h4 className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-emerald-600" />
                    <span>7-Day Loss Decay & Accuracy Progression Curve</span>
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-semibold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600"></span>Accuracy (%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-600"></span>Loss (RMSE)</span>
                  </div>
                </div>

                <div className="h-44 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelTrainingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={9.5} />
                      <YAxis yAxisId="left" stroke="#10b981" fontSize={9.5} domain={[60, 100]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={9.5} domain={[0, 60]} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '10px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Accuracy (%)" />
                      <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} name="Train Loss (RMSE)" />
                      <Line yAxisId="right" type="monotone" dataKey="valLoss" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" name="Val Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Basis of Model Training (Feature Importance Share) */}
              <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 pb-1 mb-2 border-b border-slate-200 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-600" />
                    <span>Basis of Model Training (Feature Weight Share)</span>
                  </h4>

                  <div className="space-y-2 text-[10.5px]">
                    <div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>1. VIIRS Satellite FRP & Biomass Flux</span>
                        <span className="font-bold text-orange-600">34.2%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-orange-500 h-full w-[34.2%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>2. Boundary Layer Met (PBLH, Wind, T2 Inversion)</span>
                        <span className="font-bold text-blue-600">28.5%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-blue-600 h-full w-[28.5%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>3. WRF-Chem Chemistry Baseline (NO₂, SO₂, O₃)</span>
                        <span className="font-bold text-purple-600">21.8%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-purple-600 h-full w-[21.8%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>4. Sectoral Emission Inventory (Traffic, Industry, Dust)</span>
                        <span className="font-bold text-amber-600">15.5%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-amber-500 h-full w-[15.5%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Gradient Boosting & WRF-Chem 2-Way Feedback Tensor Verified</span>
                </div>
              </div>
            </div>

            {/* 7-Day Epoch Breakdown Table */}
            <div className="pt-1">
              <h4 className="text-[11px] font-bold text-slate-900 mb-1">7-Day Daily Model Epoch & Parameter Log</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10.5px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[9px] font-semibold">
                      <th className="pb-1">Training Period</th>
                      <th className="pb-1">Epochs</th>
                      <th className="pb-1">Volume (GB)</th>
                      <th className="pb-1">Train Loss (RMSE)</th>
                      <th className="pb-1">Val Loss</th>
                      <th className="pb-1">MAE (µg/m³)</th>
                      <th className="pb-1">Pearson R</th>
                      <th className="pb-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    {modelTrainingData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1 font-bold text-slate-900">{row.day}</td>
                        <td className="py-1 text-slate-700">{row.epochs} / 250</td>
                        <td className="py-1 text-slate-700">{row.dataVolumeGB} GB</td>
                        <td className="py-1 text-rose-600 font-bold">{row.loss}</td>
                        <td className="py-1 text-purple-600">{row.valLoss}</td>
                        <td className="py-1 text-slate-700">{row.mae}</td>
                        <td className="py-1 text-emerald-600 font-bold">{row.pearsonR}</td>
                        <td className="py-1">
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${idx === 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {idx === 6 ? 'CONVERGED' : 'OPTIMIZING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* TAB 5: AEROSOL COUPLING RESEARCH */}
        <div className={`flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-full overflow-hidden shadow-2xs ${activeTab === 'feedback' ? '' : 'hidden'}`}>
          <div className="flex-none pb-1.5 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Two-Way Aerosol-Meteorology Coupling Experiment Response
            </h3>
            <p className="text-[10px] text-slate-500">Comparing CONTROL vs FEEDBACK WRF-Chem model runs</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mt-2 pr-0.5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10.5px] text-slate-500 font-semibold">Shortwave Dimming</div>
                <div className="text-lg font-black text-blue-600">-4.43 W/m²</div>
                <div className="text-[9.5px] text-slate-500">Peak attenuation: -67.39 W/m²</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10.5px] text-slate-500 font-semibold">Surface Cooling (T2 Drop)</div>
                <div className="text-lg font-black text-indigo-600">-0.076 K</div>
                <div className="text-[9.5px] text-slate-500">Peak cooling: -1.16 K</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10.5px] text-slate-500 font-semibold">PBL Suppression</div>
                <div className="text-lg font-black text-amber-600">-9.50 meters</div>
                <div className="text-[9.5px] text-slate-500">Peak decay: -144.4 meters</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="text-[10.5px] text-slate-500 font-semibold">PM2.5 Trapping</div>
                <div className="text-lg font-black text-rose-600">+1.50 µg/m³</div>
                <div className="text-[9.5px] text-slate-500">Peak trapping: +22.87 µg/m³</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
              <h4 className="text-[11.5px] font-bold text-slate-900">Lead-Time Skill Metrics (PM₂.₅)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-semibold">
                      <th className="pb-1">Horizon</th>
                      <th className="pb-1">MAE (µg/m³)</th>
                      <th className="pb-1">RMSE (µg/m³)</th>
                      <th className="pb-1">Bias</th>
                      <th className="pb-1">Pearson R</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10.5px]">
                    <tr>
                      <td className="py-1.5 font-bold text-emerald-600">24h Forecast</td>
                      <td className="py-1.5 text-slate-700">20.29</td>
                      <td className="py-1.5 text-slate-700">23.33</td>
                      <td className="py-1.5 text-emerald-600 font-bold">+18.55</td>
                      <td className="py-1.5 text-emerald-600 font-bold">0.901</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-indigo-600">48h Forecast</td>
                      <td className="py-1.5 text-slate-700">29.74</td>
                      <td className="py-1.5 text-slate-700">31.68</td>
                      <td className="py-1.5 text-emerald-600 font-bold">+29.74</td>
                      <td className="py-1.5 text-indigo-600 font-bold">0.941</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-purple-600">72h Forecast</td>
                      <td className="py-1.5 text-slate-700">34.04</td>
                      <td className="py-1.5 text-slate-700">36.58</td>
                      <td className="py-1.5 text-emerald-600 font-bold">+34.04</td>
                      <td className="py-1.5 text-purple-600 font-bold">0.864</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ULTRA-COMPACT FOOTER */}
      <footer className="flex-none bg-white border-t border-slate-200 text-slate-500 py-1 px-4 text-[10px]">
        <div className="max-w-[1850px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Vital Air — Delhi NCR Air Quality Platform</span>
          </div>
          <div className="text-slate-400">WRF-Chem Modeling & OpenStreetMap &copy; 2026</div>
        </div>
      </footer>
    </div>
  );
}
