'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { DEMO_ASSETS, DEMO_WORK_ORDERS } from '@/lib/api/mock-data'
import { MaintenanceWorkOrder, WorkOrderPriority, WorkOrderStatus } from '@/types'

export function MaintenanceView() {
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(DEMO_WORK_ORDERS)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Work Order State
  const [newOrder, setNewOrder] = useState({
    title: '',
    assetId: DEMO_ASSETS[0].id,
    priority: 'High Priority' as WorkOrderPriority,
    assignedTeam: 'Specialized Concrete Rehabilitation Unit',
    assignedEngineer: 'Sarah Lin',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    repairRecommendations: '',
    followUpInspectionRequired: true,
  })

  const filtered = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter
    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.title) {
      alert('Please enter a work order title')
      return
    }
    const asset = DEMO_ASSETS.find((a) => a.id === newOrder.assetId) || DEMO_ASSETS[0]
    const created: MaintenanceWorkOrder = {
      ...newOrder,
      id: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      assetName: asset.name,
      inspectionId: 'INSP-2024-0248',
      status: 'Assigned',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setWorkOrders([created, ...workOrders])
    setShowCreateModal(false)
  }

  const handleToggleStatus = (id: string) => {
    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              status: wo.status === 'Completed' ? 'In Progress' : 'Completed',
              completedAt: wo.status === 'Completed' ? undefined : new Date().toISOString().split('T')[0],
            }
          : wo
      )
    )
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
            onClick={() => alert('Exporting work orders to CSV...')}
          >
            <Download /> Export Register
          </button>
          <button className="button primary" onClick={() => setShowCreateModal(true)}>
            <Plus /> Issue Work Order
          </button>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="context-bar flex-wrap">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search work order or asset..."
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
                <th>Target Asset</th>
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
                    <b>{wo.id}</b>
                    <small className="text-slate-400 font-mono">Created {wo.createdAt}</small>
                  </td>
                  <td>
                    <strong>{wo.title}</strong>
                    <small className="text-slate-500 truncate max-w-xs block">
                      {wo.repairRecommendations}
                    </small>
                  </td>
                  <td>
                    <strong>{wo.assetName}</strong>
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
                    <small>{wo.assignedEngineer}</small>
                  </td>
                  <td>{wo.dueDate}</td>
                  <td>
                    <span
                      className={`status ${
                        wo.status === 'Completed' ? 'complete' : 'review'
                      }`}
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
                      {wo.status === 'Completed' ? 'Reopen Order' : 'Mark Completed'}
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
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[600px] max-w-full">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Issue Maintenance Work Order</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
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
                  <label>Target Asset *</label>
                  <select
                    className="form-select"
                    value={newOrder.assetId}
                    onChange={(e) => setNewOrder({ ...newOrder, assetId: e.target.value })}
                  >
                    {DEMO_ASSETS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Repair Specifications & Engineering Instructions</label>
                <textarea
                  className="form-textarea"
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
                  Issue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
