export default function StatusBadge({ status }) {
  const map = {
    pending:    { label: 'QUEUED',      color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
    processing: { label: 'ANALYSING',   color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
    done:       { label: 'COMPLETE',    color: 'text-accent border-accent/30 bg-accent/5' },
    failed:     { label: 'FAILED',      color: 'text-danger border-danger/30 bg-danger/5' },
  }

  const { label, color } = map[status] || map.pending
  const isPulsing = status === 'processing' || status === 'pending'

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded border font-mono text-xs tracking-widest ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isPulsing ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
