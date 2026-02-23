import StatusBadge from './StatusBadge'

export default function ResultCard({ data }) {
  const isAI = data.verdict === 'AI_GENERATED'
  const pct = Math.round((data.confidence || 0) * 100)

  return (
    <div className={`rounded-lg terminal-border p-6 space-y-5 animate-slide-up ${isAI ? 'glow-danger' : 'glow-accent'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-text-secondary tracking-widest">FORENSIC VERDICT</span>
        <StatusBadge status={data.status} />
      </div>

      {/* Verdict */}
      <div className="space-y-1">
        <p className={`font-display text-4xl font-800 tracking-tight ${isAI ? 'text-danger' : 'text-accent'}`}>
          {isAI ? 'AI GENERATED' : 'AUTHENTIC'}
        </p>
        <p className="font-body text-text-secondary text-sm">
          {isAI
            ? 'This image was likely created by a generative AI model'
            : 'This image appears to be a real photograph'}
        </p>
      </div>

      {/* Confidence bar */}
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-xs">
          <span className="text-text-secondary">CONFIDENCE</span>
          <span className={isAI ? 'text-danger' : 'text-accent'}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isAI ? 'bg-danger' : 'bg-accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Probability breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="space-y-1">
          <p className="font-mono text-xs text-text-secondary">AI PROBABILITY</p>
          <p className="font-display text-xl font-semibold text-danger">
            {Math.round((data.fake_prob || (isAI ? data.confidence : 1 - data.confidence)) * 100)}%
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-mono text-xs text-text-secondary">REAL PROBABILITY</p>
          <p className="font-display text-xl font-semibold text-accent">
            {Math.round((data.real_prob || (isAI ? 1 - data.confidence : data.confidence)) * 100)}%
          </p>
        </div>
      </div>
    </div>
  )
}
//resultcard