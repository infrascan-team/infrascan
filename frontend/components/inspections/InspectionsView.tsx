'use client'

import React, { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus,
  Search,
  Eye,
  AlertTriangle,
  Layers,
  FileCheck,
} from 'lucide-react'
import { DEMO_INSPECTIONS } from '@/lib/api/mock-data'
import { Inspection, InspectionStatus, DamageSeverity } from '@/types'

interface InspectionsViewProps {
  onNavigate: (tab: any, params?: any) => void
  onOpenNewInspection: () => void
}

export function InspectionsView({ onNavigate, onOpenNewInspection }: InspectionsViewProps) {
  const [inspections, setInspections] = useState<Inspection[]>(DEMO_INSPECTIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')

  const filtered = inspections.filter((insp) => {
    const matchesSearch =
      insp.id.toLowerCase().includes(search.toLowerCase()) ||
      insp.assetName.toLowerCase().includes(search.toLowerCase()) ||
      insp.inspectorName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter
    const matchesSeverity = severityFilter === 'ALL' || insp.overallSeverity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">STRUCTURAL AUDIT ARCHIVE</p>
          <h1>Inspections & Surveys</h1>
          <p>Complete register of field evaluations, AI defect detections, and qualified engineer reviews.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Exporting inspections list to CSV (Demo)...')}
          >
            <Download /> Export Register
          </button>
          <button className="button primary" onClick={onOpenNewInspection}>
            <Plus /> New Inspection
          </button>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="context-bar flex-wrap">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search inspection, asset, inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Inspection Statuses</option>
          <option value="Pending Engineer Review">Pending Engineer Review</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          className="form-select text-xs py-1.5 px-3 bg-white"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="Critical">Critical Damage</option>
          <option value="Severe">Severe Damage</option>
          <option value="Moderate">Moderate Damage</option>
          <option value="Minor">Minor Damage</option>
          <option value="None">No Damage</option>
        </select>
      </div>

      {/* Inspections Table */}
      <div className="panel table-panel mt-4">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Target Asset</th>
                <th>Survey Type</th>
                <th>Inspection Date</th>
                <th>Assigned Inspector</th>
                <th>Defects Detected</th>
                <th>Overall Severity</th>
                <th>Workflow Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td>
                    <b>{item.id}</b>
                    <small className="text-slate-400 font-mono">
                      {item.reportGenerated ? 'Report Ready' : 'In Review'}
                    </small>
                  </td>
                  <td>
                    <strong>{item.assetName}</strong>
                    <small>{item.assetType}</small>
                  </td>
                  <td>{item.inspectionType} Survey</td>
                  <td>{item.date}</td>
                  <td>
                    <strong>{item.inspectorName}</strong>
                    <small>{item.inspectorRole}</small>
                  </td>
                  <td>
                    <span className="finding-count">{item.findingsCount}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.overallSeverity === 'Severe'
                          ? 'badge-red'
                          : item.overallSeverity === 'Moderate'
                          ? 'badge-amber'
                          : 'badge-teal'
                      }`}
                    >
                      {item.overallSeverity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        item.status === 'Completed' ? 'complete' : 'review'
                      }`}
                    >
                      <i />
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="button primary text-xs py-1 px-3 flex items-center gap-1"
                      onClick={() =>
                        onNavigate('Analysis Results', { inspectionId: item.id })
                      }
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
