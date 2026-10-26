'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Filter,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  ExternalLink,
  Info,
} from 'lucide-react'
import { DEMO_ASSETS } from '@/lib/api/mock-data'
import { InfrastructureAsset } from '@/types'

interface InfrastructureMapViewProps {
  onNavigate: (tab: any, params?: any) => void
}

export function InfrastructureMapView({ onNavigate }: InfrastructureMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL')
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(DEMO_ASSETS[0])

  const filteredAssets = DEMO_ASSETS.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.address.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedType === 'ALL' || asset.type === selectedType
    const matchesSeverity =
      selectedSeverity === 'ALL' ||
      (selectedSeverity === 'Critical' && asset.conditionStatus === 'Poor') ||
      (selectedSeverity === 'Moderate' && asset.conditionStatus === 'Fair') ||
      (selectedSeverity === 'Good' && asset.conditionStatus === 'Good')
    return matchesSearch && matchesType && matchesSeverity
  })

  // Initialize Leaflet map safely on client side
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return

      // Load leaflet css dynamically if not already injected
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const L = await import('leaflet')

      if (!isMounted || !mapContainerRef.current) return

      // Cleanup existing instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create Map centered on New York / Demo area
      const map = L.map(mapContainerRef.current, {
        center: [40.7282, -74.006],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      // Render custom markers
      updateMarkers(L, map)
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when filters change
  const updateMarkers = async (LInstance?: any, mapInstance?: any) => {
    const L = LInstance || (await import('leaflet'))
    const map = mapInstance || mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    filteredAssets.forEach((asset) => {
      const color =
        asset.conditionStatus === 'Poor'
          ? '#ef4444'
          : asset.conditionStatus === 'Fair'
          ? '#f59e0b'
          : '#10b981'

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          background: ${color};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: bold;
          font-size: 10px;
        ">${asset.openFindingsCount}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; font-size: 12px; min-width: 200px;">
          <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold;">${asset.type}</div>
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">${asset.name}</div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">${asset.address}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span>Condition: <b>${asset.conditionStatus}</b></span>
            <span>Open Defects: <b>${asset.openFindingsCount}</b></span>
          </div>
        </div>
      `)

      marker.on('click', () => {
        setSelectedAsset(asset)
      })

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    updateMarkers()
  }, [filteredAssets])

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">GEOSPATIAL ASSET INTELLIGENCE</p>
          <h1>Infrastructure Map</h1>
          <p>
            Geographic distribution of bridges, tunnels, dams, and highway structures with severity-coded damage overlays.
          </p>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="context-bar flex-wrap">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search address or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="ALL">All Structure Types</option>
          <option value="Bridge">Bridges</option>
          <option value="Tunnel">Tunnels</option>
          <option value="Building">Buildings</option>
          <option value="Dam">Dams</option>
          <option value="Retaining Wall">Retaining Walls</option>
        </select>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
        >
          <option value="ALL">All Condition Grades</option>
          <option value="Critical">Critical Defects (Red)</option>
          <option value="Moderate">Moderate Monitoring (Amber)</option>
          <option value="Good">Good Condition (Green)</option>
        </select>

        <span className="sample-note ml-auto">
          <Info className="w-3.5 h-3.5" /> Sample demonstration coordinates
        </span>
      </div>

      {/* Map + Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 relative h-[560px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-3 text-xs shadow-md z-[1000] space-y-1.5">
            <span className="font-bold text-slate-800 text-[10px] uppercase block mb-1">
              Condition Legend
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-none" />
              <span>Poor / Critical (Requires Review)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex-none" />
              <span>Fair / Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-none" />
              <span>Good Condition</span>
            </div>
          </div>
        </div>

        {/* Selected Asset Information Card */}
        <div className="space-y-4">
          {selectedAsset ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <span className="badge badge-blue mb-1">{selectedAsset.type}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedAsset.name}</h3>
                  <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAsset.address}
                  </p>
                </div>
                <span
                  className={`badge ${
                    selectedAsset.conditionStatus === 'Poor'
                      ? 'badge-red'
                      : selectedAsset.conditionStatus === 'Fair'
                      ? 'badge-amber'
                      : 'badge-teal'
                  }`}
                >
                  {selectedAsset.conditionStatus}
                </span>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono font-semibold">
                    {selectedAsset.latitude.toFixed(4)}, {selectedAsset.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Material System:</span>
                  <b>{selectedAsset.materialType}</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Open Damage Findings:</span>
                  <b className="text-red-600 font-bold">{selectedAsset.openFindingsCount}</b>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Last Inspection:</span>
                  <b>{selectedAsset.lastInspectionDate}</b>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 leading-relaxed text-[11px]">
                {selectedAsset.notes}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  className="button primary w-full justify-center text-xs"
                  onClick={() =>
                    onNavigate('Analysis Results', { assetId: selectedAsset.id })
                  }
                >
                  Inspect Structural Model →
                </button>
                <button
                  className="button secondary w-full justify-center text-xs"
                  onClick={() => onNavigate('Assets')}
                >
                  View Full Asset Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              Click any pin on the map to inspect structural asset details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
