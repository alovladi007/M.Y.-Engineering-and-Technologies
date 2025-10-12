import React from 'react';
import Plot from 'react-plotly.js';

interface EfficiencyPlotProps {
  efficiency: number;
  lossBreakdown?: {
    conduction: number;
    switching: number;
    transformer: number;
    other?: number;
  };
}

export const EfficiencyPlot: React.FC<EfficiencyPlotProps> = ({ efficiency, lossBreakdown }) => {
  if (!lossBreakdown) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Efficiency</h3>
        <div className="text-center">
          <div className="text-5xl font-bold text-green-400">
            {efficiency.toFixed(2)}%
          </div>
          <p className="text-gray-400 mt-2">Overall Efficiency</p>
        </div>
      </div>
    );
  }

  const lossData = [
    lossBreakdown.conduction,
    lossBreakdown.switching,
    lossBreakdown.transformer,
    lossBreakdown.other || 0,
  ];

  const labels = ['Conduction', 'Switching', 'Transformer', 'Other'];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Efficiency & Loss Breakdown</h3>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-green-400">
          {efficiency.toFixed(2)}%
        </div>
        <p className="text-gray-400 mt-1">Overall Efficiency</p>
      </div>

      <Plot
        data={[
          {
            values: lossData,
            labels: labels,
            type: 'pie',
            marker: {
              colors: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280'],
            },
            textinfo: 'label+percent',
            textfont: {
              color: '#fff',
            },
          },
        ]}
        layout={{
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: {
            color: '#9ca3af',
          },
          showlegend: true,
          legend: {
            font: {
              color: '#9ca3af',
            },
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
          height: 300,
        }}
        config={{ displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};
