'use client'

import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  CheckCircle2,
  Cloud,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DEMO_ASSETS, DEMO_INSPECTIONS } from '@/lib/api/mock-data'
import { Inspection } from '@/types'

const activityData = [
  { month: 'Jan', inspections: 18 },
  { month: 'Feb', inspections: 24 },
  { month: 'Mar', inspections: 21 },
  { month: 'Apr', inspections: 32 },
  { month: 'May', inspections: 28 },
  { month: 'Jun', inspections: 38 },
  { month: 'Jul', inspections: 34 },
  { month: 'Aug', inspections: 46 },
  { month: 'Sep', inspections: 42 },
]

interface DashboardViewProps {
  onNavigate: (tab: any, params?: any) => void
  onOpenNewInspection: () => void
}

export function DashboardView({ onNavigate, onOpenNewInspection }: DashboardViewProps) {
  const [search, setSearch] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL')

  const filtered = DEMO_INSPECTIONS.filter((item) => {
    const matchesSearch = `${item.id} ${item.assetName} ${item.assetType}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesSeverity =
      selectedSeverity === 'ALL' || item.overallSeverity.toUpperCase() === selectedSeverity
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="page-wrap">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">OPERATIONAL OVERVIEW · REAL-TIME INFRASTRUCTURE STATUS</p>
          <h1>Infrastructure Overview</h1>
          <p>Continuous AI-assisted crack & damage monitoring across civil infrastructure assets.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Summary exported to CSV format (Demo Mode).')}
          >
            <Download /> Export summary
          </button>
          <button className="button primary" onClick={onOpenNewInspection}>
            <Plus /> New inspection
          </button>
        </div>
      </section>

      {/* Context & Demo Warning Bar */}
      <div className="context-bar">
        <div className="range">
          <CalendarDays />
          <span>Last 30 days: Q3 Operational Cycle</span>
        </div>
        <span className="sample-note">
          <Cloud /> Demonstration Data (Local Sandbox Mode)
        </span>
      </div>

      {/* Stat KPI Cards */}
      <section className="stats-grid">
        <div
          className="stat-card cursor-pointer hover:border-blue-400 transition"
          onClick={() => onNavigate('Assets')}
        >
          <div className="stat-icon">
            <Building2 />
          </div>
          <div className="stat-copy">
            <p>Infrastructure assets</p>
            <strong>{DEMO_ASSETS.length}</strong>
            <span className="positive">6 Active Critical Assets</span>
          </div>
        </div>

        <div
          className="stat-card cursor-pointer hover:border-teal-400 transition"
          onClick={() => onNavigate('All Inspections')}
        >
          <div className="stat-icon teal">
            <ClipboardCheck />
          </div>
          <div className="stat-copy">
            <p>Total inspections</p>
            <strong>{DEMO_INSPECTIONS.length}</strong>
            <span className="positive">+18% vs prior month</span>
          </div>
        </div>

        <div
          className="stat-card cursor-pointer hover:border-amber-400 transition"
          onClick={() => onNavigate('Analysis Results')}
        >
          <div className="stat-icon amber">
            <Clock3 />
          </div>
          <div className="stat-copy">
            <p>Pending engineer review</p>
            <strong>2</strong>
            <span className="neutral">Action required</span>
          </div>
        </div>

        <div
          className="stat-card cursor-pointer hover:border-red-400 transition"
          onClick={() => onNavigate('Maintenance & Work Orders')}
        >
          <div className="stat-icon red">
            <AlertTriangle />
          </div>
          <div className="stat-copy">
            <p>High-priority findings</p>
            <strong>7</strong>
            <span className="text-red-500 text-[9px] font-semibold">1 Critical Pier Spall</span>
          </div>
        </div>
      </section>

      {/* Analytics & Severity Breakdown */}
      <section className="dashboard-grid">
        <div className="panel activity-panel">
          <div className="panel-head">
            <div>
              <h2>Inspection activity</h2>
              <p>Completed structural image inspections over time</p>
            </div>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => onNavigate('Damage Analytics')}
            >
              Full Analytics →
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-blue" /> Monthly Inspections
            </span>
            <span className="trend">
              <ArrowUpRight /> +14.2% cadence
            </span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e8eef5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a9ab1', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a9ab1', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    border: '1px solid #dce5ef',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px #172b4d18',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inspections"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#fillBlue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel severity-panel">
          <div className="panel-head">
            <div>
              <h2>Damage severity</h2>
              <p>Distribution of detected defects</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <div>
                <strong>14</strong>
                <small>Total Defects</small>
              </div>
            </div>
            <div className="severity-list">
              <div>
                <i className="dot critical" />
                <span>Critical</span>
                <b>1</b>
              </div>
              <div>
                <i className="dot severe" />
                <span>Severe</span>
                <b>3</b>
              </div>
              <div>
                <i className="dot moderate" />
                <span>Moderate</span>
                <b>4</b>
              </div>
              <div>
                <i className="dot minor" />
                <span>Minor</span>
                <b>6</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Section: Recent Inspections Table + Action Queue */}
      <section className="lower-grid">
        <div className="panel table-panel">
          <div className="panel-head table-head">
            <div>
              <h2>Recent inspections</h2>
              <p>Latest structural surveys and AI-assisted defect reports</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('All Inspections')}>
              View all <ArrowUpRight />
            </button>
          </div>

          <div className="table-tools">
            <label className="table-search">
              <Search />
              <input
                placeholder="Search by ID or asset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="flex gap-1">
              {['ALL', 'CRITICAL', 'SEVERE', 'MODERATE', 'MINOR'].map((sev) => (
                <button
                  key={sev}
                  className={`text-[10px] px-2 py-1 rounded border ${
                    selectedSeverity === sev
                      ? 'bg-blue-50 border-blue-300 text-blue-600 font-bold'
                      : 'border-slate-200 text-slate-500'
                  }`}
                  onClick={() => setSelectedSeverity(sev)}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Inspection</th>
                  <th>Asset</th>
                  <th>Date</th>
                  <th>Findings</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td>
                      <b>{item.id}</b>
                      <small>{item.inspectionType} Survey</small>
                    </td>
                    <td>
                      <strong>{item.assetName}</strong>
                      <small>{item.assetType}</small>
                    </td>
                    <td>{item.date}</td>
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
                        className="text-xs text-blue-600 hover:underline font-semibold"
                        onClick={() => onNavigate('Analysis Results', { inspectionId: item.id })}
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Stack */}
        <div className="side-stack">
          <div className="panel attention-panel">
            <div className="panel-head">
              <div>
                <h2>Needs attention</h2>
                <p>Prioritized engineering review queue</p>
              </div>
            </div>

            <div
              className="attention-item cursor-pointer hover:bg-slate-50 p-2 rounded"
              onClick={() =>
                onNavigate('Analysis Results', { inspectionId: 'INSP-2024-0246' })
              }
            >
              <div className="attention-icon red">
                <AlertTriangle />
              </div>
              <div>
                <strong>Eastside Highway Overpass</strong>
                <p>7 findings · Severe concrete spalling & exposed rebar</p>
              </div>
              <ArrowUpRight />
            </div>

            <div
              className="attention-item cursor-pointer hover:bg-slate-50 p-2 rounded"
              onClick={() =>
                onNavigate('Analysis Results', { inspectionId: 'INSP-2024-0248' })
              }
            >
              <div className="attention-icon amber">
                <Clock3 />
              </div>
              <div>
                <strong>North River Bridge</strong>
                <p>Pending engineer review · 4 crack findings</p>
              </div>
              <ArrowUpRight />
            </div>

            <button
              className="outline-button"
              onClick={() => onNavigate('Maintenance & Work Orders')}
            >
              Open work orders queue
            </button>
          </div>

          <div className="panel schedule-panel">
            <div className="panel-head">
              <div>
                <h2>Upcoming inspections</h2>
                <p>Scheduled monitoring calendar</p>
              </div>
              <CalendarDays />
            </div>

            <div className="schedule-row">
              <div className="date-box">
                <b>26</b>
                <small>OCT</small>
              </div>
              <div>
                <strong>Westside Retaining Wall</strong>
                <p>Routine settlement survey · 09:30 AM</p>
              </div>
              <span className="mini-avatar">MV</span>
            </div>

            <div className="schedule-row">
              <div className="date-box">
                <b>28</b>
                <small>OCT</small>
              </div>
              <div>
                <strong>Highland Reservoir Dam</strong>
                <p>Spillway crest acoustic inspection · 02:00 PM</p>
              </div>
              <span className="mini-avatar teal-avatar">ER</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
