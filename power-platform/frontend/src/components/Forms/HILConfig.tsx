import React, { useState } from 'react';

export interface HILConfigData {
  adapter_type: 'mock' | 'modbus_tcp' | 'opcua' | 'udp' | 'ni_crio';
  host?: string;
  port?: number;
  endpoint?: string;
  sample_rate?: number;
}

interface HILConfigProps {
  onConnect: (config: HILConfigData) => void;
  disabled?: boolean;
}

export const HILConfig: React.FC<HILConfigProps> = ({ onConnect, disabled }) => {
  const [adapterType, setAdapterType] = useState<HILConfigData['adapter_type']>('mock');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(502);
  const [endpoint, setEndpoint] = useState('');
  const [sampleRate, setSampleRate] = useState(1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: HILConfigData = {
      adapter_type: adapterType,
      sample_rate: sampleRate,
    };

    if (adapterType !== 'mock') {
      config.host = host;
      config.port = port;

      if (adapterType === 'opcua') {
        config.endpoint = endpoint;
      }
    }

    onConnect(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Adapter Type
        </label>
        <select
          value={adapterType}
          onChange={(e) => setAdapterType(e.target.value as HILConfigData['adapter_type'])}
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mock">Mock HIL (Demo)</option>
          <option value="modbus_tcp">Modbus TCP</option>
          <option value="opcua">OPC UA</option>
          <option value="udp">UDP Stream</option>
          <option value="ni_crio">NI cRIO (gRPC)</option>
        </select>
      </div>

      {adapterType !== 'mock' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Host
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 192.168.1.100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {adapterType === 'opcua' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OPC UA Endpoint
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., opc.tcp://localhost:4840"
              />
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sample Rate (Hz)
        </label>
        <input
          type="number"
          value={sampleRate}
          onChange={(e) => setSampleRate(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Adapter Info</h4>
        <p className="text-sm text-gray-400">
          {adapterType === 'mock' && 'Mock adapter simulates HIL hardware with random walk telemetry for testing.'}
          {adapterType === 'modbus_tcp' && 'Modbus TCP adapter connects to industrial PLCs and RTUs using standard Modbus protocol.'}
          {adapterType === 'opcua' && 'OPC UA adapter provides secure communication with industrial automation systems.'}
          {adapterType === 'udp' && 'UDP Stream adapter enables high-speed telemetry streaming over UDP protocol.'}
          {adapterType === 'ni_crio' && 'NI cRIO adapter connects to National Instruments CompactRIO systems via gRPC.'}
        </p>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
      >
        {disabled ? 'Connecting...' : 'Connect to HIL'}
      </button>
    </form>
  );
};
