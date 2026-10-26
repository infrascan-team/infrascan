import { Inspection, InspectionStatus } from '@/types'
import { DEMO_INSPECTIONS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localInspections: Inspection[] = [...DEMO_INSPECTIONS]

export const InspectionsService = {
  async getAll(): Promise<Inspection[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...localInspections])
    }
    const res = await apiFetch<Inspection[]>('/api/v1/inspections')
    return res.data
  },

  async getById(id: string): Promise<Inspection | null> {
    if (IS_DEMO_MODE) {
      const item = localInspections.find((i) => i.id === id) || null
      return Promise.resolve(item)
    }
    const res = await apiFetch<Inspection>(`/api/v1/inspections/${id}`)
    return res.data
  },

  async create(data: Partial<Inspection>): Promise<Inspection> {
    const newInsp: Inspection = {
      id: `INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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

    if (IS_DEMO_MODE) {
      localInspections = [newInsp, ...localInspections]
      return Promise.resolve(newInsp)
    }
    const res = await apiFetch<Inspection>('/api/v1/inspections', {
      method: 'POST',
      body: JSON.stringify(newInsp),
    })
    return res.data
  },

  async updateReview(
    id: string,
    reviewStatus: 'Approved' | 'Requires Reinspection',
    comments: string,
    reviewer: string
  ): Promise<Inspection> {
    if (IS_DEMO_MODE) {
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
      return Promise.resolve(localInspections.find((i) => i.id === id)!)
    }
    const res = await apiFetch<Inspection>(`/api/v1/inspections/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ reviewStatus, comments, reviewer }),
    })
    return res.data
  },
}
