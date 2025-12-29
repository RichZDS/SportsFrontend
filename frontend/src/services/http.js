import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 15000
})

http.interceptors.response.use(
  resp => resp.data,
  error => Promise.reject(error)
)

export default http
