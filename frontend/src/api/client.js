import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
})

export const uploadImage = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/api/v1/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // { job_id, message }
}

export const getResult = async (jobId) => {
  const { data } = await client.get(`/api/v1/results/${jobId}`)
  return data // ResultResponse
}

export const checkHealth = async () => {
  const { data } = await client.get('/api/v1/health')
  return data
}
