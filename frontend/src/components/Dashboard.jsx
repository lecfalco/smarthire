import { useState, useEffect, useCallback } from 'react'
import {
  fetchJobs, deleteJob, fetchCandidates,
  uploadResume, fetchTalentPool, fetchStats
} from '../api'
import JobForm from './JobForm'
import CandidateCard from './CandidateCard'

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

// ── Upload Button ─────────────────────────────────────────────────────────────
function UploadResume({ job, onUploaded }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setMsg('')
    try {
      const candidate = await uploadResume(job.id, file)
      setMsg(`✓ ${candidate.name} scored ${Math.round(candidate.match_score)} — ${candidate.status.replace('_', ' ')}`)
      onUploaded()
    } catch (err) {
      setMsg(`✗ ${err.response?.data?.detail || 'Upload failed'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <label className={`inline-block cursor-pointer rounded-lg border border-slate-600
                         bg-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-600
                         transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading ? 'Analysing…' : '+ Upload Resume'}
        <input type="file" accept=".pdf,.txt" onChange={handleFile} className="hidden" />
      </label>
      {msg && <p className="mt-1 text-xs text-slate-400">{msg}</p>}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab]               = useState('jobs')       // 'jobs' | 'talent' | 'new'
  const [jobs, setJobs]             = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [talentPool, setTalentPool] = useState([])
  const [stats, setStats]           = useState(null)
  const [skillFilter, setSkillFilter] = useState('')

  const loadJobs  = useCallback(() => fetchJobs().then(setJobs), [])
  const loadStats = useCallback(() => fetchStats().then(setStats), [])

  useEffect(() => { loadJobs(); loadStats() }, [])

  const selectJob = async (job) => {
    setSelectedJob(job)
    const data = await fetchCandidates(job.id)
    setCandidates(data)
  }

  const loadTalent = async () => {
    const data = await fetchTalentPool(skillFilter || undefined)
    setTalentPool(data)
  }

  useEffect(() => { if (tab === 'talent') loadTalent() }, [tab])

  const handleDelete = async (id) => {
    await deleteJob(id)
    if (selectedJob?.id === id) { setSelectedJob(null); setCandidates([]) }
    loadJobs(); loadStats()
  }

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ` +
    (tab === t
      ? 'bg-blue-600 text-white'
      : 'text-slate-400 hover:text-white hover:bg-slate-700')

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">Smart<span className="text-blue-400">Hire</span></span>
          <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/30">
            AI Screening
          </span>
        </div>
        <nav className="flex gap-2">
          {[['jobs', 'Jobs'], ['talent', 'Talent Pool'], ['new', '+ New Job']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={tabCls(t)}>{label}</button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Total Jobs"       value={stats.total_jobs}       color="text-white" />
            <StatCard label="Applications"     value={stats.total_candidates} color="text-white" />
            <StatCard label="Shortlisted"      value={stats.shortlisted}      color="text-emerald-400" />
            <StatCard label="Talent Pool"      value={stats.talent_pool}      color="text-amber-400" />
            <StatCard label="Avg Match Score"  value={`${stats.avg_match_score}%`} color="text-blue-400" />
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {tab === 'jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job list */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Open Positions ({jobs.length})
              </h2>
              {jobs.length === 0 && (
                <p className="text-sm text-slate-500">No jobs yet. Create one →</p>
              )}
              {jobs.map((job) => (
                <div key={job.id}
                  onClick={() => selectJob(job)}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors
                    ${selectedJob?.id === job.id
                      ? 'border-blue-500 bg-blue-600/10'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white text-sm">{job.title}</p>
                      {job.department && (
                        <p className="text-xs text-slate-400 mt-0.5">{job.department}</p>
                      )}
                      <span className="mt-2 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                        {job.experience_level}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(job.id) }}
                      className="text-slate-600 hover:text-red-400 text-xs transition-colors">
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.required_skills.split(',').slice(0, 3).map((s) => (
                      <span key={s} className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                  <UploadResume job={job} onUploaded={() => { selectJob(job); loadStats() }} />
                </div>
              ))}
            </div>

            {/* Candidates panel */}
            <div className="lg:col-span-2 space-y-3">
              {selectedJob ? (
                <>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Candidates for "{selectedJob.title}" ({candidates.length})
                  </h2>
                  {candidates.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No applications yet. Upload a resume to the left.
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
                  </div>
                </>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 text-slate-600 text-sm">
                  Select a job to view candidates
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TALENT POOL TAB ── */}
        {tab === 'talent' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Talent Pool</h2>
              <input
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTalent()}
                placeholder="Filter by skill (press Enter)…"
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5
                           text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500
                           focus:outline-none w-64"
              />
              <button onClick={loadTalent}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600 transition-colors">
                Search
              </button>
            </div>

            {talentPool.length === 0 && (
              <p className="text-sm text-slate-500">
                No profiles yet. Candidates who score 40–69 on any role are saved here automatically.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {talentPool.map((p) => (
                <div key={p.id} className="rounded-xl border border-amber-500/20 bg-slate-800/60 p-4">
                  <p className="font-semibold text-white">{p.name}</p>
                  {p.email && <p className="text-xs text-slate-400 mt-0.5">{p.email}</p>}
                  <p className="mt-1 text-xs text-amber-400">Best fit: {p.best_match_role}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Score: {Math.round(p.match_score)}/100</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.skills_tags.split(',').slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NEW JOB TAB ── */}
        {tab === 'new' && (
          <div className="max-w-lg mx-auto rounded-xl border border-slate-700 bg-slate-800/60 p-6">
            <JobForm onCreated={(job) => {
              loadJobs(); loadStats()
              setTab('jobs')
              selectJob(job)
            }} />
          </div>
        )}

      </main>
    </div>
  )
}
