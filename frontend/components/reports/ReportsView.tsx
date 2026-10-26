'use client'

import React, { useState } from 'react'
import {
  Download,
  FileCheck,
  FileText,
  Printer,
  Search,
  X,
  Building2,
  Calendar,
  ShieldAlert,
  Ruler,
} from 'lucide-react'
import { DEMO_REPORTS } from '@/lib/api/mock-data'
import { InspectionReport } from '@/types'

export function ReportsView() {
  const [reports, setReports] = useState<InspectionReport[]>(DEMO_REPORTS)
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null)

  const filtered = reports.filter((r) =>
    `${r.id} ${r.assetName} ${r.inspectionId}`.toLowerCase().includes(search.toLowerCase())
  )

  const handlePrint = () => {
    window.print()
  }

  const handleExport = (format: 'PDF' | 'CSV' | 'JSON') => {
    alert(`Generating ${format} document bundle for report ${selectedReport?.id || ''}... Download starting.`)
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">FORMAL AUDIT DOCUMENTATION</p>
          <h1>Inspection & Structural Reports</h1>
          <p>
            Official engineering documentation packages compiling AI defect assessments, high-res imagery, and signed engineering reviews.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="context-bar">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search report ID or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="panel table-panel mt-4">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Target Asset</th>
                <th>Inspection Reference</th>
                <th>Generated On</th>
                <th>Engineer Author</th>
                <th>Overall Severity</th>
                <th>Export Formats</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td>
                    <b>{report.id}</b>
                  </td>
                  <td>
                    <strong>{report.assetName}</strong>
                    <small>{report.assetType}</small>
                  </td>
                  <td>
                    <span className="font-mono text-slate-500">{report.inspectionId}</span>
                  </td>
                  <td>{new Date(report.generatedAt).toLocaleDateString()}</td>
                  <td>{report.generatedBy}</td>
                  <td>
                    <span
                      className={`badge ${
                        report.severity === 'Severe'
                          ? 'badge-red'
                          : report.severity === 'Moderate'
                          ? 'badge-amber'
                          : 'badge-teal'
                      }`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {report.fileFormatsAvailable.map((fmt) => (
                        <span key={fmt} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="button primary text-xs py-1 px-3"
                      onClick={() => setSelectedReport(report)}
                    >
                      Preview & Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-Friendly Report Preview Modal */}
      {selectedReport && (
        <div className="modal-layer">
          <div className="bg-white rounded-xl p-8 shadow-2xl w-[880px] max-w-full max-h-[92vh] overflow-y-auto">
            {/* Modal Controls Toolbar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6 print:hidden">
              <span className="text-xs text-slate-400 font-mono">
                Official Report Document · {selectedReport.id}
              </span>
              <div className="flex items-center gap-2">
                <button className="button secondary text-xs" onClick={handlePrint}>
                  <Printer className="w-3.5 h-3.5" /> Print Layout
                </button>
                <button
                  className="button secondary text-xs"
                  onClick={() => handleExport('PDF')}
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  className="button secondary text-xs"
                  onClick={() => handleExport('CSV')}
                >
                  CSV
                </button>
                <button
                  className="button secondary text-xs"
                  onClick={() => handleExport('JSON')}
                >
                  JSON
                </button>
                <button
                  className="text-slate-400 hover:text-slate-700 ml-2"
                  onClick={() => setSelectedReport(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Header */}
            <div className="space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      IS
                    </div>
                    <span className="font-bold text-slate-900 text-sm">INFRASCAN INTELLIGENCE</span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-950">
                    Structural Condition & AI Defect Assessment Report
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Prepared for: State Department of Transportation & Civil Infrastructure Directorate
                  </p>
                </div>
                <div className="text-right">
                  <span className="badge badge-blue font-mono">{selectedReport.id}</span>
                  <p className="text-slate-400 text-[10px] mt-2">
                    Date: {new Date(selectedReport.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Asset and Survey Overview */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    STRUCTURE UNDER AUDIT
                  </span>
                  <p className="font-bold text-sm text-slate-900">{selectedReport.assetName}</p>
                  <p className="text-slate-600">Asset Code: {selectedReport.assetId}</p>
                  <p className="text-slate-600">Type: {selectedReport.assetType}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    INSPECTION METADATA
                  </span>
                  <p className="text-slate-600">Survey ID: {selectedReport.inspectionId}</p>
                  <p className="text-slate-600">Certifying Engineer: {selectedReport.generatedBy}</p>
                  <p className="text-slate-600">AI Model Version: {selectedReport.modelVersion}</p>
                </div>
              </div>

              {/* Severity Assessment Summary */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">
                  Executive Defect Summary
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-[10px] text-red-600 font-bold block uppercase">
                      Critical Spall
                    </span>
                    <strong className="text-lg text-red-700">
                      {selectedReport.findingsSummary.critical}
                    </strong>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-[10px] text-amber-600 font-bold block uppercase">
                      Severe Fissures
                    </span>
                    <strong className="text-lg text-amber-700">
                      {selectedReport.findingsSummary.severe}
                    </strong>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-[10px] text-blue-600 font-bold block uppercase">
                      Moderate Items
                    </span>
                    <strong className="text-lg text-blue-700">
                      {selectedReport.findingsSummary.moderate}
                    </strong>
                  </div>
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <span className="text-[10px] text-teal-600 font-bold block uppercase">
                      Minor Surface
                    </span>
                    <strong className="text-lg text-teal-700">
                      {selectedReport.findingsSummary.minor}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Certified Recommendations */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Engineering Recommendations & Corrective Actions
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {selectedReport.recommendations}
                </p>
              </div>

              {/* Sign-Off Block */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">
                    DIGITAL SIGNATURE & SEAL
                  </p>
                  <p className="font-serif italic text-sm text-slate-800 mt-1">
                    {selectedReport.generatedBy}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Licensed Professional Civil Engineer
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  Generated by InfraScan Autonomous Inspection System
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
