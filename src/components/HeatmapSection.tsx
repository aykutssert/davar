"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

// Fix Leaflet default icon
const DefaultIcon = new Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Türkiye sınırları
const TURKEY_BOUNDS: [[number, number], [number, number]] = [
  [35.8, 25.6], // Southwest: En batı/en güney
  [42.1, 44.8], // Northeast: En doğru/en kuzey
];

interface CityStats {
  city: string;
  count: number;
  lat: number;
  lng: number;
}

interface DistrictStats {
  city: string;
  district: string;
  count: number;
}

function getHeatmapColor(count: number, max: number): string {
  const ratio = Math.min(count / max, 1);
  if (ratio < 0.2) return "#3b82f6"; // blue-500
  if (ratio < 0.4) return "#06b6d4"; // cyan-500
  if (ratio < 0.6) return "#10b981"; // emerald-500
  if (ratio < 0.8) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function getRadius(count: number, max: number): number {
  const baseRadius = 8;
  const ratio = Math.min(count / max, 1);
  return baseRadius + ratio * 20;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function HeatmapSection() {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/geo")
      .then((res) => res.json())
      .then((data) => {
        setCityStats(data.cities || []);
        setDistrictStats(data.districts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = useMemo(
    () => Math.max(...cityStats.map((c) => c.count), 1),
    [cityStats]
  );

  const selectedCityData = useMemo(
    () => cityStats.find((c) => c.city === selectedCity),
    [cityStats, selectedCity]
  );

  const filteredDistricts = useMemo(
    () => districtStats.filter((d) => d.city === selectedCity),
    [districtStats, selectedCity]
  );

  const mapCenter: [number, number] = selectedCityData
    ? [selectedCityData.lat, selectedCityData.lng]
    : [39.0, 35.0]; // Turkey center

  const mapZoom = selectedCity ? 10 : 6;

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600" />
              <p className="text-sm text-zinc-500">Harita yükleniyor...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                İhlal Yoğunluk Haritası
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Şehir bazlı ihlal dağılımı — nerede daha fazla ihmal var?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="">Tüm Türkiye</option>
                {cityStats
                  .sort((a, b) => b.count - a.count)
                  .map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city} ({city.count})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[400px] w-full sm:h-[500px]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            minZoom={5}
            maxZoom={12}
            maxBounds={TURKEY_BOUNDS}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />
            {cityStats.map((city) => {
              const isSelected = city.city === selectedCity;
              const radius = getRadius(city.count, maxCount);
              const color = getHeatmapColor(city.count, maxCount);

              return (
                <CircleMarker
                  key={city.city}
                  center={[city.lat, city.lng]}
                  radius={isSelected ? radius * 1.2 : radius}
                  fillColor={color}
                  fillOpacity={isSelected ? 0.9 : 0.7}
                  stroke={true}
                  color={isSelected ? "#dc2626" : "#fff"}
                  weight={isSelected ? 3 : 2}
                  eventHandlers={{
                    click: () => setSelectedCity(city.city),
                  }}
                >
                  <Popup className="dark-popup">
                    <div className="p-1">
                      <p className="font-semibold text-zinc-900">{city.city}</p>
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-red-600">{city.count}</span> ihlal
                      </p>
                      <button
                        onClick={() => setSelectedCity(city.city)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Detayları gör →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* District markers - shown when city selected */}
            {selectedCity && filteredDistricts.map((district, index) => {
              const cityData = cityStats.find(c => c.city === selectedCity);
              if (!cityData) return null;
              
              // Distribute districts in a circle around city center
              const angle = (index / filteredDistricts.length) * 2 * Math.PI;
              const offset = 0.05; // ~5km offset
              const dLat = cityData.lat + Math.sin(angle) * offset;
              const dLng = cityData.lng + Math.cos(angle) * offset;
              
              return (
                <CircleMarker
                  key={`${district.city}-${district.district}`}
                  center={[dLat, dLng]}
                  radius={6 + district.count * 2}
                  fillColor="#dc2626"
                  fillOpacity={0.6}
                  stroke={true}
                  color="#fff"
                  weight={1}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-zinc-900">{district.district}</p>
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-red-600">{district.count}</span> ihlal
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[400] rounded-lg border border-zinc-200 bg-white/95 p-3 text-xs shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
            <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Yoğunluk</p>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-zinc-500">Az</span>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500" />
              <span className="text-zinc-500">Çok</span>
              <span className="h-3 w-3 rounded-full bg-red-500" />
            </div>
          </div>
        </div>

        {/* District stats (if city selected) */}
        {selectedCity && filteredDistricts.length > 0 && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {selectedCity} — İlçe Dağılımı
              </h3>
              <button
                onClick={() => setSelectedCity("")}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                Tüm Türkiye&apos;ye dön ←
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDistricts
                .sort((a, b) => b.count - a.count)
                .map((district) => (
                  <div
                    key={district.district}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {district.district}
                    </span>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {district.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
