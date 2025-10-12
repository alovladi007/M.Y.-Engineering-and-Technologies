import React, { useState } from 'react';

export interface DABFormData {
  vin: string;
  vout: string;
  power: string;
  fsw: string;
  llk: string;
  n: string;
  phi: string;
  deadtime: string;
  t_ambient: string;
}

interface DABFormProps {
  initialData?: Partial<DABFormData>;
  onSubmit: (data: DABFormData) => void;
  disabled?: boolean;
}

export const DABForm: React.FC<DABFormProps> = ({ initialData, onSubmit, disabled }) => {
  const [formData, setFormData] = useState<DABFormData>({
    vin: initialData?.vin || '400',
    vout: initialData?.vout || '400',
    power: initialData?.power || '5000',
    fsw: initialData?.fsw || '100000',
    llk: initialData?.llk || '0.00001',
    n: initialData?.n || '1.0',
    phi: initialData?.phi || '0.25',
    deadtime: initialData?.deadtime || '200e-9',
    t_ambient: initialData?.t_ambient || '25',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Voltage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Input Voltage (V)
          </label>
          <input
            type="number"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Output Voltage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Output Voltage (V)
          </label>
          <input
            type="number"
            name="vout"
            value={formData.vout}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Power */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Power (W)
          </label>
          <input
            type="number"
            name="power"
            value={formData.power}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Switching Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Switching Frequency (Hz)
          </label>
          <input
            type="number"
            name="fsw"
            value={formData.fsw}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Leakage Inductance */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Leakage Inductance (H)
          </label>
          <input
            type="text"
            name="llk"
            value={formData.llk}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., 0.00001 or 10e-6"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Transformer Turns Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Turns Ratio (n)
          </label>
          <input
            type="number"
            step="0.1"
            name="n"
            value={formData.n}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Phase Shift */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phase Shift (φ, 0-0.5)
          </label>
          <input
            type="number"
            step="0.01"
            name="phi"
            value={formData.phi}
            onChange={handleChange}
            disabled={disabled}
            min="0"
            max="0.5"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Deadtime */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deadtime (s)
          </label>
          <input
            type="text"
            name="deadtime"
            value={formData.deadtime}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., 200e-9"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Ambient Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ambient Temperature (°C)
          </label>
          <input
            type="number"
            name="t_ambient"
            value={formData.t_ambient}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium"
      >
        {disabled ? 'Running Simulation...' : 'Start Simulation'}
      </button>
    </form>
  );
};
