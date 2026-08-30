import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  Layers,
  Compass,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom DGPS Pillar Icon
const createDgpsIcon = (label) => {
  return L.divIcon({
    className: "custom-dgps-marker",
    html: `
      <div style="
        background: #1B365D;
        color: #C5A059;
        border: 2px solid #ffffff;
        border-radius: 4px;
        padding: 2px 5px;
        font-weight: bold;
        font-size: 9px;
        font-family: monospace;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        📍 ${label}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const LeafletGisMap = ({
  parcels = [],
  selectedParcelIds = [],
  onSelectParcel,
  activeParcel,
  onSetActiveParcel,
  showControls = true,
  height = "520px",
  interactiveSelection = true,
  filterVillage = "All"
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerGroupRef = useRef(null);
  const corridorLayerRef = useRef(null);
  const [activeLayerType, setActiveLayerType] = useState("hybrid"); // 'streets' | 'satellite' | 'hybrid' | 'cadastral'
  const [showCorridorBuffer, setShowCorridorBuffer] = useState(true);
  const [showSurveyPillars, setShowSurveyPillars] = useState(true);

  // Keep callback refs stable to avoid re-triggering effects
  const onSetActiveParcelRef = useRef(onSetActiveParcel);
  onSetActiveParcelRef.current = onSetActiveParcel;
  const onSelectParcelRef = useRef(onSelectParcel);
  onSelectParcelRef.current = onSelectParcel;

  // Memoize filtered parcels
  const displayedParcels = useMemo(() => {
    return parcels.filter(
      (p) => filterVillage === "All" || p.village === filterVillage
    );
  }, [parcels, filterVillage]);

  // Selected Parcel IDs string key for stable comparison
  const selectedIdsKey = useMemo(() => {
    return (selectedParcelIds || []).join(",");
  }, [selectedParcelIds]);

  const activeParcelId = activeParcel?.id || "";

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around Anand / Petlad WDFC rail corridor
    const map = L.map(mapContainerRef.current, {
      center: [22.572, 72.938],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Layer Groups
    geojsonLayerGroupRef.current = L.layerGroup().addTo(map);
    corridorLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (activeLayerType === "satellite") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Esri Satellite" }
      ).addTo(map);
    } else if (activeLayerType === "hybrid") {
      // Esri Satellite + Boundaries Overlay
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(map);
      L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(map);
    } else if (activeLayerType === "cadastral") {
      // High contrast Carto Positron for cadastral survey lines
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);
    } else {
      // Standard Streets (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
      }).addTo(map);
    }
  }, [activeLayerType]);

  // Render Infrastructure Corridor Alignment Line & Buffer Zone
  useEffect(() => {
    const corridorGroup = corridorLayerRef.current;
    if (!corridorGroup) return;
    corridorGroup.clearLayers();

    if (!showCorridorBuffer) return;

    // Western Dedicated Freight Corridor alignment points
    const alignmentCoords = [
      [22.558, 72.923],
      [22.563, 72.929],
      [22.568, 72.934],
      [22.573, 72.939],
      [22.578, 72.945],
      [22.584, 72.951],
      [22.589, 72.956]
    ];

    // Centerline (Rail alignment)
    const centerline = L.polyline(alignmentCoords, {
      color: "#C5A059",
      weight: 4,
      dashArray: "8, 6",
      opacity: 0.95
    });

    // 45m ROW (Right of Way) Buffer Corridor
    const bufferCorridor = L.polyline(alignmentCoords, {
      color: "#1B365D",
      weight: 28,
      opacity: 0.25,
      lineCap: "round"
    });

    corridorGroup.addLayer(bufferCorridor);
    corridorGroup.addLayer(centerline);

    // Corridor start and end pins
    const startPin = L.marker([22.558, 72.923], {
      icon: createDgpsIcon("KM 102.00 (Ch 0+000)")
    });
    const endPin = L.marker([22.589, 72.956], {
      icon: createDgpsIcon("KM 106.50 (Anand Jn)")
    });

    corridorGroup.addLayer(startPin);
    corridorGroup.addLayer(endPin);
  }, [showCorridorBuffer]);

  // Render Land Parcels with GeoJSON Boundaries & Interactive Styling
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = geojsonLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const bounds = L.latLngBounds([]);

    displayedParcels.forEach((parcel) => {
      const isSelected = selectedIdsKey.split(",").includes(parcel.id);
      const isActive = activeParcelId === parcel.id;
      const isHighRisk = parcel.aiRiskLevel === "High";

      // Color coding based on status & risk
      let fillColor = "#3b82f6"; // Blue
      let strokeColor = "#1B365D"; // Navy

      if (isHighRisk) {
        fillColor = "#ef4444";
        strokeColor = "#b91c1c";
      } else if (parcel.status.includes("Award") || parcel.status.includes("Possession")) {
        fillColor = "#10b981"; // Emerald
        strokeColor = "#047857";
      } else if (parcel.status.includes("Objection") || parcel.status.includes("Hearing")) {
        fillColor = "#f59e0b"; // Amber
        strokeColor = "#b45309";
      }

      if (isSelected) {
        strokeColor = "#C5A059"; // Gold highlight
      }

      // Generate polygon points from coordinates or mock box
      const coords = parcel.coordinates || [
        [22.565, 72.930],
        [22.569, 72.934],
        [22.566, 72.938],
        [22.562, 72.933]
      ];

      const polygon = L.polygon(coords, {
        color: isActive ? "#ffffff" : strokeColor,
        weight: isActive ? 4 : isSelected ? 3 : 2,
        fillColor: fillColor,
        fillOpacity: isActive ? 0.65 : isSelected ? 0.5 : 0.3,
        dashArray: isHighRisk ? "5, 5" : undefined,
      });

      // Expand bounding box
      coords.forEach((c) => bounds.extend(c));

      // Tooltip on Hover
      polygon.bindTooltip(
        `
        <div style="font-family: sans-serif; padding: 2px;">
          <div style="font-weight: bold; color: #1B365D; font-size: 11px;">
            Survey No: ${parcel.surveyNumber} (${parcel.village})
          </div>
          <div style="font-size: 10px; color: #475569;">
            Owner: <b>${parcel.ownerName}</b>
          </div>
          <div style="font-size: 10px; color: #047857; font-weight: bold;">
            Area: ${parcel.areaAcres} Acres • ₹ ${(parcel.finalCompensationAmount / 10000000).toFixed(2)} Cr
          </div>
          <div style="font-size: 9px; color: ${isHighRisk ? '#b91c1c' : '#1e3a8a'}; margin-top: 2px;">
            Status: ${parcel.status}
          </div>
        </div>
        `,
        { sticky: true, className: "leaflet-cadastral-tooltip" }
      );

      // Click Event
      polygon.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSetActiveParcelRef.current) {
          onSetActiveParcelRef.current(parcel);
        }
        if (interactiveSelection && onSelectParcelRef.current) {
          onSelectParcelRef.current(parcel.id);
        }
      });

      // Hover feedback
      polygon.on("mouseover", () => {
        polygon.setStyle({
          weight: 4,
          fillOpacity: 0.7,
          color: "#C5A059"
        });
      });

      polygon.on("mouseout", () => {
        polygon.setStyle({
          weight: isActive ? 4 : isSelected ? 3 : 2,
          fillOpacity: isActive ? 0.65 : isSelected ? 0.5 : 0.3,
          color: isActive ? "#ffffff" : strokeColor
        });
      });

      group.addLayer(polygon);

      // Centered Label Marker
      const validCoords = Array.isArray(coords) && coords.length > 0 ? coords : [[22.564, 72.928]];
      const centerLat = validCoords.reduce((acc, curr) => acc + (Number(curr[0]) || 0), 0) / validCoords.length;
      const centerLng = validCoords.reduce((acc, curr) => acc + (Number(curr[1]) || 0), 0) / validCoords.length;

      const labelIcon = L.divIcon({
        className: "parcel-center-label",
        html: `
          <div style="
            background: rgba(27, 54, 93, 0.85);
            color: #ffffff;
            border: 1px solid #C5A059;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 700;
            font-family: monospace;
            text-align: center;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            pointer-events: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ">
            ${parcel.surveyNumber}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const labelMarker = L.marker([centerLat, centerLng], { icon: labelIcon });
      group.addLayer(labelMarker);

      // DGPS Boundary Corner Pillars
      if (showSurveyPillars) {
        coords.forEach((pt, idx) => {
          const cornerMarker = L.circleMarker(pt, {
            radius: 3.5,
            fillColor: "#C5A059",
            color: "#1B365D",
            weight: 1.5,
            fillOpacity: 1
          });
          cornerMarker.bindTooltip(`DGPS Pillar ${parcel.surveyNumber}-P${idx + 1}<br/>${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}`, {
            direction: "top",
            offset: [0, -4]
          });
          group.addLayer(cornerMarker);
        });
      }
    });
  }, [displayedParcels, selectedIdsKey, activeParcelId, showSurveyPillars, interactiveSelection]);

  // Fit bounds when displayedParcels change or on mount
  const parcelIdsList = useMemo(() => displayedParcels.map((p) => p.id).join(","), [displayedParcels]);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || displayedParcels.length === 0) return;

    const bounds = L.latLngBounds([]);
    displayedParcels.forEach((parcel) => {
      const coords = parcel.coordinates || [];
      coords.forEach((c) => bounds.extend(c));
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    }
  }, [parcelIdsList]);

  // Zoom to Active Parcel when changed externally (if specified)
  useEffect(() => {
    if (!activeParcel || !mapInstanceRef.current) return;
    if (activeParcel.coordinates && activeParcel.coordinates.length > 0) {
      const bounds = L.latLngBounds(activeParcel.coordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeParcelId]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.572, 72.938], 14);
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-[#D1D5DB] shadow-sm bg-slate-900" style={{ height }}>
      {/* Actual Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Header Controls Overlay */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left Info Chip */}
          <div className="bg-[#1B365D]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-md border border-[#C5A059]/60 shadow-md flex items-center gap-2 pointer-events-auto text-xs">
            <Compass className="w-4 h-4 text-[#C5A059] animate-spin-slow" />
            <div>
              <span className="font-bold text-[#C5A059]">DGPS Cadastral GIS Engine</span>
              <span className="text-[10px] text-slate-300 ml-2 hidden sm:inline font-mono">
                EPSG:4326 • Anand Alignment Corridor
              </span>
            </div>
          </div>

          {/* Right Layer Selectors & Tools */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-sm p-1 rounded-md border border-slate-700 shadow-md">
            <button
              type="button"
              onClick={() => setActiveLayerType("hybrid")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                activeLayerType === "hybrid"
                  ? "bg-[#C5A059] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Satellite with boundary overlay"
            >
              Hybrid
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType("cadastral")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                activeLayerType === "cadastral"
                  ? "bg-[#C5A059] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Cadastral survey base"
            >
              Cadastral
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType("streets")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                activeLayerType === "streets"
                  ? "bg-[#C5A059] text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Street road map"
            >
              Streets
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom & Tool Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded shadow-md border border-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-[#1B365D]" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded shadow-md border border-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-[#1B365D]" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-8 h-8 bg-white hover:bg-slate-100 text-slate-800 rounded shadow-md border border-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          title="Reset Extents"
        >
          <RotateCcw className="w-4 h-4 text-[#1B365D]" />
        </button>
      </div>

      {/* Bottom Left Legend & Toggle Strip */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-sm text-white p-2.5 rounded-md border border-slate-700 shadow-lg text-[11px] space-y-1.5 pointer-events-auto max-w-sm">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 font-semibold text-[#C5A059] text-[10px] uppercase tracking-wider">
          <span>Cadastral Boundary Legend</span>
          <span className="text-slate-400 font-mono text-[9px]">{displayedParcels.length} Parcels</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-blue-500/60 border border-[#1B365D] rounded-2xs inline-block"></span>
            <span>Sec 11 Notified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-emerald-500/60 border border-emerald-700 rounded-2xs inline-block"></span>
            <span>Award / Disbursed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-amber-500/60 border border-amber-700 rounded-2xs inline-block"></span>
            <span>Objection Hearing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-rose-500/60 border border-rose-700 rounded-2xs inline-block"></span>
            <span>Title Dispute Risk</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-700/80 text-[10px] text-slate-300">
          <label className="flex items-center gap-1 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showCorridorBuffer}
              onChange={(e) => setShowCorridorBuffer(e.target.checked)}
              className="rounded text-[#C5A059] focus:ring-0 w-3 h-3"
            />
            <span>Rail Corridor Alignment</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showSurveyPillars}
              onChange={(e) => setShowSurveyPillars(e.target.checked)}
              className="rounded text-[#C5A059] focus:ring-0 w-3 h-3"
            />
            <span>DGPS Pillars</span>
          </label>
        </div>
      </div>
    </div>
  );
};
