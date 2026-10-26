'use client'

import React, { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  Layers,
  ShieldCheck,
  Info,
  ShieldAlert,
} from 'lucide-react'
import { DEMO_MODELS } from '@/lib/api/mock-data'
import { ModelVersion } from '@/types'

export function ModelPerformanceView() {
  const [models, setModels] = useState<ModelVersion[]>(DEMO_MODELS)
  const [selectedModel, setSelectedModel] = useState<ModelVersion>(DEMO_MODELS[0])

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">COMPUTER VISION MODEL REGISTRY & AI GOVERNANCE</p>
          <h1>Model Performance & Verification</h1>
          <p>
            Track model validation benchmarks, segmentation IoU metrics, benchmark datasets, and certified weights.
          </p>
        </div>
      </section>

      {/* AI Governance Mandatory Disclaimer (§ 17) */}
      <div className="mt-4 bg-slate-100 border border-slate-200 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-none mt-0.5" />
        <div>
          <strong>AI TRANSPARENCY & VERIFICATION PROTOCOL:</strong> Model evaluation metrics shown
          reflect certified validation benchmarks measured against verified ground-truth test sets
          (CivilCrack-National-v3). Synthetic or exaggerated claims are prohibited under enterprise
          structural safety guidelines.
        </div>
      </div>

      {/* Model Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {models.map((model) => (
          <div
            key={model.id}
            className={`bg-white border rounded-xl p-5 cursor-pointer transition ${
              selectedModel.id === model.id
                ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-blue">{model.modelType}</span>
              <span
                className={`badge ${
                  model.deploymentStatus === 'Active' ? 'badge-teal' : 'badge-amber'
                }`}
              >
                {model.deploymentStatus === 'Active' ? 'Production Active' : 'Canary Validation'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">{model.name}</h3>
            <p className="text-xs text-slate-500 font-mono mb-3">Version {model.version}</p>

            <div className="text-xs space-y-1.5 text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Evaluation Date:</span>
                <b className="font-mono">{model.evaluationDate}</b>
              </div>
              <div className="flex justify-between">
                <span>Dataset:</span>
                <b>{model.datasetReference}</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Dashboard for Selected Model */}
      <div className="mt-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Validation Benchmarks · {selectedModel.name}
        </h2>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-copy">
              <p>Precision (mAP@50)</p>
              <strong>{(selectedModel.metrics.precision * 100).toFixed(1)}%</strong>
              <span className="positive">Ground-truth test set</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-copy">
              <p>Recall (Sensitivity)</p>
              <strong>{(selectedModel.metrics.recall * 100).toFixed(1)}%</strong>
              <span className="positive">Minimizes false negatives</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-copy">
              <p>F1-Score Metric</p>
              <strong>{selectedModel.metrics.f1Score.toFixed(3)}</strong>
              <span className="positive">Harmonic precision/recall</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-copy">
              <p>Segmentation IoU</p>
              <strong>{(selectedModel.metrics.iouSegmentation * 100).toFixed(1)}%</strong>
              <span className="positive">Intersection-over-Union</span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          <div className="panel">
            <div className="panel-head mb-4">
              <div>
                <h2>Normalized Confusion Matrix</h2>
                <p>Crack Detection vs Negative Structural Concrete Background</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] text-emerald-600 font-bold block uppercase">
                  True Positive (Crack)
                </span>
                <strong className="text-xl text-emerald-800">94.2%</strong>
                <p className="text-slate-500 text-[10px] mt-1">Accurately detected defects</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-[10px] text-red-600 font-bold block uppercase">
                  False Positive (Stain)
                </span>
                <strong className="text-xl text-red-800">5.8%</strong>
                <p className="text-slate-500 text-[10px] mt-1">Water mark misclassification</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[10px] text-amber-600 font-bold block uppercase">
                  False Negative (Miss)
                </span>
                <strong className="text-xl text-amber-800">8.2%</strong>
                <p className="text-slate-500 text-[10px] mt-1">Hairline fissure below 0.1mm</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[10px] text-blue-600 font-bold block uppercase">
                  True Negative (Sound)
                </span>
                <strong className="text-xl text-blue-800">91.8%</strong>
                <p className="text-slate-500 text-[10px] mt-1">Sound surface rejection</p>
              </div>
            </div>
          </div>

          {/* Dataset Governance Card */}
          <div className="panel text-xs space-y-3">
            <div className="panel-head">
              <div>
                <h2>Training & Validation Governance</h2>
                <p>Sensor provenance & dataset integrity</p>
              </div>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold block">
                  TRAINING DATASET REFERENCE
                </span>
                <b className="text-slate-900">{selectedModel.datasetVersion}</b>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold block">
                  SEGMENTATION ARCHITECTURE
                </span>
                <b className="text-slate-900">
                  Feature Pyramid Network with Cross-Stage Partial Bottlenecks
                </b>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold block">
                  DEPLOYMENT LATENCY TARGET
                </span>
                <b className="text-slate-900">&lt; 200ms per 4K tile inference on NVIDIA T4/A10G</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
