import api from './axiosInstance'

export const notificationsApi = {
  list:        (params) => api.get('/notifications', { params }).then(r => r.data.data),
  unreadCount: ()       => api.get('/notifications/unread-count').then(r => r.data.data.count),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`).then(r => r.data.data),
  markAllRead: ()       => api.patch('/notifications/read-all').then(r => r.data),
}
