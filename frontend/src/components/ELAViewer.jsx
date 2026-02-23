export default function ELAViewer({ elaUrl }) {
  return (
    <div className="rounded-lg terminal-border overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="font-mono text-xs text-text-secondary tracking-widest">ERROR LEVEL ANALYSIS</p>
        <p className="font-body text-xs text-muted mt-0.5">
          Uniform brightness = AI-generated · Varied brightness = authentic
        </p>
      </div>

      {/* ELA image */}
      <div className="bg-bg">
        <img
          src={elaUrl}
          alt="Error Level Analysis"
          className="w-full object-contain max-h-72"
        />
      </div>

      {/* Key */}
      <div className="px-4 py-3 border-t border-border flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/10 border border-border" />
          <span className="font-mono text-xs text-text-secondary">Dark = low error (smooth / AI)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white border border-border" />
          <span className="font-mono text-xs text-text-secondary">Bright = high error (real texture)</span>
        </div>
      </div>
    </div>
  )
}
