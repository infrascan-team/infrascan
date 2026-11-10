import { InspectionReport } from '@/types'
import { DEMO_REPORTS } from './mock-data'
import { apiFetch } from './client'

let localReports: InspectionReport[] = [...DEMO_REPORTS]

export const ReportsService = {
  async getAll(): Promise<InspectionReport[]> {
    try {
      const res = await apiFetch<InspectionReport[]>('/api/v1/reports')
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data
      }
      return [...localReports]
    } catch {
      return [...localReports]
    }
  },

  async getById(id: string): Promise<InspectionReport | null> {
    try {
      const res = await apiFetch<InspectionReport>(`/api/v1/reports/${id}`)
      return res.data
    } catch {
      return localReports.find((r) => r.id === id) || null
    }
  },

  async generate(data: Omit<InspectionReport, 'id' | 'generatedAt'>): Promise<InspectionReport> {
    const newReport: InspectionReport = {
      ...data,
      id: `RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: new Date().toISOString(),
    }
    try {
      const res = await apiFetch<InspectionReport>('/api/v1/reports/generate', {
        method: 'POST',
        body: JSON.stringify(newReport),
      })
      localReports = [res.data, ...localReports]
      return res.data
    } catch {
      localReports = [newReport, ...localReports]
      return newReport
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/v1/reports/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Report delete error:', err)
    }
    localReports = localReports.filter((r) => r.id !== id)
  },
}
