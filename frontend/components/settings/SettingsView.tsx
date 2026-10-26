'use client'

import React, { useState } from 'react'
import { Bell, Check, Database, Globe, Lock, Palette, Save, Sliders, Shield } from 'lucide-react'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'General' | 'Inspection Defaults' | 'Notifications' | 'API'>('General')
  const [savedNotice, setSavedNotice] = useState(false)

  // Settings State
  const [measurementUnit, setMeasurementUnit] = useState('Pixel Dimensions (Default Uncalibrated)')
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState('Severe')
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000')

  const handleSave = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM CONFIGURATION & CALIBRATION</p>
          <h1>Workspace Settings</h1>
          <p>Configure model inference defaults, measurement calibration policies, and integration endpoints.</p>
        </div>
        <div className="heading-actions">
          <button className="button primary" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </section>

      {savedNotice && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Settings successfully updated in workspace memory.
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-nav mt-5">
        {(['General', 'Inspection Defaults', 'Notifications', 'API'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Settings Forms */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs max-w-2xl">
        {activeTab === 'General' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Interface & Display Preferences
            </h3>

            <div className="form-group">
              <label>Theme & Visual Direction</label>
              <select className="form-select" disabled>
                <option>Engineering Light Mode (Mandated Enterprise Standard)</option>
              </select>
              <span className="text-[10px] text-slate-400">
                Light theme calibrated for high-contrast sunlight field inspection visibility.
              </span>
            </div>

            <div className="form-group">
              <label>Default Crack Measurement Units</label>
              <select
                className="form-select"
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
              >
                <option value="Pixel Dimensions (Default Uncalibrated)">
                  Pixel Dimensions (Default Uncalibrated)
                </option>
                <option value="Physical Metric (Requires Verified Reference Grid Target)">
                  Physical Metric (Requires Verified Reference Grid Target)
                </option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'Inspection Defaults' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Inspection Workflow & Inference Pipeline
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <strong className="block text-slate-800">Auto Contrast Normalization</strong>
                <span className="text-slate-500 text-[11px]">
                  Apply CLAHE shadow enhancement prior to neural inference
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEnhance}
                onChange={(e) => setAutoEnhance(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="form-group">
              <label>Severe Damage Escalation Threshold</label>
              <select
                className="form-select"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
              >
                <option value="Critical">Critical Only (Structural Failure Danger)</option>
                <option value="Severe">Severe & Critical (Immediate Shoring)</option>
                <option value="Moderate">Moderate, Severe & Critical</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Audit Alerts & Email Notifications
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Notify when a new inspection is assigned to field team</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Trigger immediate alert when Critical shear crack is flagged</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Notify certifying engineer when work orders are closed</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'API' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              FastAPI Backend Service Connection
            </h3>

            <div className="form-group">
              <label>FastAPI Base Service Endpoint</label>
              <input
                className="form-input font-mono"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="http://localhost:8000"
              />
              <span className="text-[10px] text-slate-400">
                When offline or unset, InfraScan runs in autonomous client-side demo mode.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
