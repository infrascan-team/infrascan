'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'

interface PreprocessingStatusModalProps {
  onComplete: () => void
}

interface PipelineStep {
  name: string
  detail: string
  status: 'pending' | 'running' | 'completed'
}

export function PreprocessingStatusModal({ onComplete }: PreprocessingStatusModalProps) {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { name: 'Image received', detail: 'Uploaded frames safely indexed into processing pipeline', status: 'completed' },
    { name: 'Format & resolution validation', detail: 'Verifying pixel dimensions and color space fidelity', status: 'running' },
    { name: 'Quality assessment', detail: 'Computing blur metric, dynamic contrast, and sensor noise floor', status: 'pending' },
    { name: 'Enhancement & normalization', detail: 'Histogram equalization and shadow contrast normalization', status: 'pending' },
    { name: 'Region-of-interest extraction', detail: 'Tiling concrete surface into high-density analysis patches', status: 'pending' },
    { name: 'Ready for AI analysis', detail: 'Feeding tensor patches to YOLOv11-CrackSeg inference pipeline', status: 'pending' },
  ])

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setSteps((prev) => [
          { ...prev[0], status: 'completed' },
          { ...prev[1], status: 'completed' },
          { ...prev[2], status: 'running' },
          prev[3],
          prev[4],
          prev[5],
        ])
      }, 700),
      setTimeout(() => {
        setSteps((prev) => [
          prev[0],
          prev[1],
          { ...prev[2], status: 'completed' },
          { ...prev[3], status: 'running' },
          prev[4],
          prev[5],
        ])
      }, 1400),
      setTimeout(() => {
        setSteps((prev) => [
          prev[0],
          prev[1],
          prev[2],
          { ...prev[3], status: 'completed' },
          { ...prev[4], status: 'running' },
          prev[5],
        ])
      }, 2100),
      setTimeout(() => {
        setSteps((prev) => [
          prev[0],
          prev[1],
          prev[2],
          prev[3],
          { ...prev[4], status: 'completed' },
          { ...prev[5], status: 'completed' },
        ])
      }, 2800),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  const allCompleted = steps.every((s) => s.status === 'completed')

  return (
    <div className="modal-layer">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-[540px] max-w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Image Preprocessing Pipeline</h3>
            <p className="text-xs text-slate-500">Autonomous standardization before CV model inference</p>
          </div>
        </div>

        <div className="space-y-3 py-2">
          {steps.map((step, idx) => (
            <div
              key={step.name}
              className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                step.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : step.status === 'running'
                  ? 'border-blue-300 bg-blue-50/70'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold w-4">{idx + 1}</span>
                <div>
                  <strong className="text-slate-800 block">{step.name}</strong>
                  <span className="text-[11px] text-slate-500">{step.detail}</span>
                </div>
              </div>

              <div>
                {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {step.status === 'running' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                {step.status === 'pending' && <Clock className="w-4 h-4 text-slate-300" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            * Demonstration mode: simulating FastAPI pre-processing pipeline
          </span>
          <button
            className="button primary text-xs"
            disabled={!allCompleted}
            onClick={onComplete}
          >
            <span>Proceed to Analysis Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
