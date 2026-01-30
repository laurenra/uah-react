import { useEffect, useRef, useState } from 'react'
import './App.css'
import { UAHData, type UAHParsedData } from './UAHData'
import Plotly from 'plotly.js-dist-min'

function App() {
  const [data, setData] = useState<UAHParsedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [localText, setLocalText] = useState<string | null>(null)
  const [localParse, setLocalParse] = useState<UAHParsedData | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const plotRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    console.log("plotting")
    const source = localParse ?? data
    if (!source || !plotRef.current) {
      return
    }
    else {
      console.log("got source")
    }
    const x: string[] = []
    const y: number[] = []

    for (const row of source.monthly) {
      const value = row.values.Globe
      if (typeof value !== 'number' || Number.isNaN(value)) continue
      x.push(`${row.year}-${String(row.month).padStart(2, '0')}-01`)
      y.push(value)
    }

    void Plotly.newPlot(
      plotRef.current,
      [
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          name: 'Globe',
        },
      ],
      {
        title: 'UAH Globe Monthly Anomaly',
        xaxis: { title: 'Month' },
        yaxis: { title: 'Temperature Anomaly (C)' },
        margin: { t: 40, l: 60, r: 20, b: 50 },
      },
      { responsive: true }
    )

    return () => {
      if (plotRef.current) {
        console.log("unmounting plot")
        Plotly.purge(plotRef.current)
      }
    }
  }, [data, localParse])

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
      {!loading && !error && data && (
        <div className="card">
          <div ref={plotRef} />
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
