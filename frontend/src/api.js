import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const fetchJobs      = ()        => api.get('/jobs').then(r => r.data)
export const createJob      = (data)    => api.post('/jobs', data).then(r => r.data)
export const deleteJob      = (id)      => api.delete(`/jobs/${id}`).then(r => r.data)

// ── Candidates ────────────────────────────────────────────────────────────────
export const fetchCandidates = (jobId)  => api.get(`/jobs/${jobId}/candidates`).then(r => r.data)

export const uploadResume = (jobId, file) => {
  const form = new FormData()
  form.append('resume', file)
  return api.post(`/jobs/${jobId}/apply`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

// ── Talent Pool ───────────────────────────────────────────────────────────────
export const fetchTalentPool = (skill)  =>
  api.get('/talent-pool', { params: skill ? { skill } : {} }).then(r => r.data)

// ── Stats ─────────────────────────────────────────────────────────────────────
export const fetchStats = ()            => api.get('/stats').then(r => r.data)
