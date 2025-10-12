import React from 'react';
import Plot from 'react-plotly.js';

interface TempRisePlotProps {
  tjunction: number;
  tambient: number;
  maxTemp: number;
  iterationData?: {
    iterations: number[];
    temperatures: number[];
  };
}

export const TempRisePlot: React.FC<TempRisePlotProps> = ({
  tjunction,
  tambient,
  maxTemp,
  iterationData,
}) => {
  const margin = maxTemp - tjunction;
  const marginPercent = (margin / maxTemp) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Junction Temperature</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {tambient.toFixed(1)}°C
          </div>
          <p className="text-gray-400 text-sm mt-1">Ambient</p>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold ${tjunction > maxTemp * 0.9 ? 'text-red-400' : tjunction > maxTemp * 0.75 ? 'text-yellow-400' : 'text-green-400'}`}>
            {tjunction.toFixed(1)}°C
          </div>
          <p className="text-gray-400 text-sm mt-1">Junction</p>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-gray-400">
            {maxTemp.toFixed(1)}°C
          </div>
          <p className="text-gray-400 text-sm mt-1">Max Rated</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Thermal Margin</span>
          <span className={marginPercent < 10 ? 'text-red-400' : marginPercent < 25 ? 'text-yellow-400' : 'text-green-400'}>
            {margin.toFixed(1)}°C ({marginPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${marginPercent < 10 ? 'bg-red-500' : marginPercent < 25 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, (tjunction / maxTemp) * 100)}%` }}
          />
        </div>
      </div>

      {iterationData && (
        <Plot
          data={[
            {
              x: iterationData.iterations,
              y: iterationData.temperatures,
              type: 'scatter',
              mode: 'lines+markers',
              line: {
                color: '#3b82f6',
              },
              marker: {
                size: 6,
                color: '#3b82f6',
              },
            },
            {
              x: [0, iterationData.iterations[iterationData.iterations.length - 1]],
              y: [maxTemp, maxTemp],
              type: 'scatter',
              mode: 'lines',
              line: {
                color: '#ef4444',
                dash: 'dash',
              },
              name: 'Max Temp',
            },
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
              color: '#9ca3af',
            },
            xaxis: {
              title: 'Iteration',
              gridcolor: '#374151',
            },
            yaxis: {
              title: 'Temperature (°C)',
              gridcolor: '#374151',
            },
            height: 300,
            margin: { t: 20, b: 60, l: 60, r: 20 },
            showlegend: true,
            legend: {
              font: {
                color: '#9ca3af',
              },
            },
          }}
          config={{ displayModeBar: false }}
          className="w-full"
        />
      )}
    </div>
  );
};
