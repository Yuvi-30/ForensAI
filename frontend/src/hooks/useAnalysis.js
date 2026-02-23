import { useState, useEffect, useRef } from 'react'
import { getResult } from '../api/client'

const POLL_INTERVAL = 2000  // 2s
const MAX_POLLS = 60        // 2 min timeout

export function useAnalysis(jobId) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const count = useRef(0)

  useEffect(() => {
    if (!jobId) return
    count.current = 0

    const interval = setInterval(async () => {
      try {
        const result = await getResult(jobId)
        setData(result)

        if (result.status === 'done' || result.status === 'failed') {
          clearInterval(interval)
        }

        count.current++
        if (count.current >= MAX_POLLS) {
          clearInterval(interval)
          setError('Analysis timed out. Please try again.')
        }
      } catch (err) {
        clearInterval(interval)
        setError(err.response?.data?.detail || 'Failed to fetch result.')
      }
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [jobId])

  return { data, error }
}
