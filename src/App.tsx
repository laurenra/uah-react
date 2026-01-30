import { useEffect, useState } from 'react'
import './App.css'
import { UAHData, type UAHParsedData } from './UAHData'

function App() {
  const [data, setData] = useState<UAHParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [localText, setLocalText] = useState<string | null>(null)
  const [localParse, setLocalParse] = useState<UAHParsedData | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    // let cancelled = false
    // const load = async () => {
    //   try {
    //     const text = await UAHData.downloadFile()
    //     const parsed = UAHData.parseFile(text)
    //     if (!cancelled) {
    //       setData(parsed)
    //     }
    //   } catch (err) {
    //     if (!cancelled) {
    //       setError(err instanceof Error ? err.message : 'Unknown error')
    //     }
    //   } finally {
    //     if (!cancelled) {
    //       setLoading(false)
    //     }
    //   }
    // }
    // load()
    // return () => {
    //   cancelled = true
    // }
  }, [])

  return (
    <>
      <h1>UAH Lower Troposphere Data</h1>
      <div className="card">
        <label>
          Load local file:{' '}
          <input
            type="file"
            accept=".txt"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                const text =
                  typeof reader.result === 'string' ? reader.result : ''
                setLocalText(text)
                try {
                  const parsed = UAHData.parseFile(text)
                  setLocalParse(parsed)
                  setLocalError(null)
                } catch (err) {
                  setLocalParse(null)
                  setLocalError(
                    err instanceof Error ? err.message : 'Unknown error'
                  )
                }
              }
              reader.onerror = () => {
                setLocalParse(null)
                setLocalText(null)
                setLocalError('Failed to read file')
              }
              reader.readAsText(file)
            }}
          />
        </label>
        {localError && <p>Local parse failed: {localError}</p>}
        {localParse && (
          <p>
            Local file rows: {localParse.monthly.length}, Trend:{' '}
            {localParse.trend ? 'available' : 'missing'}
          </p>
        )}
      </div>
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
      {localText && (
        <div className="card">
          <h2>Local file contents</h2>
          <pre>{localText}</pre>
        </div>
      )}
    </>
  )
}

export default App
