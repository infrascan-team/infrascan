import { Inspection, InspectionStatus } from '@/types'
import { DEMO_INSPECTIONS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localInspections: Inspection[] = [...DEMO_INSPECTIONS]

export const InspectionsService = {
  async getAll(): Promise<Inspection[]> {
    try {
      const res = await apiFetch<Inspection[]>('/api/v1/inspections')
      return res.data
    } catch {
      return [...localInspections]
    }
  },

  async getById(id: string): Promise<Inspection | null> {
    try {
      const res = await apiFetch<Inspection>(`/api/v1/inspections/${id}`)
      return res.data
    } catch {
      const item = localInspections.find((i) => i.id === id) || null
      return item
    }
  },

  async create(data: Partial<Inspection>): Promise<Inspection> {
    const newInsp: Inspection = {
      id: data.id || `INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId: data.assetId || '',
      assetName: data.assetName || 'Unspecified Asset',
      assetType: data.assetType || 'Bridge',
      title: data.title || 'Civil Structural Inspection',
      inspectionType: data.inspectionType || 'Routine',
      inspectorId: data.inspectorId || 'USR-001',
      inspectorName: data.inspectorName || 'Jordan Smith, PE',
      inspectorRole: data.inspectorRole || 'Lead Inspector',
      date: data.date || new Date().toISOString().split('T')[0],
      status: (data.status as InspectionStatus) || 'Processing',
      overallSeverity: data.overallSeverity || 'None',
      priority: data.priority || 'Medium',
      gpsCoordinates: data.gpsCoordinates,
      images: data.images || [],
      findingsCount: data.findingsCount || 0,
      engineerReviewStatus: 'Pending',
      reportGenerated: false,
      preprocessingStage: 'Completed',
    }

    try {
      const res = await apiFetch<Inspection>('/api/v1/inspections', {
        method: 'POST',
        body: JSON.stringify(newInsp),
      })
      localInspections = [res.data, ...localInspections]
      return res.data
    } catch {
      localInspections = [newInsp, ...localInspections]
      return newInsp
    }
  },

  async analyzeImage(inspectionId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiFetch<any>(`/api/v1/inspections/${inspectionId}/analyze`, {
      method: 'POST',
      body: formData,
    })
    return res.data
  },

  async preprocessImage(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiFetch<any>('/api/v1/inspections/preprocess', {
      method: 'POST',
      body: formData,
    })
    return res.data
  },

  async updateReview(
    id: string,
    reviewStatus: 'Approved' | 'Requires Reinspection',
    comments: string,
    reviewer: string
  ): Promise<Inspection> {
    try {
      const res = await apiFetch<Inspection>(`/api/v1/inspections/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ reviewStatus, comments, reviewer }),
      })
      return res.data
    } catch {
      localInspections = localInspections.map((i) =>
        i.id === id
          ? {
              ...i,
              engineerReviewStatus: reviewStatus,
              engineerComments: comments,
              reviewedBy: reviewer,
              reviewedAt: new Date().toISOString(),
              status: reviewStatus === 'Approved' ? 'Completed' : 'Pending Engineer Review',
            }
          : i
      )
      return localInspections.find((i) => i.id === id)!
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/v1/inspections/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Delete inspection failed on backend:', err)
    }
    localInspections = localInspections.filter((i) => i.id !== id)
  },
}
