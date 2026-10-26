'use client'

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { CalendarDays, Download, Filter, Gauge, Info } from 'lucide-react'

const defectTypesData = [
  { category: 'Cracks', count: 48 },
  { category: 'Concrete spalling', count: 24 },
  { category: 'Corrosion', count: 18 },
  { category: 'Exposed rebar', count: 12 },
  { category: 'Leakage/staining', count: 29 },
  { category: 'Potholes/erosion', count: 15 },
]

const damageByTypeData = [
  { type: 'Bridges', critical: 3, severe: 8, moderate: 14, minor: 22 },
  { type: 'Tunnels', critical: 1, severe: 4, moderate: 9, minor: 18 },
  { type: 'Dams', critical: 0, severe: 2, moderate: 6, minor: 11 },
  { type: 'Retaining Walls', critical: 1, severe: 3, moderate: 7, minor: 14 },
  { type: 'Buildings', critical: 0, severe: 1, moderate: 5, minor: 12 },
]

const materialDistribution = [
  { name: 'Reinforced Concrete', value: 52, color: '#2563eb' },
  { name: 'Prestressed Concrete', value: 28, color: '#0f9d92' },
  { name: 'Structural Steel', value: 12, color: '#f59e0b' },
  { name: 'Composite / Masonry', value: 8, color: '#8b5cf6' },
]

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('Last 12 Months')

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">ENTERPRISE DAMAGE INTELLIGENCE</p>
          <h1>Damage & Integrity Analytics</h1>
          <p>
            Macro-level statistical breakdowns of defect frequency, material performance, and structural risk trends.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => alert('Exporting comprehensive analytics packet to CSV & JSON...')}
          >
            <Download /> Export Analytics Packet
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="context-bar">
        <div className="range">
          <CalendarDays />
          <span>{timeRange}</span>
        </div>
        <span className="sample-note">
          <Info className="w-3.5 h-3.5" /> Aggregated statistical models from 1,284 completed inspections
        </span>
      </div>

      {/* KPI Highlights */}
      <section className="stats-grid mt-4">
        <div className="stat-card">
          <div className="stat-copy">
            <p>Annual Detected Defects</p>
            <strong>248</strong>
            <span className="positive">-6.2% vs prior annual cycle</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-copy">
            <p>Average Remediation Turnaround</p>
            <strong>18.4 Days</strong>
            <span className="positive">Within 21-day target SLA</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-copy">
            <p>Primary Defect Vector</p>
            <strong>Shear Cracking</strong>
            <span className="neutral">42% of bridge substructure items</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-copy">
            <p>Critical Backlog</p>
            <strong>1 Asset</strong>
            <span className="text-red-600 font-semibold text-[10px]">Overpass Pier Cap</span>
          </div>
        </div>
      </section>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Defect Categories Frequency */}
        <div className="panel">
          <div className="panel-head mb-4">
            <div>
              <h2>Defect Frequency by Damage Classification</h2>
              <p>Total recorded defect occurrences across all inspected structures</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectTypesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid vertical={false} stroke="#e8eef5" />
                <XAxis dataKey="category" tick={{ fill: '#8a9ab1', fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#8a9ab1', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #dce5ef' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Damage by Infrastructure Type Stacked */}
        <div className="panel">
          <div className="panel-head mb-4">
            <div>
              <h2>Damage Severity by Structure Classification</h2>
              <p>Distribution of severity tiers across civil infrastructure types</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damageByTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e8eef5" />
                <XAxis dataKey="type" tick={{ fill: '#8a9ab1', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8a9ab1', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #dce5ef' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="severe" stackId="a" fill="#f97316" name="Severe" />
                <Bar dataKey="moderate" stackId="a" fill="#f59e0b" name="Moderate" />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Distribution */}
        <div className="panel">
          <div className="panel-head mb-2">
            <div>
              <h2>Defect Distribution by Material System</h2>
              <p>Percentage of structural defects partitioned by construction material</p>
            </div>
          </div>
          <div className="flex items-center justify-around h-56">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={materialDistribution} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={4}>
                    {materialDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #dce5ef', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              {materialDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                  <b className="font-mono text-slate-800 ml-auto">{item.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Structural Health Index Trajectory */}
        <div className="panel">
          <div className="panel-head mb-4">
            <div>
              <h2>Mean Asset Health Index (Quarterly)</h2>
              <p>Portfolio-wide health scoring (100 = As-Built New, 0 = Condemned)</p>
            </div>
          </div>
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Bridges Portfolio Score: 78.4 / 100</p>
                <p className="text-slate-500">6 Structures requiring periodic crack dilation gauging</p>
              </div>
              <span className="badge badge-teal">Acceptable</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Tunnels Portfolio Score: 86.2 / 100</p>
                <p className="text-slate-500">Waterproofing membrane integrity verified stable</p>
              </div>
              <span className="badge badge-teal">Good</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Dams & Spillways Score: 81.0 / 100</p>
                <p className="text-slate-500">Monsoon season post-discharge inspection completed</p>
              </div>
              <span className="badge badge-teal">Acceptable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
