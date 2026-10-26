import { NotificationItem } from '@/types'
import { DEMO_NOTIFICATIONS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localNotifications: NotificationItem[] = [...DEMO_NOTIFICATIONS]

export const NotificationsService = {
  async getAll(): Promise<NotificationItem[]> {
    if (IS_DEMO_MODE) {
      return Promise.resolve([...localNotifications])
    }
    const res = await apiFetch<NotificationItem[]>('/api/v1/notifications')
    return res.data
  },

  async markAsRead(id: string): Promise<void> {
    if (IS_DEMO_MODE) {
      localNotifications = localNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      return Promise.resolve()
    }
    await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'POST' })
  },

  async markAllAsRead(): Promise<void> {
    if (IS_DEMO_MODE) {
      localNotifications = localNotifications.map((n) => ({ ...n, isRead: true }))
      return Promise.resolve()
    }
    await apiFetch('/api/v1/notifications/read-all', { method: 'POST' })
  },
}
