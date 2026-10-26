import { MaintenanceWorkOrder } from '@/types'
import { DEMO_WORK_ORDERS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localOrders: MaintenanceWorkOrder[] = [...DEMO_WORK_ORDERS]

export const MaintenanceService = {
  async getAll(): Promise<MaintenanceWorkOrder[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...localOrders])
    }
    const res = await apiFetch<MaintenanceWorkOrder[]>('/api/v1/work-orders')
    return res.data
  },

  async create(order: Omit<MaintenanceWorkOrder, 'id' | 'createdAt'>): Promise<MaintenanceWorkOrder> {
    const newOrder: MaintenanceWorkOrder = {
      ...order,
      id: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    if (IS_DEMO_MODE) {
      localOrders = [newOrder, ...localOrders]
      return Promise.resolve(newOrder)
    }
    const res = await apiFetch<MaintenanceWorkOrder>('/api/v1/work-orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    })
    return res.data
  },

  async updateStatus(id: string, status: MaintenanceWorkOrder['status'], notes?: string): Promise<MaintenanceWorkOrder> {
    if (IS_DEMO_MODE) {
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
      return Promise.resolve(localOrders.find((o) => o.id === id)!)
    }
    const res = await apiFetch<MaintenanceWorkOrder>(`/api/v1/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
    return res.data
  },
}
