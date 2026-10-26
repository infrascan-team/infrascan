import { InfrastructureAsset } from '@/types'
import { DEMO_ASSETS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localAssets: InfrastructureAsset[] = [...DEMO_ASSETS]

export const AssetsService = {
  async getAll(): Promise<InfrastructureAsset[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...localAssets])
    }
    const res = await apiFetch<InfrastructureAsset[]>('/api/v1/assets')
    return res.data
  },

  async getById(id: string): Promise<InfrastructureAsset | null> {
    if (IS_DEMO_MODE) {
      const asset = localAssets.find((a) => a.id === id) || null
      return Promise.resolve(asset)
    }
    const res = await apiFetch<InfrastructureAsset>(`/api/v1/assets/${id}`)
    return res.data
  },

  async create(asset: Omit<InfrastructureAsset, 'id' | 'openFindingsCount' | 'maintenanceHistoryCount'>): Promise<InfrastructureAsset> {
    const newAsset: InfrastructureAsset = {
      ...asset,
      id: `AST-${asset.type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      openFindingsCount: 0,
      maintenanceHistoryCount: 0,
    }
    if (IS_DEMO_MODE) {
      localAssets = [newAsset, ...localAssets]
      return Promise.resolve(newAsset)
    }
    const res = await apiFetch<InfrastructureAsset>('/api/v1/assets', {
      method: 'POST',
      body: JSON.stringify(newAsset),
    })
    return res.data
  },

  async update(id: string, updates: Partial<InfrastructureAsset>): Promise<InfrastructureAsset> {
    if (IS_DEMO_MODE) {
      localAssets = localAssets.map((a) => (a.id === id ? { ...a, ...updates } : a))
      const updated = localAssets.find((a) => a.id === id)!
      return Promise.resolve(updated)
    }
    const res = await apiFetch<InfrastructureAsset>(`/api/v1/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return res.data
  },
}
