import React from 'react';
import Plot from 'react-plotly.js';

interface THDPlotProps {
  thd: number;
  harmonics?: {
    fundamental: number;
    harmonics: number[];
  };
}

export const THDPlot: React.FC<THDPlotProps> = ({ thd, harmonics }) => {
  if (!harmonics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Total Harmonic Distortion</h3>
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-400">
            {thd.toFixed(2)}%
          </div>
          <p className="text-gray-400 mt-2">THD</p>
        </div>
      </div>
    );
  }

  const harmonicNumbers = harmonics.harmonics.map((_, i) => (i + 2).toString());

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Total Harmonic Distortion</h3>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-blue-400">
          {thd.toFixed(2)}%
        </div>
        <p className="text-gray-400 mt-1">THD</p>
      </div>

      <Plot
        data={[
          {
            x: ['Fund', ...harmonicNumbers],
            y: [harmonics.fundamental, ...harmonics.harmonics],
            type: 'bar',
            marker: {
              color: ['#10b981', ...harmonics.harmonics.map(() => '#3b82f6')],
            },
          },
        ]}
        layout={{
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: {
            color: '#9ca3af',
          },
          xaxis: {
            title: 'Harmonic Order',
            gridcolor: '#374151',
          },
          yaxis: {
            title: 'Magnitude (A)',
            gridcolor: '#374151',
          },
          height: 400,
          margin: { t: 20, b: 60, l: 60, r: 20 },
        }}
        config={{ displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};
