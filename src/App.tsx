import { useEffect, useState } from 'react'
import './App.css'
import { UAHData, type UAHParsedData } from './UAHData'

function App() {
  const [data, setData] = useState<UAHParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const text = await UAHData.downloadFile()
        const parsed = UAHData.parseFile(text)
        if (!cancelled) {
          setData(parsed)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1>UAH Lower Troposphere Data</h1>
      {loading && <p>Loading latest data…</p>}
      {error && <p>Failed to load: {error}</p>}
      {!loading && !error && data && (
        <div className="card">
          <p>Monthly rows: {data.monthly.length}</p>
          <p>Columns: {data.columns.length}</p>
          <p>
            Latest: {data.monthly.at(-1)?.year}-{String(data.monthly.at(-1)?.month).padStart(2, '0')}
          </p>
          <p>Trend row: {data.trend ? 'available' : 'missing'}</p>
        </div>
      )}
    </>
  )
}

export default App
