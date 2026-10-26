'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  Layers,
  MapPin,
  RotateCw,
  Trash2,
  UploadCloud,
  X,
  AlertTriangle,
  Camera,
  Info,
} from 'lucide-react'
import { DEMO_ASSETS } from '@/lib/api/mock-data'
import { InfrastructureAsset, Inspection } from '@/types'

interface NewInspectionWizardProps {
  initialAsset?: InfrastructureAsset | null
  onClose: () => void
  onSubmitInspection: (inspectionData: Partial<Inspection>) => void
}

interface UploadedFilePreview {
  id: string
  name: string
  size: number
  previewUrl: string
  resolution: string
  blurStatus: 'Pass' | 'Warning' | 'Low-Light Warning'
  rotation: number
}

export function NewInspectionWizard({
  initialAsset,
  onClose,
  onSubmitInspection,
}: NewInspectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Step 1: Asset selection
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAsset?.id || DEMO_ASSETS[0].id
  )

  // Step 2: Details
  const [title, setTitle] = useState('Pier & Substructure Damage Survey')
  const [inspectionType, setInspectionType] = useState<
    'Routine' | 'Emergency' | 'Post-Incident' | 'Baseline' | 'Regulatory'
  >('Routine')
  const [inspectorName, setInspectorName] = useState('Marcus Vance')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High')
  const [notes, setNotes] = useState('High-resolution macro images collected using calibrated drone sensor.')

  // Step 3 & 4: Uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilePreview[]>([
    {
      id: 'img-1',
      name: 'pier4_south_macro_01.jpg',
      size: 4210000,
      previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=800&q=80',
      resolution: '4032 x 3024 (12.2 MP)',
      blurStatus: 'Pass',
      rotation: 0,
    },
    {
      id: 'img-2',
      name: 'pier4_south_macro_02.jpg',
      size: 3890000,
      previewUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
      resolution: '4032 x 3024 (12.2 MP)',
      blurStatus: 'Pass',
      rotation: 0,
    },
  ])

  // Step 5: Engineer Confirmation
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false)

  const selectedAsset = DEMO_ASSETS.find((a) => a.id === selectedAssetId) || DEMO_ASSETS[0]

  const handleSimulatedDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadedFilePreview[] = Array.from(e.target.files).map((f, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        name: f.name,
        size: f.size,
        previewUrl: URL.createObjectURL(f),
        resolution: '3840 x 2160 (4K UHD)',
        blurStatus: 'Pass',
        rotation: 0,
      }))
      setUploadedFiles([...uploadedFiles, ...newItems])
    }
  }

  const handleRotate = (id: string) => {
    setUploadedFiles(
      uploadedFiles.map((f) => (f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f))
    )
  }

  const handleRemove = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id))
  }

  const handleFinalSubmit = () => {
    const inspectionData: Partial<Inspection> = {
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assetType: selectedAsset.type,
      title,
      inspectionType,
      inspectorName,
      priority,
      status: 'Processing',
      overallSeverity: 'Moderate',
      findingsCount: 4,
      date: new Date().toISOString().split('T')[0],
      images: uploadedFiles.map((f, idx) => ({
        id: `IMG-${Date.now()}-${idx}`,
        filename: f.name,
        url: f.previewUrl,
        uploadedAt: new Date().toISOString(),
        resolution: f.resolution,
        fileSizeBytes: f.size,
        qualityScore: 92,
        blurScore: f.blurStatus,
        findings: [],
      })),
    }
    onSubmitInspection(inspectionData)
  }

  return (
    <div className="modal-layer">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-[840px] max-w-full max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 block">
                Workflow Wizard
              </span>
              <h2 className="text-base font-bold text-slate-900">Initiate Structural Inspection</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="wizard-steps mt-4">
            <div className={`wizard-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
              <span className="wizard-num">1</span>
              <span>Select Asset</span>
            </div>
            <div className={`wizard-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
              <span className="wizard-num">2</span>
              <span>Survey Details</span>
            </div>
            <div className={`wizard-step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
              <span className="wizard-num">3</span>
              <span>Upload Imagery</span>
            </div>
            <div className={`wizard-step ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}>
              <span className="wizard-num">4</span>
              <span>Quality Review</span>
            </div>
            <div className={`wizard-step ${currentStep === 5 ? 'active' : ''}`}>
              <span className="wizard-num">5</span>
              <span>Submit for AI</span>
            </div>
          </div>

          {/* Step 1: Select Asset */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="form-group">
                <label>Target Infrastructure Asset *</label>
                <select
                  className="form-select"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  {DEMO_ASSETS.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id}) · {asset.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Card Preview */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-sm text-slate-900">{selectedAsset.name}</strong>
                  <span className="badge badge-blue">{selectedAsset.type}</span>
                </div>
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAsset.address}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">MATERIAL</span>
                    <b>{selectedAsset.materialType}</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">CONDITION</span>
                    <b>{selectedAsset.conditionStatus}</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">LAST SURVEY</span>
                    <b>{selectedAsset.lastInspectionDate}</b>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Survey Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="form-group">
                <label>Inspection Title *</label>
                <input
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Abutment & Pier Inspection"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Survey Type</label>
                  <select
                    className="form-select"
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as any)}
                  >
                    <option value="Routine">Routine Survey</option>
                    <option value="Emergency">Emergency Inspection</option>
                    <option value="Post-Incident">Post-Incident Structural Audit</option>
                    <option value="Baseline">Baseline Pre-Operation Survey</option>
                    <option value="Regulatory">Mandated Regulatory Review</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned Inspector / Engineer</label>
                  <input
                    className="form-input"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Review</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Scheduled</label>
                  <input
                    type="date"
                    className="form-input"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Inspection Notes & Camera Spec</label>
                <textarea
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify sensor, distance from surface, lighting conditions..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Upload Imagery */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="dropzone relative">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleSimulatedDrop}
                />
                <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">
                  Drag and drop high-resolution inspection photos here
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: JPEG, PNG, WebP (up to 50MB per raw frame)
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="button secondary text-xs py-1 px-3 pointer-events-none">
                    Select Files
                  </span>
                  <span className="button secondary text-xs py-1 px-3 pointer-events-none">
                    <Camera className="w-3.5 h-3.5" /> Mobile Camera
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Queued Images ({uploadedFiles.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="upload-thumb group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        style={{ transform: `rotate(${file.rotation}deg)` }}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleRemove(file.id)}
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        className="absolute top-1 left-1 bg-slate-900/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleRotate(file.id)}
                        title="Rotate"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Quality Review */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2 text-blue-900">
                <Info className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
                <div>
                  <strong>Client-Side Image Quality Pre-Check:</strong> Verifying resolution, blur,
                  and dynamic range prior to sending frames to the computer-vision damage segmentation model.
                </div>
              </div>

              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-slate-200 rounded-lg p-3 flex items-center justify-between bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded overflow-hidden flex-none border border-slate-200 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          style={{ transform: `rotate(${file.rotation}deg)` }}
                        />
                      </div>
                      <div>
                        <strong className="block text-slate-800">{file.name}</strong>
                        <span className="text-slate-500 block">
                          Resolution: {file.resolution} · Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="badge badge-teal">Sharpness: Pass</span>
                      <span className="badge badge-blue">Lighting: Optimal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Inspection Package Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">STRUCTURE</span>
                    <b>{selectedAsset.name}</b> ({selectedAsset.type})
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">TITLE</span>
                    <b>{title}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">INSPECTOR</span>
                    <b>{inspectorName}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">IMAGES</span>
                    <b>{uploadedFiles.length} High-Resolution Frames</b>
                  </div>
                </div>
              </div>

              <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirm"
                  className="mt-1"
                  checked={confirmedAccuracy}
                  onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                />
                <label htmlFor="confirm" className="text-amber-900 leading-relaxed cursor-pointer">
                  <b>Confirmation & Engineering Protocol:</b> I confirm these photographic surveys
                  represent actual in-situ conditions of the structural asset. AI analysis results
                  will undergo formal qualified engineering review prior to generating permanent
                  maintenance work orders.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between">
          {currentStep > 1 ? (
            <button
              className="button secondary text-xs"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button className="button secondary text-xs" onClick={onClose}>
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              className="button primary text-xs"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              className="button primary text-xs"
              disabled={!confirmedAccuracy}
              onClick={handleFinalSubmit}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Submit for Preprocessing & AI
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
