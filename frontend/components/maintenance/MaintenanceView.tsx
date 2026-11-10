'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus,
  Search,
  Wrench,
  X,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { DEMO_ASSETS, DEMO_INSPECTIONS, DEMO_WORK_ORDERS } from '@/lib/api/mock-data'
import {
  MaintenanceWorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
  InfrastructureAsset,
  Inspection,
} from '@/types'
import { MaintenanceService } from '@/lib/api/maintenance.service'
import { AssetsService } from '@/lib/api/assets.service'
import { InspectionsService } from '@/lib/api/inspections.service'

const REMEDIATION_TEMPLATES = [
  {
    title: 'Low-Viscosity Epoxy Resin Crack Injection & Structural Sealing',
    spec: 'Clean crack channel under 6 bar compressed air. Mount surface injection ports at 150mm intervals. Inject structural-grade high-modulus epoxy resin (ASTM C881 Type I/IV) until refusal. Cure for 48 hours before load testing.',
    priority: 'High Priority' as WorkOrderPriority,
  },
  {
    title: 'Carbon-Fiber Reinforced Polymer (CFRP) Shear Strengthening',
    spec: 'Abrasive blast concrete substrate to CSP 3 profile. Apply epoxy primer coat. Apply unidirectional carbon fiber sheet saturated with structural epoxy resin to counteract tensile shear stress. 72hr cure.',
    priority: 'Urgent Engineering Review' as WorkOrderPriority,
  },
  {
    title: 'Polymer-Modified Mortar Patching & Rebar Anti-Corrosion Encasement',
    spec: 'Saw-cut spall perimeter 20mm deep. Expose corroded rebar 360 degrees. Sandblast to Sa 2.5 cleanliness. Apply zinc-rich anti-corrosion barrier primer. Pack with polymer-modified repair mortar.',
    priority: 'High Priority' as WorkOrderPriority,
  },
  {
    title: 'Acoustic Displacement Gauge & Vibrating Wire Crack Meter Installation',
    spec: 'Install triaxial vibrating wire crack displacement transducer across primary fracture plane. Connect to solar-powered cellular telemetry datalogger. Set dynamic threshold alarm at 0.15mm dilation.',
    priority: 'Medium Priority' as WorkOrderPriority,
  },
]

