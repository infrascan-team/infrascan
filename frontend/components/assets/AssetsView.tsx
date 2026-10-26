'use client'

import React, { useState } from 'react'
import {
  Building2,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  Grid,
  List,
  MapPin,
  Plus,
  Search,
  Shield,
  Wrench,
  X,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { DEMO_ASSETS, DEMO_INSPECTIONS, DEMO_WORK_ORDERS } from '@/lib/api/mock-data'
import { InfrastructureAsset, InfrastructureType } from '@/types'

const ASSET_TYPES: InfrastructureType[] = [
  'Bridge',
  'Tunnel',
  'Building',
  'Road',
  'Dam',
  'Concrete Structure',
  'Retaining Wall',
  'Industrial Structure',
]

interface AssetsViewProps {
  onNavigate: (tab: any, params?: any) => void
  onOpenNewInspectionForAsset?: (asset: InfrastructureAsset) => void
}

export function AssetsView({ onNavigate, onOpenNewInspectionForAsset }: AssetsViewProps) {
  const [assets, setAssets] = useState<InfrastructureAsset[]>(DEMO_ASSETS)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null)
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Inspections' | 'Findings' | 'Trends' | 'Maintenance' | 'Documents'
  >('Overview')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'Bridge' as InfrastructureType,
    address: '',
    latitude: 40.7128,
    longitude: -74.006,
    constructionYear: 2005,
    materialType: 'Reinforced Concrete' as const,
    responsibleDepartment: 'State Dept of Transportation',
    inspectionFrequencyMonths: 6,
    importance: 'High' as const,
    conditionStatus: 'Good' as const,
    notes: '',
  })

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.id.toLowerCase().includes(search.toLowerCase()) ||
      asset.address.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedType === 'ALL' || asset.type === selectedType
    const matchesCondition =
      selectedCondition === 'ALL' || asset.conditionStatus === selectedCondition
    return matchesSearch && matchesType && matchesCondition
  })

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsset.name || !newAsset.address) {
      alert('Please fill in asset name and address')
      return
    }
    const created: InfrastructureAsset = {
      ...newAsset,
      id: `AST-${newAsset.type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      lastInspectionDate: new Date().toISOString().split('T')[0],
      nextScheduledInspection: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      openFindingsCount: 0,
      maintenanceHistoryCount: 0,
    }
    setAssets([created, ...assets])
    setShowCreateModal(false)
  }

  // Linked inspections & work orders for detail modal
  const assetInspections = selectedAsset
    ? DEMO_INSPECTIONS.filter((i) => i.assetId === selectedAsset.id)
    : []
  const assetWorkOrders = selectedAsset
    ? DEMO_WORK_ORDERS.filter((w) => w.assetId === selectedAsset.id)
    : []

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">INFRASTRUCTURE ASSET REGISTER</p>
          <h1>Assets & Structures</h1>
          <p>Inventory of civil structures with condition tracking, inspection intervals, and maintenance records.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Exporting full asset catalog to CSV...')}
          >
            <Download /> Export Register
          </button>
          <button className="button primary" onClick={() => setShowCreateModal(true)}>
            <Plus /> Register Asset
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="context-bar flex-wrap">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search name, code, or location..."
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
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
        >
          <option value="ALL">All Condition Grades</option>
          <option value="Good">Good Condition</option>
          <option value="Fair">Fair Condition</option>
          <option value="Poor">Poor Condition</option>
          <option value="Critical">Critical Review Required</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            className={`p-2 rounded border ${
              viewMode === 'grid'
                ? 'bg-blue-50 border-blue-400 text-blue-600'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded border ${
              viewMode === 'list'
                ? 'bg-blue-50 border-blue-400 text-blue-600'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              onClick={() => {
                setSelectedAsset(asset)
                setActiveTab('Overview')
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="badge badge-blue">{asset.type}</span>
                  <span
                    className={`badge ${
                      asset.conditionStatus === 'Poor'
                        ? 'badge-red'
                        : asset.conditionStatus === 'Fair'
                        ? 'badge-amber'
                        : 'badge-teal'
                    }`}
                  >
                    {asset.conditionStatus}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{asset.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{asset.address}</span>
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Material
                    </span>
                    <strong className="text-slate-800 text-[13px]">{asset.materialType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Built
                    </span>
                    <strong className="text-slate-800 text-[13px]">{asset.constructionYear}</strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Open Defects: <b className="text-slate-900 font-bold">{asset.openFindingsCount}</b>
                </span>
                <span className="text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  Inspect Asset <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="panel table-panel mt-4">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Asset Code</th>
                  <th>Structure Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Condition</th>
                  <th>Material</th>
                  <th>Last Survey</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td>
                      <b>{asset.id}</b>
                    </td>
                    <td>
                      <strong>{asset.name}</strong>
                    </td>
                    <td>{asset.type}</td>
                    <td>{asset.address}</td>
                    <td>
                      <span
                        className={`badge ${
                          asset.conditionStatus === 'Poor'
                            ? 'badge-red'
                            : asset.conditionStatus === 'Fair'
                            ? 'badge-amber'
                            : 'badge-teal'
                        }`}
                      >
                        {asset.conditionStatus}
                      </span>
                    </td>
                    <td>{asset.materialType}</td>
                    <td>{asset.lastInspectionDate}</td>
                    <td>
                      <button
                        className="text-xs text-blue-600 font-semibold hover:underline"
                        onClick={() => {
                          setSelectedAsset(asset)
                          setActiveTab('Overview')
                        }}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="modal-layer">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[900px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-blue">{selectedAsset.type}</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedAsset.id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedAsset.name}</h2>
                <p className="text-xs text-slate-500">{selectedAsset.address}</p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700"
                onClick={() => setSelectedAsset(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-nav mt-4">
              {(['Overview', 'Inspections', 'Findings', 'Trends', 'Maintenance', 'Documents'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Material System
                    </span>
                    <p className="font-semibold text-slate-800">{selectedAsset.materialType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Construction Year
                    </span>
                    <p className="font-semibold text-slate-800">{selectedAsset.constructionYear}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Managing Department
                    </span>
                    <p className="font-semibold text-slate-800">
                      {selectedAsset.responsibleDepartment}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Infrastructure Classification
                    </span>
                    <p className="font-semibold text-slate-800">{selectedAsset.importance}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Geographic Coordinates
                    </span>
                    <p className="font-mono text-slate-700">
                      Lat: {selectedAsset.latitude.toFixed(4)}, Lng: {selectedAsset.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Inspection Frequency
                    </span>
                    <p className="font-semibold text-slate-800">
                      Every {selectedAsset.inspectionFrequencyMonths} Months
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Engineering Notes
                    </span>
                    <p className="text-slate-600 leading-relaxed">{selectedAsset.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Inspections */}
            {activeTab === 'Inspections' && (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  Historical image-based and field surveys conducted on this structure:
                </p>
                {assetInspections.length > 0 ? (
                  <div className="space-y-2">
                    {assetInspections.map((insp) => (
                      <div
                        key={insp.id}
                        className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50"
                      >
                        <div>
                          <b>{insp.id}</b> · <span className="text-slate-600">{insp.title}</span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Date: {insp.date} · Inspector: {insp.inspectorName}
                          </div>
                        </div>
                        <button
                          className="button primary text-xs py-1 px-3"
                          onClick={() => {
                            setSelectedAsset(null)
                            onNavigate('Analysis Results', { inspectionId: insp.id })
                          }}
                        >
                          View Analysis
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No historical inspections recorded in demo dataset for this structure.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Findings */}
            {activeTab === 'Findings' && (
              <div className="space-y-2 text-xs">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900">
                  <strong>Structural Notice:</strong> Unresolved damage items automatically feed
                  into structural health progression tracking.
                </div>
                <div className="p-3 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="badge badge-red mb-1">Severe Defect</span>
                    <p className="font-semibold text-slate-800">
                      Diagonal principal tensile shear crack
                    </p>
                    <small className="text-slate-500">
                      Length: ~412px · Max Width: ~14.2px (Uncalibrated)
                    </small>
                  </div>
                  <button
                    className="button secondary text-xs"
                    onClick={() => {
                      setSelectedAsset(null)
                      onNavigate('Maintenance & Work Orders')
                    }}
                  >
                    Raise Work Order
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Historical Trends */}
            {activeTab === 'Trends' && (
              <div className="text-xs space-y-3">
                <p className="text-slate-600">
                  Condition trajectory over past 3 annual inspection cycles:
                </p>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">2022 Cycle: Good (Score: 88/100)</p>
                    <p className="text-slate-500">No active crack dilation detected.</p>
                  </div>
                  <span className="badge badge-teal">Stable</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">2023 Cycle: Fair (Score: 74/100)</p>
                    <p className="text-slate-500">Hairline surface fissures initiated along pier cap.</p>
                  </div>
                  <span className="badge badge-amber">Monitoring</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">2024 Cycle: Fair (Score: 68/100)</p>
                    <p className="text-slate-500">
                      Shear dilation observed under heavy freight loading.
                    </p>
                  </div>
                  <span className="badge badge-amber">Action Req.</span>
                </div>
              </div>
            )}

            {/* Tab 5: Maintenance */}
            {activeTab === 'Maintenance' && (
              <div className="text-xs space-y-2">
                {assetWorkOrders.length > 0 ? (
                  assetWorkOrders.map((wo) => (
                    <div key={wo.id} className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                      <div className="flex justify-between items-center mb-1">
                        <b>{wo.id}</b>
                        <span className="badge badge-blue">{wo.status}</span>
                      </div>
                      <p className="text-slate-700 font-semibold">{wo.title}</p>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Assigned: {wo.assignedTeam} · Due: {wo.dueDate}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-6 text-center">
                    No active maintenance work orders for this structure.
                  </p>
                )}
              </div>
            )}

            {/* Tab 6: Documents */}
            {activeTab === 'Documents' && (
              <div className="space-y-2 text-xs">
                <div className="border border-slate-200 p-3 rounded-lg flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <strong>As-Built Structural Blueprints.pdf</strong>
                      <small className="block text-slate-400">14.2 MB · Archival Vault</small>
                    </div>
                  </div>
                  <button
                    className="button secondary text-xs py-1 px-3"
                    onClick={() => alert('Downloading archival document...')}
                  >
                    Download
                  </button>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <div>
                      <strong>Geotechnical Foundation Borings.pdf</strong>
                      <small className="block text-slate-400">4.8 MB · Certified Geotech</small>
                    </div>
                  </div>
                  <button
                    className="button secondary text-xs py-1 px-3"
                    onClick={() => alert('Downloading archival document...')}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button className="button secondary" onClick={() => setSelectedAsset(null)}>
                Close
              </button>
              <button
                className="button primary"
                onClick={() => {
                  const asset = selectedAsset
                  setSelectedAsset(null)
                  if (onOpenNewInspectionForAsset) {
                    onOpenNewInspectionForAsset(asset)
                  }
                }}
              >
                Start New Inspection for Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="modal-layer">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[600px] max-w-full">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Register Civil Asset</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="mt-4 space-y-4">
              <div className="form-group">
                <label>Infrastructure Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. South Gateway Overpass"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Structure Type *</label>
                  <select
                    className="form-select"
                    value={newAsset.type}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, type: e.target.value as InfrastructureType })
                    }
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Material System *</label>
                  <select
                    className="form-select"
                    value={newAsset.materialType}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, materialType: e.target.value as any })
                    }
                  >
                    <option value="Reinforced Concrete">Reinforced Concrete</option>
                    <option value="Prestressed Concrete">Prestressed Concrete</option>
                    <option value="Structural Steel">Structural Steel</option>
                    <option value="Composite">Composite</option>
                    <option value="Masonry">Masonry</option>
                    <option value="Asphalt">Asphalt</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Physical Address / Location *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Mile Marker 14.8, Interstate 95"
                  value={newAsset.address}
                  onChange={(e) => setNewAsset({ ...newAsset, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={newAsset.latitude}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, latitude: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={newAsset.longitude}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, longitude: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Construction Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newAsset.constructionYear}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, constructionYear: parseInt(e.target.value) || 2000 })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Importance Rating</label>
                  <select
                    className="form-select"
                    value={newAsset.importance}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, importance: e.target.value as any })
                    }
                  >
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Critical National Infrastructure">
                      Critical National Infrastructure
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes & Structural Context</label>
                <textarea
                  className="form-textarea"
                  placeholder="Structural context, known environmental exposures, load restrictions..."
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
