import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { topologies } from '../lib/api'
import Plot from 'react-plotly.js'

export default function RunDetail() {
  const { runId } = useParams()
  const [run, setRun] = useState<any>(null)
  const [waveforms, setWaveforms] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => {
    loadRun()
  }, [runId])

  const loadRun = async () => {
    try {
      const [runRes, waveRes] = await Promise.all([
        topologies.getRun(parseInt(runId!)),
        topologies.getWaveforms(parseInt(runId!)),
      ])
      setRun(runRes.data)
      setWaveforms(waveRes.data.waveforms)
    } catch (error) {
      console.error('Failed to load run:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Run not found</p>
      </div>
    )
  }

  const results = run.results_json?.results || {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulation Results</h1>
        <p className="mt-2 text-gray-600">{run.topology} - Run #{run.id}</p>
      </div>

      {/* Status Banner */}
      {run.status === 'completed' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-green-700">
              Simulation completed successfully
            </p>
          </div>
        </div>
      )}

      {run.status === 'failed' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-red-700">
              Simulation failed: {run.error_message}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['summary', 'waveforms', 'losses', 'zvs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Efficiency</h3>
            <p className="text-3xl font-bold text-primary-600">
              {results.efficiency?.toFixed(2) || 'N/A'}%
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">THD</h3>
            <p className="text-3xl font-bold text-primary-600">
              {results.thd_current?.toFixed(2) || 'N/A'}%
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Power Factor</h3>
            <p className="text-3xl font-bold text-primary-600">
              {results.power_factor?.toFixed(3) || 'N/A'}
            </p>
          </div>

          <div className="card md:col-span-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Point</h3>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Input Voltage</dt>
                <dd className="text-lg font-semibold">{run.params_json.vin} V</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Output Voltage</dt>
                <dd className="text-lg font-semibold">{run.params_json.vout} V</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Power</dt>
                <dd className="text-lg font-semibold">{run.params_json.power} W</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Frequency</dt>
                <dd className="text-lg font-semibold">{(run.params_json.fsw / 1000).toFixed(0)} kHz</dd>
              </div>
            </dl>
          </div>

          {results.losses && (
            <div className="card md:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loss Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Switches</span>
                  <span className="font-semibold">{results.losses.primary_switches?.toFixed(2)} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Secondary Switches</span>
                  <span className="font-semibold">{results.losses.secondary_switches?.toFixed(2)} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transformer</span>
                  <span className="font-semibold">{results.losses.transformer?.toFixed(2)} W</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-semibold">Total Loss</span>
                  <span className="font-bold text-red-600">{results.losses.total_loss?.toFixed(2)} W</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'waveforms' && waveforms && (
        <div className="space-y-6">
          <div className="card">
            <Plot
              data={[
                {
                  x: waveforms.time?.slice(0, 200) || [],
                  y: waveforms.v_primary?.slice(0, 200) || [],
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Voltage',
                  line: { color: '#667eea' },
                },
              ]}
              layout={{
                title: 'Primary Voltage Waveform',
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'Voltage (V)' },
                height: 400,
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>

          <div className="card">
            <Plot
              data={[
                {
                  x: waveforms.time?.slice(0, 200) || [],
                  y: waveforms.i_primary?.slice(0, 200) || [],
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Current',
                  line: { color: '#f59e0b' },
                },
              ]}
              layout={{
                title: 'Primary Current Waveform',
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'Current (A)' },
                height: 400,
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'losses' && results.losses && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thermal Analysis</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Primary Junction Temperature</p>
              <p className="text-2xl font-bold">
                {results.losses.junction_temp_pri?.toFixed(1) || 'N/A'}°C
              </p>
              <p className={`text-sm mt-1 ${results.losses.thermal_safe ? 'text-green-600' : 'text-red-600'}`}>
                {results.losses.thermal_safe ? '✓ Within safe limits' : '⚠ Exceeds safe limits'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Secondary Junction Temperature</p>
              <p className="text-2xl font-bold">
                {results.losses.junction_temp_sec?.toFixed(1) || 'N/A'}°C
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'zvs' && run.results_json?.zvs_analysis && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ZVS Operating Region</h3>
          <p className="text-gray-600 mb-4">
            Green regions indicate zero-voltage switching conditions are met.
            Operating in these regions minimizes switching losses.
          </p>
          <Plot
            data={run.results_json.zvs_analysis.heatmap.zvs_heatmap ? [run.results_json.zvs_analysis.heatmap.zvs_heatmap] : []}
            layout={run.results_json.zvs_analysis.heatmap.layout || {}}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  )
}
