'use client'

import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Flag,
  Maximize2,
  Minimize2,
  RefreshCw,
  Ruler,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info,
  ShieldAlert,
} from 'lucide-react'
import { DEMO_INSPECTIONS } from '@/lib/api/mock-data'
import { DamageFinding, Inspection } from '@/types'

interface AnalysisViewProps {
  inspectionId?: string
  onNavigate: (tab: any, params?: any) => void
}

export function AnalysisView({ inspectionId, onNavigate }: AnalysisViewProps) {
  const currentInspection: Inspection =
    DEMO_INSPECTIONS.find((i) => i.id === inspectionId) || DEMO_INSPECTIONS[0]

  const currentImage = currentInspection.images[0] || {
    id: 'placeholder',
    filename: 'pier4_south_face_highres.jpg',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1200&q=80',
    findings: [],
  }

  // View modes
  const [activeOverlay, setActiveOverlay] = useState<
    'original' | 'detection' | 'segmentation' | 'explainability'
  >('detection')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [opacity, setOpacity] = useState<number>(85)
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    currentImage.findings[0]?.id || ''
  )

  // Review states
  const [reviewStatus, setReviewStatus] = useState<'Pending' | 'Approved' | 'Flagged' | 'Reinspection'>(
    'Pending'
  )
  const [engineerComment, setEngineerComment] = useState('')
  const [commentSaved, setCommentSaved] = useState(false)

  const selectedFinding: DamageFinding | undefined =
    currentImage.findings.find((f) => f.id === selectedFindingId) || currentImage.findings[0]

  const handleApprove = () => {
    setReviewStatus('Approved')
    alert('Inspection assessment formally approved by qualified engineer.')
  }

  const handleFlagIncorrect = () => {
    setReviewStatus('Flagged')
    alert('Bounding box marked as false-positive for model retraining review.')
  }

  const handleRequestReinspection = () => {
    setReviewStatus('Reinspection')
    alert('Re-inspection request dispatched to field inspection queue.')
  }

  return (
    <div className="page-wrap">
      {/* Top Header */}
      <section className="page-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue">{currentInspection.assetType}</span>
            <span className="text-xs text-slate-400 font-mono">{currentInspection.id}</span>
            <span
              className={`badge ${
                reviewStatus === 'Approved'
                  ? 'badge-teal'
                  : reviewStatus === 'Flagged'
                  ? 'badge-red'
                  : 'badge-amber'
              }`}
            >
              Engineer Status: {reviewStatus}
            </span>
          </div>
          <h1>{currentInspection.assetName} · Structural AI Analysis</h1>
          <p>
            Computer vision defect detection, crack segmentation masks, and pixel-calibrated measurements.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => onNavigate('Reports', { inspectionId: currentInspection.id })}
          >
            <Download /> View Full Engineering Report
          </button>
          <button
            className="button primary"
            onClick={() => onNavigate('Historical Comparison')}
          >
            Historical Comparison →
          </button>
        </div>
      </section>

      {/* Mandatory Engineering Disclaimer Notice (§ 9) */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-none mt-0.5" />
        <div className="leading-relaxed">
          <strong>CRITICAL CIVIL ENGINEERING PROTOCOL:</strong> AI computer-vision crack detections
          and dimension approximations do not represent definitive structural safety judgments. All
          defect findings must be reviewed and signed off by a qualified structural engineer prior
          to closing or dispatching maintenance interventions.
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* Left 2 Cols: Image Canvas & Viewer */}
        <div className="lg:col-span-2 space-y-3">
          {/* Viewer Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Layer Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              <button
                className={`px-3 py-1.5 rounded font-medium ${
                  activeOverlay === 'original'
                    ? 'bg-white shadow text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveOverlay('original')}
              >
                Original Photo
              </button>
              <button
                className={`px-3 py-1.5 rounded font-medium ${
                  activeOverlay === 'detection'
                    ? 'bg-white shadow text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveOverlay('detection')}
              >
                Crack Bounding Boxes
              </button>
              <button
                className={`px-3 py-1.5 rounded font-medium ${
                  activeOverlay === 'segmentation'
                    ? 'bg-white shadow text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveOverlay('segmentation')}
              >
                Segmentation Mask
              </button>
              <button
                className={`px-3 py-1.5 rounded font-medium ${
                  activeOverlay === 'explainability'
                    ? 'bg-white shadow text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveOverlay('explainability')}
              >
                Attention Heatmap
              </button>
            </div>

            {/* Zoom & Opacity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 20))}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono">{zoomLevel}%</span>
                <button
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                  onClick={() => setZoomLevel(Math.min(250, zoomLevel + 20))}
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {activeOverlay !== 'original' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">OPACITY</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-20 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="canvas-wrapper relative select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.url}
              alt="Concrete inspection"
              className="canvas-img"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                filter:
                  activeOverlay === 'explainability'
                    ? `hue-rotate(180deg) saturate(200%) contrast(120%)`
                    : 'none',
              }}
            />

            {/* Synthetic Segmentation Mask Overlay */}
            {activeOverlay === 'segmentation' && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  opacity: opacity / 100,
                  background:
                    'radial-gradient(ellipse at 42% 48%, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.4) 30%, transparent 65%)',
                }}
              />
            )}

            {/* Explainability / Attention Heatmap Overlay */}
            {activeOverlay === 'explainability' && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge"
                style={{
                  opacity: opacity / 100,
                  background:
                    'conic-gradient(from 45deg at 40% 45%, #ef4444 0deg, #3b82f6 180deg, #10b981 360deg)',
                }}
              />
            )}

            {/* Interactive Detection Bounding Boxes */}
            {(activeOverlay === 'detection' || activeOverlay === 'segmentation') &&
              currentImage.findings.map((f) => (
                <div
                  key={f.id}
                  className={`bbox-box ${selectedFindingId === f.id ? 'selected' : ''}`}
                  style={{
                    left: `${f.bbox[0]}%`,
                    top: `${f.bbox[1]}%`,
                    width: `${f.bbox[2]}%`,
                    height: `${f.bbox[3]}%`,
                    opacity: opacity / 100,
                  }}
                  onClick={() => setSelectedFindingId(f.id)}
                >
                  <span className="bbox-label">
                    {f.category} · {(f.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>

          {/* Model Pipeline Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs text-slate-500">
            <span>
              Inference Model: <b>YOLOv11-CrackSeg v2.4.1 (Production)</b> · Processing latency: 142ms
            </span>
            <span className="badge badge-teal">Calibrated Resolution: 4032 x 3024</span>
          </div>
        </div>

        {/* Right Col: Findings & Quantitative Measurements */}
        <div className="space-y-4">
          {/* Findings List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Detected Defects ({currentImage.findings.length})
            </h3>
            <div className="space-y-2">
              {currentImage.findings.map((f) => (
                <div
                  key={f.id}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedFindingId === f.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedFindingId(f.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <strong className="text-xs text-slate-900">{f.category}</strong>
                    <span
                      className={`badge ${
                        f.severity === 'Severe'
                          ? 'badge-red'
                          : f.severity === 'Moderate'
                          ? 'badge-amber'
                          : 'badge-teal'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between mt-1">
                    <span>Crack Type: {f.crackType || 'Shear/Fissure'}</span>
                    <span className="font-semibold text-blue-600">
                      {(f.confidenceScore * 100).toFixed(1)}% Conf.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantitative Measurement Panel */}
          {selectedFinding && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Ruler className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900">Quantitative Pixel Measurements</h3>
              </div>

              {/* Critical Measurement Rule Banner (§ 9) */}
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[11px] text-slate-600 leading-snug">
                <strong className="block text-slate-800">Uncalibrated Sensor Scale Notice:</strong>
                Because optical focal distance and physical millimeter calibration targets were not
                rigidly verified in-situ, metrics are reported in raw sensor pixel dimensions to
                prevent misleading precision.
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Crack Length
                  </span>
                  <strong className="text-sm font-mono">
                    {selectedFinding.measurements.crackLengthPx} px
                  </strong>
                </div>

                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Max Width
                  </span>
                  <strong className="text-sm font-mono">
                    {selectedFinding.measurements.maxWidthPx} px
                  </strong>
                </div>

                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Average Width
                  </span>
                  <strong className="text-sm font-mono">
                    {selectedFinding.measurements.avgWidthPx} px
                  </strong>
                </div>

                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Orientation
                  </span>
                  <strong className="text-sm font-mono">
                    {selectedFinding.measurements.orientationAngleDeg}° Angle
                  </strong>
                </div>
              </div>

              {selectedFinding.measurements.uncertaintyNotes && (
                <p className="text-[10px] text-slate-500 italic">
                  Note: {selectedFinding.measurements.uncertaintyNotes}
                </p>
              )}
            </div>
          )}

          {/* Engineer Review & Disposition Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
              Civil Engineer Sign-Off & Disposition
            </h3>

            <div className="flex flex-col gap-2">
              <button
                className="button primary w-full justify-center"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Assessment
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="button secondary justify-center text-red-600 hover:bg-red-50"
                  onClick={handleFlagIncorrect}
                >
                  <Flag className="w-3.5 h-3.5" /> Flag Detection
                </button>
                <button
                  className="button secondary justify-center text-amber-600 hover:bg-amber-50"
                  onClick={handleRequestReinspection}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-inspect
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                ENGINEERING COMMENTARY & AUDIT NOTES
              </label>
              <textarea
                className="form-textarea text-xs w-full"
                placeholder="Record structural rationale or maintenance instructions..."
                value={engineerComment}
                onChange={(e) => setEngineerComment(e.target.value)}
              />
              <button
                className="button secondary text-xs mt-2 w-full justify-center"
                onClick={() => {
                  setCommentSaved(true)
                  setTimeout(() => setCommentSaved(false), 2000)
                }}
              >
                {commentSaved ? 'Audit Note Saved' : 'Save Engineering Note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
