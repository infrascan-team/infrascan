import { InspectionReport } from '@/types'
import { DEMO_REPORTS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localReports: InspectionReport[] = [...DEMO_REPORTS]

export const ReportsService = {
  async getAll(): Promise<InspectionReport[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...localReports])
    }
    const res = await apiFetch<InspectionReport[]>('/api/v1/reports')
    return res.data
  },

  async getById(id: string): Promise<InspectionReport | null> {
    if (IS_DEMO_MODE) {
      const report = localReports.find((r) => r.id === id) || null
      return Promise.resolve(report)
    }
    const res = await apiFetch<InspectionReport>(`/api/v1/reports/${id}`)
    return res.data
  },

  async generate(data: Omit<InspectionReport, 'id' | 'generatedAt'>): Promise<InspectionReport> {
    const newReport: InspectionReport = {
      ...data,
      id: `RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: new Date().toISOString(),
    }
    if (IS_DEMO_MODE) {
      localReports = [newReport, ...localReports]
      return Promise.resolve(newReport)
    }
    const res = await apiFetch<InspectionReport>('/api/v1/reports/generate', {
      method: 'POST',
      body: JSON.stringify(newReport),
    })
    return res.data
  },
}
