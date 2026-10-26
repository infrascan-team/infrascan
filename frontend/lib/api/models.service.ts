import { ModelVersion } from '@/types'
import { DEMO_MODELS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

export const ModelsService = {
  async getAll(): Promise<ModelVersion[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...DEMO_MODELS])
    }
    const res = await apiFetch<ModelVersion[]>('/api/v1/models')
    return res.data
  },
}