export function MaintenanceView() {
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(DEMO_WORK_ORDERS)
  const [assets, setAssets] = useState<InfrastructureAsset[]>(DEMO_ASSETS)
  const [inspections, setInspections] = useState<Inspection[]>(DEMO_INSPECTIONS)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Work Order Form State
  const [selectedInspId, setSelectedInspId] = useState<string>('INSP-2024-0248')
  const [newOrder, setNewOrder] = useState({
    title: 'Low-Viscosity Epoxy Resin Crack Injection & Structural Sealing',
    assetId: DEMO_ASSETS[0].id,
    priority: 'High Priority' as WorkOrderPriority,
    assignedTeam: 'Specialized Concrete Rehabilitation Unit',
    assignedEngineer: 'Sarah Lin',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    repairRecommendations:
      'Clean crack channel under compressed air. Mount injection ports at 150mm intervals. Inject high-modulus epoxy resin until refusal.',
    followUpInspectionRequired: true,
  })

  // Load live data from FastAPI backend
  const refreshData = async () => {
    try {
      const [allWos, allAssets, allInsps] = await Promise.all([
        MaintenanceService.getAll(),
        AssetsService.getAll(),
        InspectionsService.getAll(),
      ])
      if (allWos && allWos.length > 0) setWorkOrders(allWos)
      if (allAssets && allAssets.length > 0) setAssets(allAssets)
      if (allInsps && allInsps.length > 0) {
        setInspections(allInsps)
        setSelectedInspId(allInsps[0].id)
      }
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const filtered = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.inspectionId.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter
    return matchesSearch && matchesPriority && matchesStatus
  })

  // KPI Calculations
  const activeCount = workOrders.filter((w) => w.status !== 'Completed').length
  const urgentCount = workOrders.filter(
    (w) => w.priority.includes('Urgent') || w.priority.includes('High')
  ).length
  const completedCount = workOrders.filter((w) => w.status === 'Completed').length

  const handleApplyTemplate = (tmpl: (typeof REMEDIATION_TEMPLATES)[0]) => {
    setNewOrder((prev) => ({
      ...prev,
      title: tmpl.title,
      repairRecommendations: tmpl.spec,
      priority: tmpl.priority,
    }))
  }

  const handleSelectInspection = (inspId: string) => {
    setSelectedInspId(inspId)
    const insp = inspections.find((i) => i.id === inspId)
    if (insp) {
      setNewOrder((prev) => ({
        ...prev,
        assetId: insp.assetId,
        priority:
          insp.overallSeverity === 'Severe' || insp.overallSeverity === 'Critical'
            ? 'Urgent Engineering Review'
            : 'High Priority',
      }))
    }
  }

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.title) {
      alert('Please enter a work order title')
      return
    }
    const asset = assets.find((a) => a.id === newOrder.assetId) || assets[0]
    const payload = {
      ...newOrder,
      assetName: asset.name,
      inspectionId: selectedInspId,
      status: 'Assigned' as WorkOrderStatus,
    }
    try {
      const created = await MaintenanceService.create(payload)
      setWorkOrders([created, ...workOrders])
      alert(`✓ Maintenance work order ${created.id} issued and assigned!`)
    } catch {
      const fallbackOrder: MaintenanceWorkOrder = {
        ...payload,
        id: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setWorkOrders([fallbackOrder, ...workOrders])
    }
    setShowCreateModal(false)
  }

  const handleToggleStatus = async (id: string) => {
    const target = workOrders.find((w) => w.id === id)
    const nextStatus: WorkOrderStatus =
      target?.status === 'Assigned'
        ? 'In Progress'
        : target?.status === 'In Progress'
        ? 'Completed'
        : 'Assigned'

    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              status: nextStatus,
              completedAt: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : wo
      )
    )
    try {
      await MaintenanceService.updateStatus(id, nextStatus)
    } catch (e) {
      console.warn('Work order status notice:', e)
    }
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">REPAIR DISPOSITION & FIELD LOGISTICS</p>
          <h1>Maintenance & Work Orders</h1>
          <p>
            Track structural remediation workflows, epoxy grouting, reinforcement encasement, and repair sign-offs.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Exporting maintenance work orders to CSV format...')}
          >
            <Download /> Export Register
          </button>
          <button className="button primary" onClick={() => setShowCreateModal(true)}>
            <Plus /> Issue Work Order
          </button>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="stats-grid mt-4">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Wrench />
          </div>
          <div className="stat-copy">
            <p>Active Work Orders</p>
            <strong>{activeCount}</strong>
            <span className="neutral">Under active field remediation</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle />
          </div>
          <div className="stat-copy">
            <p>Urgent & High Priority</p>
            <strong>{urgentCount}</strong>
            <span className="text-red-600 text-[10px] font-semibold">Immediate intervention required</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <CheckCircle2 />
          </div>
          <div className="stat-copy">
            <p>Completed Remediations</p>
            <strong>{completedCount}</strong>
            <span className="positive">Certified engineering sign-off</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock />
          </div>
          <div className="stat-copy">
            <p>Remediation Turnaround</p>
            <strong>14.2 Days</strong>
            <span className="positive">Within 21-day target SLA</span>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="context-bar flex-wrap mt-5">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search work order, asset, inspection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="Urgent Engineering Review">Urgent Engineering Review</option>
          <option value="High Priority">High Priority</option>
          <option value="Medium Priority">Medium Priority</option>
          <option value="Routine Monitoring">Routine Monitoring</option>
        </select>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Assigned">Assigned</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Work Orders Table */}
      <div className="panel table-panel mt-4">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Remediation Task</th>
                <th>Target Asset & Inspection</th>
                <th>Priority</th>
                <th>Assigned Unit</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50">
                  <td>
                    <b className="font-mono text-slate-900">{wo.id}</b>
                    <small className="text-slate-400 font-mono block">Created {wo.createdAt}</small>
                  </td>
                  <td className="max-w-md">
                    <strong>{wo.title}</strong>
                    <small className="text-slate-500 truncate block max-w-sm">
                      {wo.repairRecommendations}
                    </small>
                  </td>
                  <td>
                    <strong>{wo.assetName}</strong>
                    <small className="font-mono text-blue-600 block">
                      Ref: {wo.inspectionId}
                    </small>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        wo.priority.includes('Urgent')
                          ? 'badge-red'
                          : wo.priority.includes('High')
                          ? 'badge-amber'
                          : 'badge-blue'
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td>
                    <span>{wo.assignedTeam}</span>
                    <small className="text-slate-400 block">{wo.assignedEngineer}</small>
                  </td>
                  <td>
                    <span className="font-mono text-slate-700">{wo.dueDate}</span>
                  </td>
                  <td>
                    <span
                      className={`status cursor-pointer ${
                        wo.status === 'Completed'
                          ? 'complete'
                          : wo.status === 'In Progress'
                          ? 'review'
                          : 'open'
                      }`}
                      onClick={() => handleToggleStatus(wo.id)}
                      title="Click to advance status"
                    >
                      <i />
                      {wo.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-xs text-blue-600 font-semibold hover:underline"
                      onClick={() => handleToggleStatus(wo.id)}
                    >
                      {wo.status === 'Completed'
                        ? 'Reopen Order'
                        : wo.status === 'In Progress'
                        ? 'Mark Completed'
                        : 'Start Work'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="modal-layer">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[680px] max-w-full max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Issue Maintenance Work Order</h2>
                <p className="text-xs text-slate-500">Dispatch field remediation crew for AI-detected defect</p>
              </div>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                ⚡ Quick ASCE Remediation Templates
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {REMEDIATION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="text-left text-[11px] p-2 rounded bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition"
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    <strong className="block text-slate-800 truncate">{tmpl.title}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{tmpl.priority}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="mt-4 space-y-4">
              <div className="form-group">
                <label>Remediation Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Epoxy Grout Injection & Spall Patching"
                  value={newOrder.title}
                  onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Associated Inspection Survey</label>
                  <select
                    className="form-select font-mono"
                    value={selectedInspId}
                    onChange={(e) => handleSelectInspection(e.target.value)}
                  >
                    {inspections.map((insp) => (
                      <option key={insp.id} value={insp.id}>
                        {insp.id} · {insp.date} ({insp.assetName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Asset *</label>
                  <select
                    className="form-select"
                    value={newOrder.assetId}
                    onChange={(e) => setNewOrder({ ...newOrder, assetId: e.target.value })}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-select"
                    value={newOrder.priority}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, priority: e.target.value as WorkOrderPriority })
                    }
                  >
                    <option value="Urgent Engineering Review">Urgent Engineering Review</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                    <option value="Routine Monitoring">Routine Monitoring</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Assigned Unit / Contractor</label>
                  <input
                    className="form-input"
                    value={newOrder.assignedTeam}
                    onChange={(e) => setNewOrder({ ...newOrder, assignedTeam: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Structural Engineer</label>
                  <input
                    className="form-input"
                    value={newOrder.assignedEngineer}
                    onChange={(e) => setNewOrder({ ...newOrder, assignedEngineer: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Repair Specifications & Engineering Instructions</label>
                <textarea
                  className="form-textarea h-24"
                  placeholder="Surface preparation, resin pressure rating, curing period..."
                  value={newOrder.repairRecommendations}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, repairRecommendations: e.target.value })
                  }
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
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
