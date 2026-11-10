import { MaintenanceWorkOrder } from '@/types'
import { DEMO_WORK_ORDERS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localOrders: MaintenanceWorkOrder[] = [...DEMO_WORK_ORDERS]

export const MaintenanceService = {
  async getAll(): Promise<MaintenanceWorkOrder[]> {
    try {
      const res = await apiFetch<MaintenanceWorkOrder[]>('/api/v1/work-orders')
      return res.data
    } catch {
      return [...localOrders]
    }
  },

  async create(order: Omit<MaintenanceWorkOrder, 'id' | 'createdAt'>): Promise<MaintenanceWorkOrder> {
    const newOrder: MaintenanceWorkOrder = {
      ...order,
      id: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    try {
      const res = await apiFetch<MaintenanceWorkOrder>('/api/v1/work-orders', {
        method: 'POST',
        body: JSON.stringify(newOrder),
      })
      localOrders = [res.data, ...localOrders]
      return res.data
    } catch {
      localOrders = [newOrder, ...localOrders]
      return newOrder
    }
  },

  async updateStatus(id: string, status: MaintenanceWorkOrder['status'], notes?: string): Promise<MaintenanceWorkOrder> {
    try {
      const res = await apiFetch<MaintenanceWorkOrder>(`/api/v1/work-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      })
      return res.data
    } catch {
      localOrders = localOrders.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              completionNotes: notes || o.completionNotes,
              completedAt: status === 'Completed' ? new Date().toISOString().split('T')[0] : o.completedAt,
            }
          : o
      )
      return localOrders.find((o) => o.id === id)!
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/v1/work-orders/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Work order delete error:', err)
    }
    localOrders = localOrders.filter((o) => o.id !== id)
  },
}
