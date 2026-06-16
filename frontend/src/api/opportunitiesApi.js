import api from './axiosInstance'

export const opportunitiesApi = {
  // CRUD
  create:  (data)       => api.post('/opportunities', data).then(r => r.data.data),
  list:    (params)     => api.get('/opportunities', { params }).then(r => r.data.data),
  getById: (id)         => api.get(`/opportunities/${id}`).then(r => r.data.data),
  update:  (id, data)   => api.put(`/opportunities/${id}`, data).then(r => r.data.data),
  delete:  (id)         => api.delete(`/opportunities/${id}`).then(r => r.data),

  // Workflow transitions
  apply:              (id)       => api.post(`/opportunities/${id}/apply`).then(r => r.data.data),
  receiveAssessment:  (id, data) => api.post(`/opportunities/${id}/receive-assessment`, data).then(r => r.data.data),
  completeAssessment: (id)       => api.post(`/opportunities/${id}/complete-assessment`).then(r => r.data.data),
  scheduleInterview:  (id, data) => api.post(`/opportunities/${id}/schedule-interview`, data).then(r => r.data.data),
  completeInterview:  (id)       => api.post(`/opportunities/${id}/complete-interview`).then(r => r.data.data),
  receiveOffer:       (id, data) => api.post(`/opportunities/${id}/receive-offer`, data).then(r => r.data.data),
  acceptOffer:        (id)       => api.post(`/opportunities/${id}/accept`).then(r => r.data.data),
  reject:             (id)       => api.post(`/opportunities/${id}/reject`).then(r => r.data.data),
  declineOffer:       (id)       => api.post(`/opportunities/${id}/decline`).then(r => r.data.data),
  withdraw:           (id)       => api.post(`/opportunities/${id}/withdraw`).then(r => r.data.data),

  // Timeline
  getTimeline: (id) => api.get(`/opportunities/${id}/timeline`).then(r => r.data.data),
  getGlobalTimeline: () => api.get('/timeline').then(r => r.data.data),

  // Notes
  getNotes:   (id)       => api.get(`/opportunities/${id}/notes`).then(r => r.data.data),
  createNote: (id, content) => api.post(`/opportunities/${id}/notes`, content, { headers: { 'Content-Type': 'text/plain' } }).then(r => r.data.data),
  updateNote: (noteId, content) => api.put(`/notes/${noteId}`, content, { headers: { 'Content-Type': 'text/plain' } }).then(r => r.data.data),
  deleteNote: (noteId) => api.delete(`/notes/${noteId}`).then(r => r.data),

  // Documents
  getDocuments:   (id) => api.get(`/opportunities/${id}/documents`).then(r => r.data.data),
  uploadDocument: (id, fileType, file) => {
    const formData = new FormData()
    formData.append('fileType', fileType)
    formData.append('file', file)
    return api.post(`/opportunities/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data.data)
  },
  deleteDocument: (docId) => api.delete(`/documents/${docId}`).then(r => r.data),
  downloadDocumentUrl: (docId) => `${api.defaults.baseURL}/documents/${docId}/download`,

  // Calendar
  getCalendarEvents: () => api.get('/calendar/events').then(r => r.data.data),
  getCalendarEventsForOpportunity: (opportunityId) => api.get(`/calendar/opportunities/${opportunityId}`).then(r => r.data.data),


  // Reminders
  getReminders:     () => api.get('/reminders').then(r => r.data.data),
  dismissReminder: (id) => api.put(`/reminders/${id}/dismiss`).then(r => r.data.data),

  // Analytics
  getAnalytics: () => api.get('/analytics/dashboard').then(r => r.data.data),
}
