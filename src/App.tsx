import { useEffect, useRef, useState } from 'react'
import './App.css'
import { UAHData, type UAHParsedData } from './UAHData'
import Plotly, {type PlotlyHTMLElement} from 'plotly.js-dist-min'

function App() {
  const uahFileName: string = 'UAHTemperaturePlot'
  // const [data, setData] = useState<UAHParsedData | null>(null)
  // const [error, setError] = useState<string | null>(null)
  // const [loading, setLoading] = useState(true)
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
    // const source = localParse ?? data
    const source = localParse
    if (!source || !plotRef.current) {
      return
    }
    else {
      console.log("got source")
    }
    const x: string[] = []
    const y: number[] = []
    const ty: number[] = []
    const decadeTrend = source.trend?.values.Globe ?? 0
    const monthlyTrend = (source.trend?.values.Globe ?? 0) / 120 // divide by 120 to get monthly trend
    let trendValue = 0
    console.log("monthlyTrend", monthlyTrend);

    // for (const row of source.monthly) {
    //   const value = row.values.Globe
    //   if (typeof value !== 'number' || Number.isNaN(value)) continue
    //   x.push(`${row.year}-${String(row.month).padStart(2, '0')}-01`)
    //   y.push(value)
    //   ty.push(trendValue * row)
    // }

    for (const [i, row] of source.monthly.entries()) {
      const value = row.values.Globe
      if (typeof value !== 'number' || Number.isNaN(value)) continue
      x.push(`${row.year}-${String(row.month).padStart(2, '0')}-01`)
      y.push(value)
      if (i === 0) {
        trendValue = value
      }
      ty.push(trendValue)
      trendValue += monthlyTrend
    }



    void Plotly.newPlot(
      plotRef.current,
      [
        {
          x: x,
          y: y,
          type: 'scatter',
          mode: 'lines',
          name: 'Globe',
        },
        {
          x: x,
          y: ty,
          type: 'scatter',
          mode: 'lines',
          name: 'Trend ' + decadeTrend.toFixed(2) + '°C/decade',
        }
      ],
      {
        title: { text: 'UAH Globe Monthly Anomaly'},
        xaxis: {
          title: { text: 'Month' },
          // showspikes: true,
          // spikemode: 'across',
          // spikesnap: 'cursor',
          // spikedash: 'dot',
          // spikecolor: 'red',
          // spikethickness: 2,
          type: 'date',
          showgrid: true,
          gridcolor: 'darkgray',
          griddash: 'solid',
          dtick: 'M60',
          minor: {
            showgrid: true,
            gridcolor: 'lightgray',
            griddash: 'dot',
            dtick: 'M12',
          }

        },
        yaxis: { title: { text: 'Temperature Anomaly (°C)' } },
        margin: { t: 40, l: 60, r: 20, b: 50 },
      },
      { responsive: true,
        modeBarButtonsToRemove: ['toImage'],
        // toImageButtonOptions: { format: 'png', filename: uahFileName, height: 500, width: 1250, scale: 2 },
        modeBarButtonsToAdd: [
          {
            name: 'PNG',
            title: 'Download as PNG',
            icon: Plotly.Icons.camera,
            click: (plotRef: PlotlyHTMLElement) => {
              Plotly.downloadImage(plotRef,
                {format: 'png', filename: uahFileName, height: plotRef.offsetHeight, width: plotRef.offsetWidth, scale: 2})
            }
          },
          {
            name: 'SVG',
            title: 'Download as SVG',
            icon: Plotly.Icons.disk,
            click: (plotRef: PlotlyHTMLElement) => {
              Plotly.downloadImage(plotRef,
                {format: 'svg', filename: uahFileName, height: plotRef.offsetHeight, width: plotRef.offsetWidth, scale: 1})
            }
          }
        ]
      }
    )

    return () => {
      if (plotRef.current) {
        console.log("unmounting plot")
        Plotly.purge(plotRef.current)
      }
    }
  // }, [data, localParse])
  }, [localParse])

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
      {localParse && (
        <div className="card">
          <p>Monthly rows: {localParse.monthly.length}</p>
          <p>Columns: {localParse.columns.length}</p>
          <p>
            Latest: {localParse.monthly.at(-1)?.year}-{String(localParse.monthly.at(-1)?.month).padStart(2, '0')}
          </p>
          <p>Trend row: {localParse.trend ? 'available' : 'missing'}</p>
        </div>
      )}
      {localParse && (
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
