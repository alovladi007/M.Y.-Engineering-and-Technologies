import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { topologies, projects } from '../lib/api'

export default function NewRun() {
  const navigate = useNavigate()
  const [availableTopologies, setAvailableTopologies] = useState<any>({})
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    project_id: '1',
    topology: 'dab_single',
    vin: '400',
    vout: '400',
    power: '5000',
    fsw: '100000',
    llk: '0.00001',
    n: '1.0',
    phi: '45',
    cdc_in: '0.0001',
    cdc_out: '0.0001',
    deadtime: '0.0000001',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [topoRes, projRes] = await Promise.all([
        topologies.list(),
        projects.list(),
      ])
      setAvailableTopologies(topoRes.data)
      setProjectsList(projRes.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const params = {
        vin: parseFloat(formData.vin),
        vout: parseFloat(formData.vout),
        power: parseFloat(formData.power),
        fsw: parseFloat(formData.fsw),
        llk: parseFloat(formData.llk),
        n: parseFloat(formData.n),
        phi: parseFloat(formData.phi),
        cdc_in: parseFloat(formData.cdc_in),
        cdc_out: parseFloat(formData.cdc_out),
        deadtime: parseFloat(formData.deadtime),
      }

      const { data } = await topologies.simulate({
        project_id: parseInt(formData.project_id),
        topology: formData.topology,
        params,
      })

      navigate(`/run/${data.run_id}`)
    } catch (error) {
      console.error('Simulation failed:', error)
      alert('Simulation failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Simulation</h1>
        <p className="mt-2 text-gray-600">Configure and run a power converter simulation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project</h2>
          <div>
            <label className="label">Project</label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className="input"
            >
              <option value="1">Power Platform Demo Project</option>
              {projectsList.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topology Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topology</h2>
          <div>
            <label className="label">Converter Topology</label>
            <select
              name="topology"
              value={formData.topology}
              onChange={handleChange}
              className="input"
            >
              {Object.entries(availableTopologies).map(([key, value]: [string, any]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-600">
              {availableTopologies[formData.topology]?.description}
            </p>
          </div>
        </div>

        {/* Parameters */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Input Voltage (V)</label>
              <input
                type="number"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                step="0.1"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Output Voltage (V)</label>
              <input
                type="number"
                name="vout"
                value={formData.vout}
                onChange={handleChange}
                step="0.1"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Power (W)</label>
              <input
                type="number"
                name="power"
                value={formData.power}
                onChange={handleChange}
                step="1"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Switching Frequency (Hz)</label>
              <input
                type="number"
                name="fsw"
                value={formData.fsw}
                onChange={handleChange}
                step="1000"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Leakage Inductance (H)</label>
              <input
                type="number"
                name="llk"
                value={formData.llk}
                onChange={handleChange}
                step="0.000001"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Turns Ratio</label>
              <input
                type="number"
                name="n"
                value={formData.n}
                onChange={handleChange}
                step="0.1"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Phase Shift (degrees)</label>
              <input
                type="number"
                name="phi"
                value={formData.phi}
                onChange={handleChange}
                step="1"
                min="0"
                max="180"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Deadtime (s)</label>
              <input
                type="number"
                name="deadtime"
                value={formData.deadtime}
                onChange={handleChange}
                step="0.00000001"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Input Capacitance (F)</label>
              <input
                type="number"
                name="cdc_in"
                value={formData.cdc_in}
                onChange={handleChange}
                step="0.00001"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Output Capacitance (F)</label>
              <input
                type="number"
                name="cdc_out"
                value={formData.cdc_out}
                onChange={handleChange}
                step="0.00001"
                required
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </form>
    </div>
  )
}
