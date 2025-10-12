import { useState } from 'react'
import { hil } from '../lib/api'

export default function HIL() {
  const [connected, setConnected] = useState(false)
  const [running, setRunning] = useState(false)
  const [adapter, setAdapter] = useState('mock')
  const [telemetry, setTelemetry] = useState<any>(null)
  const [setpoints, setSetpoints] = useState({
    pwm_duty: '50',
    voltage_ref: '400',
  })

  const handleConnect = async () => {
    try {
      await hil.connect({
        adapter_type: adapter,
        config: {
          noise_level: 0.01,
        },
      })
      setConnected(true)
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Failed to connect to HIL')
    }
  }

  const handleDisconnect = async () => {
    try {
      await hil.disconnect()
      setConnected(false)
      setRunning(false)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  const handleStart = async () => {
    try {
      await hil.start(1000)
      setRunning(true)
      startPolling()
    } catch (error) {
      console.error('Start failed:', error)
      alert('Failed to start HIL')
    }
  }

  const handleStop = async () => {
    try {
      await hil.stop()
      setRunning(false)
    } catch (error) {
      console.error('Stop failed:', error)
    }
  }

  const handleWriteSetpoints = async () => {
    try {
      await hil.write({
        pwm_duty: parseFloat(setpoints.pwm_duty),
        voltage_ref: parseFloat(setpoints.voltage_ref),
      })
    } catch (error) {
      console.error('Write failed:', error)
      alert('Failed to write setpoints')
    }
  }

  const startPolling = () => {
    const interval = setInterval(async () => {
      if (!running) {
        clearInterval(interval)
        return
      }

      try {
        const { data } = await hil.status()
        setTelemetry(data)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hardware-in-the-Loop Testing
        </h1>
        <p className="mt-2 text-gray-600">
          Connect to physical hardware for real-time testing
        </p>
      </div>

      {/* Connection */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection</h2>

        <div className="space-y-4">
          <div>
            <label className="label">HIL Adapter</label>
            <select
              value={adapter}
              onChange={(e) => setAdapter(e.target.value)}
              disabled={connected}
              className="input"
            >
              <option value="mock">Mock HIL (Testing)</option>
              <option value="modbus_tcp">Modbus TCP</option>
              <option value="opcua">OPC UA</option>
              <option value="udp">UDP Stream</option>
              <option value="ni_crio">NI cRIO</option>
            </select>
          </div>

          <div className="flex space-x-4">
            {!connected ? (
              <button onClick={handleConnect} className="btn-primary">
                Connect
              </button>
            ) : (
              <>
                <button onClick={handleDisconnect} className="btn-secondary">
                  Disconnect
                </button>
                {!running ? (
                  <button onClick={handleStart} className="btn-primary">
                    Start Streaming
                  </button>
                ) : (
                  <button onClick={handleStop} className="btn-secondary">
                    Stop Streaming
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                connected ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            {running && (
              <>
                <div className="ml-4 w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-2" />
                <span className="text-sm text-gray-600">Streaming</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Setpoints */}
      {connected && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setpoints</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">PWM Duty Cycle (%)</label>
              <input
                type="number"
                value={setpoints.pwm_duty}
                onChange={(e) =>
                  setSetpoints({ ...setpoints, pwm_duty: e.target.value })
                }
                min="0"
                max="100"
                step="1"
                className="input"
              />
            </div>

            <div>
              <label className="label">Voltage Reference (V)</label>
              <input
                type="number"
                value={setpoints.voltage_ref}
                onChange={(e) =>
                  setSetpoints({ ...setpoints, voltage_ref: e.target.value })
                }
                step="1"
                className="input"
              />
            </div>
          </div>

          <button onClick={handleWriteSetpoints} className="btn-primary mt-4">
            Write Setpoints
          </button>
        </div>
      )}

      {/* Telemetry */}
      {running && telemetry && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Real-Time Telemetry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">DC Voltage</p>
              <p className="text-3xl font-bold text-blue-600">
                {telemetry.channels?.V_dc?.toFixed(1) || 'N/A'} V
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Output Current</p>
              <p className="text-3xl font-bold text-orange-600">
                {telemetry.channels?.I_out?.toFixed(2) || 'N/A'} A
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Temperature</p>
              <p className="text-3xl font-bold text-red-600">
                {telemetry.channels?.Temp?.toFixed(1) || 'N/A'} °C
              </p>
            </div>
          </div>

          {telemetry.faults && telemetry.faults.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Faults Detected</h3>
              <ul className="space-y-1">
                {telemetry.faults.map((fault: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">
                    • {fault}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About HIL Testing</h3>
        <p className="text-sm text-blue-800">
          Hardware-in-the-Loop testing allows you to validate simulation results
          with physical hardware. Connect to your power electronics hardware via
          supported protocols (Modbus, OPC UA, etc.) and stream real-time telemetry
          data.
        </p>
      </div>
    </div>
  )
}
