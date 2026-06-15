import api from './axiosInstance'

export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data.data),
  login:    (data) => api.post('/auth/login',    data).then(r => r.data.data),
  refresh:  (data) => api.post('/auth/refresh',  data).then(r => r.data.data),
}
