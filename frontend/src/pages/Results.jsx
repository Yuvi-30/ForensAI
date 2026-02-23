import { useParams, useNavigate } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import StatusBadge from '../components/StatusBadge'
import ResultCard from '../components/ResultCard'
import HeatmapViewer from '../components/HeatmapViewer'
import ELAViewer from '../components/ELAViewer'

const PROCESSING_MESSAGES = [
  'Loading ViT model weights...',
  'Running Error Level Analysis...',
  'Computing attention maps...',
  'Generating Grad-CAM heatmap...',
  'Aggregating forensic signals...',
]

export default function Results() {
  const { jobId } = useParams()
  const { data, error } = useAnalysis(jobId)
  const navigate = useNavigate()

  const isProcessing = !data || data.status === 'pending' || data.status === 'processing'

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <div className="w-7 h-7 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent text-xs font-mono font-bold">F</span>
          </div>
          <span className="font-display font-semibold text-text-primary tracking-wide">ForensAI</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted hidden md:block">
            JOB: {jobId?.slice(0, 8).toUpperCase()}
          </span>
          {data && <StatusBadge status={data.status} />}
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full space-y-6">

        {/* Processing state */}
        {isProcessing && !error && (
          <div className="flex flex-col items-center justify-center min-h-96 space-y-8">
            {/* Animated scanner */}
            <div className="relative w-32 h-32 rounded-lg border border-accent/30 bg-surface overflow-hidden">
              <div className="scan-line" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded border-2 border-accent/40 border-t-accent animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-display font-semibold text-text-primary">Analysing image on cloud...</p>
              <p className="font-mono text-xs text-text-secondary animate-pulse">
                {PROCESSING_MESSAGES[Math.floor(Date.now() / 2000) % PROCESSING_MESSAGES.length]}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {(error || data?.status === 'failed') && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-4 glow-danger">
            <p className="font-display font-semibold text-danger text-xl">Analysis Failed</p>
            <p className="font-mono text-xs text-text-secondary">
              {error || data?.error || 'An unknown error occurred'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded border border-danger/30 text-danger font-mono text-xs hover:bg-danger/10 transition-colors"
            >
              ← TRY AGAIN
            </button>
          </div>
        )}

        {/* Done state */}
        {data?.status === 'done' && (
          <div className="space-y-5">
            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="font-mono text-xs text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
            >
              ← NEW ANALYSIS
            </button>

            {/* Two-column layout on wide screens */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left — Verdict */}
              <div className="space-y-5">
                <ResultCard data={data} />

                {/* Original image */}
                {data.original_url && (
                  <div className="rounded-lg terminal-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-mono text-xs text-text-secondary tracking-widest">ORIGINAL IMAGE</p>
                    </div>
                    <img src={data.original_url} alt="Original" className="w-full max-h-56 object-contain bg-bg" />
                  </div>
                )}
              </div>

              {/* Right — Visuals */}
              <div className="space-y-5">
                {data.gradcam_url && (
                  <HeatmapViewer originalUrl={data.original_url} gradcamUrl={data.gradcam_url} />
                )}
                {data.ela_url && <ELAViewer elaUrl={data.ela_url} />}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-3">
        <span className="font-mono text-xs text-muted">Polling every 2s · Results stored on S3</span>
      </footer>
    </div>
  )
}
