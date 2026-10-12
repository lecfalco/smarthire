export default function CandidateCard({ candidate }) {
  const statusConfig = {
    shortlisted:  { label: 'Shortlisted',  bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    talent_pool:  { label: 'Talent Pool',  bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30'   },
    rejected:     { label: 'Rejected',     bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30'     },
  }

  const cfg = statusConfig[candidate.status] ?? statusConfig.rejected
  const score = Math.round(candidate.match_score)

  // Score ring color
  const ringColor =
    score >= 70 ? '#10b981' :
    score >= 40 ? '#f59e0b' :
                  '#ef4444'

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left: name + status */}
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{candidate.name}</h3>
          {candidate.email && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{candidate.email}</p>
          )}
          <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium
                           ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>

        {/* Right: score circle */}
        <div className="flex-shrink-0 text-center">
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r="22" fill="none" stroke="#1e293b" strokeWidth="5" />
            <circle
              cx="27" cy="27" r="22"
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeDasharray={`${(score / 100) * 138.2} 138.2`}
              strokeLinecap="round"
              transform="rotate(-90 27 27)"
            />
            <text x="27" y="31" textAnchor="middle" fontSize="13" fontWeight="700"
              fill="white" fontFamily="Inter, sans-serif">
              {score}
            </text>
          </svg>
          <p className="text-[10px] text-slate-500 -mt-1">/ 100</p>
        </div>
      </div>

      {/* Skills */}
      {candidate.extracted_skills && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.extracted_skills.split(',').slice(0, 6).map((s) => (
            <span key={s}
              className="rounded-md bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      {/* AI Summary */}
      <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-3">
        {candidate.match_summary}
      </p>
    </div>
  )
}
