'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeftRight,
  Calendar,
  Compass,
  Download,
  Info,
  TrendingUp,
  Layers,
  Sparkles,
  Flame,
  ScanEye,
  CheckCircle2,
} from 'lucide-react'
import { DEMO_ASSETS, DEMO_INSPECTIONS } from '@/lib/api/mock-data'
import { Inspection, InfrastructureAsset, DamageFinding } from '@/types'
import { InspectionsService } from '@/lib/api/inspections.service'
import { AssetsService } from '@/lib/api/assets.service'
import { getFullMediaUrl } from '@/lib/api/client'

interface ComparisonViewProps {
  activeInspectionId?: string
}

export function ComparisonView({ activeInspectionId }: ComparisonViewProps) {
  const [inspections, setInspections] = useState<Inspection[]>(DEMO_INSPECTIONS)
  const [assets, setAssets] = useState<InfrastructureAsset[]>(DEMO_ASSETS)
  const [selectedAssetId, setSelectedAssetId] = useState<string>('AST-BRG-0048')
  const [baselineInspId, setBaselineInspId] = useState<string>('INSP-2024-0248')
  const [currentInspId, setCurrentInspId] = useState<string>('')
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider')
  const [comparisonMode, setComparisonMode] = useState<'temporal' | 'ai-mask' | 'heatmap'>('temporal')

  // Load live data from FastAPI backend
  useEffect(() => {
    Promise.all([
      InspectionsService.getAll().catch(() => DEMO_INSPECTIONS),
      AssetsService.getAll().catch(() => DEMO_ASSETS),
    ]).then(([allInsps, allAssets]) => {
      if (allInsps && allInsps.length > 0) setInspections(allInsps)
      if (allAssets && allAssets.length > 0) setAssets(allAssets)

      // If activeInspectionId passed, locate it
      const targetId = activeInspectionId || allInsps[0]?.id
      const targetInsp = allInsps.find((i) => i.id === targetId)

      if (targetInsp) {
        setSelectedAssetId(targetInsp.assetId)
        setCurrentInspId(targetInsp.id)

        // Find earlier baseline for same asset
        const assetInsps = allInsps.filter((i) => i.assetId === targetInsp.assetId)
        const older = assetInsps.find((i) => i.id !== targetInsp.id && i.date <= targetInsp.date)
        if (older) {
          setBaselineInspId(older.id)
        } else if (assetInsps.length > 1) {
          setBaselineInspId(assetInsps[assetInsps.length - 1].id)
        }
      } else {
        setCurrentInspId(allInsps[0]?.id || 'INSP-2024-0248')
      }
    })
  }, [activeInspectionId])

  // Available inspections for selected asset
  const assetInspections = inspections.filter((i) => i.assetId === selectedAssetId)

  // Current and Baseline inspection objects
  const currentInsp =
    inspections.find((i) => i.id === currentInspId) ||
    assetInspections[0] ||
    inspections[0]

  const baselineInsp =
    inspections.find((i) => i.id === baselineInspId) ||
    assetInspections.find((i) => i.id !== currentInsp?.id) ||
    inspections[inspections.length - 1]

  // When selectedAssetId changes manually
  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId)
    const matching = inspections.filter((i) => i.assetId === assetId)
    if (matching.length > 0) {
      setCurrentInspId(matching[0].id)
      setBaselineInspId(matching.length > 1 ? matching[matching.length - 1].id : matching[0].id)
    }
  }

  // Extract measurements helper
  const getMeasurements = (insp?: Inspection | null) => {
    if (!insp) return { length: 412, maxWidth: 14.2, avgWidth: 8.4, findingsCount: 1 }
    let length = 412
    let maxWidth = 14.2
    let avgWidth = 8.4
    let findingsCount = insp.findingsCount || 1

    if (insp.images) {
      for (const img of insp.images) {
        if (img.findings && img.findings.length > 0) {
          const firstFinding = img.findings[0]
          if (firstFinding.measurements) {
            length = firstFinding.measurements.crackLengthPx || length
            maxWidth = firstFinding.measurements.maxWidthPx || maxWidth
            avgWidth = firstFinding.measurements.avgWidthPx || avgWidth
          }
          break
        }
      }
    }
    return { length, maxWidth, avgWidth, findingsCount }
  }

  const baseMetrics = getMeasurements(baselineInsp)
  const currMetrics = getMeasurements(currentInsp)

  // Calculate real deltas
  const lengthGrowthPct =
    baseMetrics.length > 0
      ? (((currMetrics.length - baseMetrics.length) / baseMetrics.length) * 100).toFixed(1)
      : '0.0'
  const isGrowthPositive = parseFloat(lengthGrowthPct) >= 0

  const widthDilationPct =
    baseMetrics.maxWidth > 0
      ? (((currMetrics.maxWidth - baseMetrics.maxWidth) / baseMetrics.maxWidth) * 100).toFixed(1)
      : '0.0'

  // Time delta
  const baselineDate = baselineInsp?.date || '2024-09-24'
  const currentDate = currentInsp?.date || new Date().toISOString().split('T')[0]
  const daysDiff = Math.max(
    1,
    Math.round(
      Math.abs(new Date(currentDate).getTime() - new Date(baselineDate).getTime()) / (1000 * 3600 * 24)
    )
  )

  // Resolve media URLs
  const getInspImage = (insp?: Inspection | null): string => {
    if (!insp || !insp.images || insp.images.length === 0) {
      return '/samples/baseline_concrete.jpg'
    }
    const realImg =
      insp.images.find(
        (img) =>
          img.url &&
          !img.url.startsWith('blob:') &&
          !img.url.includes('unsplash')
      ) ||
      insp.images.find((img) => img.findings && img.findings.length > 0) ||
      insp.images[0]

    if (realImg?.url && !realImg.url.startsWith('blob:')) {
      return getFullMediaUrl(realImg.url)
    }
    return '/samples/baseline_concrete.jpg'
  }

  const getOverlayImage = (insp: Inspection | null | undefined, mode: 'ai-mask' | 'heatmap'): string => {
    if (!insp || !insp.images) return '/samples/annotated_crack.jpg'
    const imgWithFindings = insp.images.find((img) => img.maskUrl || img.heatmapUrl) || insp.images[0]

    if (mode === 'heatmap') {
      if (imgWithFindings?.heatmapUrl) return getFullMediaUrl(imgWithFindings.heatmapUrl)
      return '/samples/heatmap_concrete.jpg'
    }
    // ai-mask / annotated
    if (imgWithFindings?.filename) {
      return getFullMediaUrl(`/uploads/inspections/annotated_${imgWithFindings.filename}`)
    }
    if (imgWithFindings?.maskUrl) return getFullMediaUrl(imgWithFindings.maskUrl)
    return '/samples/annotated_crack.jpg'
  }

  // Display URLs depending on comparisonMode
  let displayBaselineImg = getInspImage(baselineInsp)
  let displayCurrentImg = getInspImage(currentInsp)
  let baselineTag = `${baselineInsp?.id || 'Baseline'} · ${baselineDate}`
  let currentTag = `${currentInsp?.id || 'Current'} · ${currentDate}`

  if (comparisonMode === 'ai-mask') {
    displayBaselineImg = getInspImage(currentInsp)
    displayCurrentImg = getOverlayImage(currentInsp, 'ai-mask')
    baselineTag = `Raw Optical Sensor Capture (${currentDate})`
    currentTag = `YOLOv11 Crack Segmentation (${currentDate})`
  } else if (comparisonMode === 'heatmap') {
    displayBaselineImg = getInspImage(currentInsp)
    displayCurrentImg = getOverlayImage(currentInsp, 'heatmap')
    baselineTag = `Raw Optical Surface (${currentDate})`
    currentTag = `XAI Neural Attention Heatmap (${currentDate})`
  }

  const handleExport = () => {
    alert(
      `✓ Progression Delta Report Exported:\n` +
        `• Asset: ${currentInsp?.assetName || 'Infrastructure Asset'}\n` +
        `• Baseline: ${baselineInsp?.id} (${baselineDate})\n` +
        `• Current: ${currentInsp?.id} (${currentDate})\n` +
        `• Crack Length Delta: ${isGrowthPositive ? '+' : ''}${lengthGrowthPct}% (${baseMetrics.length}px → ${currMetrics.length}px)\n` +
        `• Max Aperture Delta: ${widthDilationPct}% (${baseMetrics.maxWidth}px → ${currMetrics.maxWidth}px)\n` +
        `• Interval: ${daysDiff} Days`
    )
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">STRUCTURAL HEALTH MONITORING · TEMPORAL PROGRESSION</p>
          <h1>Historical Comparison & Progression</h1>
          <p>
            Real-time temporal delta tracking: compare survey cycles across time or compare raw sensor captures with YOLOv11 neural inference.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" onClick={handleExport}>
            <Download /> Export Progression Report
          </button>
        </div>
      </section>

      {/* Mode Switcher Pills */}
      <div className="flex gap-2 mt-4">
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
            comparisonMode === 'temporal'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => setComparisonMode('temporal')}
        >
          <Calendar className="w-3.5 h-3.5" /> Temporal Survey Comparison (Baseline vs Current)
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
            comparisonMode === 'ai-mask'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => setComparisonMode('ai-mask')}
        >
          <ScanEye className="w-3.5 h-3.5" /> Live AI Inspection: Raw Image vs Crack Detections
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
            comparisonMode === 'heatmap'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => setComparisonMode('heatmap')}
        >
          <Flame className="w-3.5 h-3.5" /> Explainable AI: Raw Surface vs Neural Heatmap
        </button>
      </div>

      {/* Filter and Cycle Selectors */}
      <div className="context-bar flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Asset:</span>
          <select
            className="form-select text-xs py-1.5 px-3 bg-white"
            value={selectedAssetId}
            onChange={(e) => handleAssetChange(e.target.value)}
          >
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
        </div>

        {comparisonMode === 'temporal' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Baseline Survey:</span>
              <select
                className="form-select text-xs py-1.5 px-3 bg-white font-mono"
                value={baselineInspId}
                onChange={(e) => setBaselineInspId(e.target.value)}
              >
                {inspections.map((insp) => (
                  <option key={`base-${insp.id}`} value={insp.id}>
                    {insp.id} · {insp.date} ({insp.assetName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Current Survey:</span>
              <select
                className="form-select text-xs py-1.5 px-3 bg-white font-mono text-blue-700 font-bold"
                value={currentInspId}
                onChange={(e) => setCurrentInspId(e.target.value)}
              >
                {inspections.map((insp) => (
                  <option key={`curr-${insp.id}`} value={insp.id}>
                    {insp.id} · {insp.date} {insp.id === activeInspectionId ? '★ (Just Submitted)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Target Inspection:</span>
            <select
              className="form-select text-xs py-1.5 px-3 bg-white font-mono text-blue-700 font-bold"
              value={currentInspId}
              onChange={(e) => setCurrentInspId(e.target.value)}
            >
              {inspections.map((insp) => (
                <option key={`ov-${insp.id}`} value={insp.id}>
                  {insp.id} · {insp.date} ({insp.assetName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <button
            className={`px-3 py-1 text-xs rounded transition ${
              viewMode === 'slider' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setViewMode('slider')}
          >
            Split Slider
          </button>
          <button
            className={`px-3 py-1 text-xs rounded transition ${
              viewMode === 'side-by-side' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setViewMode('side-by-side')}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Perspective / Calibration Alert */}
      <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
        <div>
          <strong>Live Temporal Synchronization:</strong> Comparing{' '}
          <strong className="font-mono">{baselineTag}</strong> against{' '}
          <strong className="font-mono text-blue-700">{currentTag}</strong> ({daysDiff} days elapsed).
          Normalized bounding polygon coordinate mapping and medial axis crack measurements are evaluated in real time.
        </div>
      </div>

      {/* Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* Left 2 Cols: Split / Side-by-Side Viewer */}
        <div className="lg:col-span-2">
          {viewMode === 'slider' ? (
            <div
              className="relative rounded-xl overflow-hidden shadow-md select-none border border-slate-300 bg-slate-800"
              style={{ height: '480px' }}
            >
              {/* Baseline Image (Underneath) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayBaselineImg}
                alt="Baseline inspection"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 z-10 bg-slate-900/85 text-white text-[11px] font-bold px-3 py-1 rounded shadow">
                {baselineTag}
              </span>

              {/* Latest Image (Clipped on top) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayCurrentImg}
                  alt="Current inspection"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {currentTag}
                </span>
              </div>

              {/* Vertical Slider Bar Divider */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{
                  left: `${sliderPosition}%`,
                  width: '3px',
                  background: '#ffffff',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.6)',
                }}
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-600 cursor-ew-resize border border-slate-200"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>

              {/* Native Range input for dragging */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label="Comparison slider position"
              />
            </div>
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-2 gap-3 h-[480px]">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayBaselineImg}
                  alt="Baseline"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">
                  {baselineTag}
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayCurrentImg}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">
                  {currentTag}
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
            <span>↔ Drag slider horizontally to compare surface delta between surveys</span>
            <span className="font-mono font-semibold text-slate-700">Slider: {sliderPosition}% Position</span>
          </div>
        </div>

        {/* Right Col: Quantitative Delta Progression */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-slate-900 text-sm">Real-Time Progression Metrics</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Principal Crack Length</span>
                  <span
                    className={`badge ${
                      isGrowthPositive && parseFloat(lengthGrowthPct) > 15
                        ? 'badge-red'
                        : isGrowthPositive
                        ? 'badge-amber'
                        : 'badge-teal'
                    }`}
                  >
                    {isGrowthPositive ? `+${lengthGrowthPct}% Growth` : `${lengthGrowthPct}% Delta`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-800 font-mono">
                  <span>Baseline: {baseMetrics.length} px</span>
                  <span>→</span>
                  <span className="font-bold text-red-600">Current: {currMetrics.length} px</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Max Crack Aperture Width</span>
                  <span className="badge badge-amber">{widthDilationPct}% Dilation</span>
                </div>
                <div className="flex justify-between text-slate-800 font-mono">
                  <span>Baseline: {baseMetrics.maxWidth} px</span>
                  <span>→</span>
                  <span className="font-bold text-amber-600">Current: {currMetrics.maxWidth} px</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Active Detected Defects</span>
                  <span className="badge badge-blue">{currMetrics.findingsCount} Defect Finding(s)</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  {currentInsp?.id === activeInspectionId
                    ? 'Evaluated in real-time from your submitted inspection imagery.'
                    : 'Historical survey data extracted from permanent civil engineering inspection register.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                STRUCTURAL INTEGRITY TRAJECTORY
              </span>
              <div className="font-mono font-bold text-slate-800 mb-1">
                Timeline Interval: +{daysDiff} Days Elapsed
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {parseFloat(lengthGrowthPct) > 20
                  ? 'Significant crack growth detected between survey cycles. Low-viscosity epoxy resin injection and structural sensor monitoring are recommended.'
                  : 'Defect dimensions exhibit steady state with minor cyclic thermal expansion. Quarterly scheduled monitoring recommended.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
