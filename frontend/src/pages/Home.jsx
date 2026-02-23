import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadZone from '../components/UploadZone'
import { uploadImage } from '../api/client'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    try {
      const { job_id } = await uploadImage(file)
      navigate(`/results/${job_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Is the server running?')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent text-xs font-mono font-bold">F</span>
          </div>
          <span className="font-display font-semibold text-text-primary tracking-wide">ForensAI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
          <span className="font-mono text-xs text-text-secondary">SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 space-y-12">
        <div className="text-center space-y-4 max-w-2xl animate-slide-up">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-accent/20 bg-accent/5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-mono text-xs text-accent tracking-widest">CLOUD-NATIVE · ViT + GRAD-CAM + ELA</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-tight text-text-primary animate-flicker">
            AI Image<br />
            <span className="text-accent">Forensics</span>
          </h1>

          <p className="font-body text-text-secondary text-lg leading-relaxed max-w-md mx-auto">
            Upload any image. Our cloud-deployed Vision Transformer detects whether it was created by AI — with full explainability.
          </p>
        </div>

        {/* Upload */}
        <div className="w-full max-w-xl animate-fade-in">
          <UploadZone onUpload={handleUpload} isLoading={isLoading} />
          {error && (
            <p className="mt-3 text-center font-mono text-xs text-danger">
              ⚠ {error}
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 max-w-xl w-full animate-fade-in">
          {[
            { step: '01', title: 'Upload', desc: 'Image sent to EC2 via FastAPI' },
            { step: '02', title: 'Analyse', desc: 'ViT + ELA + Grad-CAM run on cloud' },
            { step: '03', title: 'Results', desc: 'Verdict + visual explanation returned' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-lg border border-border bg-surface p-4 space-y-2">
              <span className="font-mono text-xs text-accent">{step}</span>
              <p className="font-display font-semibold text-sm text-text-primary">{title}</p>
              <p className="font-body text-xs text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-xs text-muted">AWS EC2 · S3 · FastAPI · PyTorch</span>
        <span className="font-mono text-xs text-muted">CLOUD COMPUTING PROJECT</span>
      </footer>
    </div>
  )
}
