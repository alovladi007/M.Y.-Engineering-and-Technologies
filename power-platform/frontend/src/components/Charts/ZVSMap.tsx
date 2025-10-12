import React from 'react';
import Plot from 'react-plotly.js';

interface ZVSMapProps {
  powerPoints: number[];
  phiPoints: number[];
  zvsMatrix: number[][];
  efficiencyMatrix?: number[][];
}

export const ZVSMap: React.FC<ZVSMapProps> = ({
  powerPoints,
  phiPoints,
  zvsMatrix,
  efficiencyMatrix,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">ZVS Feasibility Map</h3>

      <Plot
        data={[
          {
            x: phiPoints,
            y: powerPoints,
            z: zvsMatrix,
            type: 'heatmap',
            colorscale: [
              [0, '#ef4444'],
              [0.5, '#f59e0b'],
              [1, '#10b981'],
            ],
            colorbar: {
              title: 'ZVS',
              titlefont: {
                color: '#9ca3af',
              },
              tickfont: {
                color: '#9ca3af',
              },
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
            title: 'Phase Shift φ',
            gridcolor: '#374151',
          },
          yaxis: {
            title: 'Power (W)',
            gridcolor: '#374151',
          },
          height: 500,
          margin: { t: 40, b: 60, l: 60, r: 40 },
        }}
        config={{ displayModeBar: true }}
        className="w-full"
      />

      {efficiencyMatrix && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-white mb-4">Efficiency Map</h4>
          <Plot
            data={[
              {
                x: phiPoints,
                y: powerPoints,
                z: efficiencyMatrix,
                type: 'heatmap',
                colorscale: 'Viridis',
                colorbar: {
                  title: 'Efficiency (%)',
                  titlefont: {
                    color: '#9ca3af',
                  },
                  tickfont: {
                    color: '#9ca3af',
                  },
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
                title: 'Phase Shift φ',
                gridcolor: '#374151',
              },
              yaxis: {
                title: 'Power (W)',
                gridcolor: '#374151',
              },
              height: 500,
              margin: { t: 40, b: 60, l: 60, r: 40 },
            }}
            config={{ displayModeBar: true }}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
