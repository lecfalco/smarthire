import { useState } from 'react'
import { createJob } from '../api'

export default function JobForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    experience_level: 'Mid',
    department: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.required_skills) {
      setError('Title, description, and required skills are required.')
      return
    }
    setLoading(true)
    try {
      const job = await createJob(form)
      onCreated(job)
      setForm({ title: '', description: '', required_skills: '', experience_level: 'Mid', department: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 ' +
    'placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Post a New Job</h2>

      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-slate-400">Job Title *</label>
          <input name="title" value={form.title} onChange={handle}
            placeholder="e.g. Backend Engineer" className={inputCls} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-400">Department</label>
          <input name="department" value={form.department} onChange={handle}
            placeholder="e.g. Engineering" className={inputCls} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-400">Experience Level *</label>
          <select name="experience_level" value={form.experience_level} onChange={handle} className={inputCls}>
            {['Junior', 'Mid', 'Senior', 'Lead'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs text-slate-400">Required Skills * (comma-separated)</label>
          <input name="required_skills" value={form.required_skills} onChange={handle}
            placeholder="Python, FastAPI, PostgreSQL, Docker" className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs text-slate-400">Job Description *</label>
          <textarea name="description" value={form.description} onChange={handle}
            rows={4} placeholder="Describe responsibilities, nice-to-haves, and context..."
            className={inputCls + ' resize-none'} />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white
                   hover:bg-blue-500 disabled:opacity-50 transition-colors">
        {loading ? 'Creating…' : 'Create Job Opening'}
      </button>
    </form>
  )
}
