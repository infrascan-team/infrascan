'use client'

import React, { useState } from 'react'
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  Clock,
  Compass,
  Download,
  Eye,
  Info,
  Maximize2,
  Sliders,
  TrendingUp,
} from 'lucide-react'
import { DEMO_ASSETS, DEMO_INSPECTIONS } from '@/lib/api/mock-data'

export function ComparisonView() {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('AST-BRG-0048')
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider')

  const selectedAsset = DEMO_ASSETS.find((a) => a.id === selectedAssetId) || DEMO_ASSETS[0]

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">STRUCTURAL HEALTH MONITORING · TEMPORAL PROGRESSION</p>
          <h1>Historical Comparison & Progression</h1>
          <p>
            Assess crack dilation, concrete cover spalling progression, and environmental degradation over time.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Exporting temporal damage delta report...')}
          >
            <Download /> Export Progression Report
          </button>
        </div>
      </section>

      {/* Asset and Cycle Selectors */}
      <div className="context-bar flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Asset:</span>
          <select
            className="form-select text-xs py-1.5 px-3 bg-white"
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
          >
            {DEMO_ASSETS.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Baseline Survey:</span>
          <select className="form-select text-xs py-1.5 px-3 bg-white">
            <option>INSP-2023-0112 · Oct 14, 2023 (Baseline)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Current Survey:</span>
          <select className="form-select text-xs py-1.5 px-3 bg-white">
            <option>INSP-2024-0248 · Sep 24, 2024 (Latest)</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <button
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'slider' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'
            }`}
            onClick={() => setViewMode('slider')}
          >
            Split Slider
          </button>
          <button
            className={`px-3 py-1 text-xs rounded ${
              viewMode === 'side-by-side' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'
            }`}
            onClick={() => setViewMode('side-by-side')}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Perspective / Calibration Alert (§ 10) */}
      <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
        <div>
          <strong>Computer Vision Alignment Note:</strong> Due to potential variance in field drone
          angles and ambient lighting between survey cycles, qualitative visual tracking is paired
          with normalized bounding polygon coordinate mapping.
        </div>
      </div>

      {/* Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* Left 2 Cols: Split / Side-by-Side Viewer */}
        <div className="lg:col-span-2">
          {viewMode === 'slider' ? (
            <div className="comparison-container relative">
              {/* Baseline Image (Underneath) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1200&q=80"
                alt="Baseline inspection"
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-90"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded">
                Baseline: Oct 14, 2023
              </span>

              {/* Latest Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80"
                  alt="Current inspection"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded">
                  Current: Sep 24, 2024
                </span>
              </div>

              {/* Slider Handle */}
              <div
                className="comparison-slider"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="comparison-handle">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>

              {/* Range input for smooth touch/click dragging */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
            </div>
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-2 gap-3 h-[460px]">
              <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=800&q=80"
                  alt="Baseline"
                  className="w-full h-full object-cover grayscale brightness-90"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                  Baseline (Oct 2023)
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80"
                  alt="Latest"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                  Current (Sep 2024)
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
            <span>Drag slider horizontally or use slider bar to compare crack dilation</span>
            <span className="font-mono">Delta timeline: +345 Days</span>
          </div>
        </div>

        {/* Right Col: Quantitative Delta Progression */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-slate-900">Damage Progression Metrics</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Principal Shear Crack Length</span>
                  <span className="badge badge-red">+32.4% Growth</span>
                </div>
                <div className="flex justify-between text-slate-800 font-mono">
                  <span>Baseline: 311 px</span>
                  <span>→</span>
                  <span className="font-bold text-red-600">Current: 412 px</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Max Crack Aperture Width</span>
                  <span className="badge badge-amber">+18.0% Dilation</span>
                </div>
                <div className="flex justify-between text-slate-800 font-mono">
                  <span>Baseline: 12.0 px</span>
                  <span>→</span>
                  <span className="font-bold text-amber-600">Current: 14.2 px</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">New Secondary Micro-Fissures</span>
                  <span className="badge badge-red">+2 Discovered</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Transverse hairline cracking branching from primary diagonal rupture plane.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                STRUCTURAL INTEGRITY TRAJECTORY
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Condition score declined from <strong>78/100 (Fair)</strong> to{' '}
                <strong>68/100 (Monitoring Alert)</strong>. Acoustic resonance sensor installation
                recommended to evaluate dynamic cyclic loading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
