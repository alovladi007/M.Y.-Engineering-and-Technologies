import React, { useState, useEffect } from 'react';
import { devices } from '../../lib/api';

interface Device {
  name: string;
  manufacturer: string;
  technology: string;
  vds_max: number;
  id_max: number;
  rds_on_25c: number;
}

interface DeviceSelectProps {
  value: string;
  onChange: (deviceName: string) => void;
  disabled?: boolean;
}

export const DeviceSelect: React.FC<DeviceSelectProps> = ({ value, onChange, disabled }) => {
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const { data } = await devices.list();
      setDeviceList(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = filter
    ? deviceList.filter(
        (d) =>
          d.name.toLowerCase().includes(filter.toLowerCase()) ||
          d.manufacturer.toLowerCase().includes(filter.toLowerCase()) ||
          d.technology.toLowerCase().includes(filter.toLowerCase())
      )
    : deviceList;

  if (loading) {
    return (
      <div className="text-gray-400">Loading devices...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search Devices
        </label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, manufacturer, or technology..."
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Device
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">-- Select a device --</option>
          {filteredDevices.map((device) => (
            <option key={device.name} value={device.name}>
              {device.name} ({device.manufacturer} - {device.technology}, {device.vds_max}V, {device.id_max}A, {device.rds_on_25c * 1000}mΩ)
            </option>
          ))}
        </select>
      </div>

      {value && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Device</h4>
          {(() => {
            const selected = deviceList.find((d) => d.name === value);
            if (!selected) return null;

            return (
              <div className="text-sm text-gray-400 space-y-1">
                <div><strong>Manufacturer:</strong> {selected.manufacturer}</div>
                <div><strong>Technology:</strong> {selected.technology}</div>
                <div><strong>V_DS(max):</strong> {selected.vds_max}V</div>
                <div><strong>I_D(max):</strong> {selected.id_max}A</div>
                <div><strong>R_DS(on) @ 25°C:</strong> {(selected.rds_on_25c * 1000).toFixed(2)}mΩ</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
