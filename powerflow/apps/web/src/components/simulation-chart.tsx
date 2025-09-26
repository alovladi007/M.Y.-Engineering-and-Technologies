'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SimulationChartProps {
  isSimulating: boolean
}

export default function SimulationChart({ isSimulating }: SimulationChartProps) {
  const [data, setData] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString()
      const newValue = 12 + Math.sin(Date.now() / 1000) * 2 + Math.random() * 0.5

      setLabels(prev => [...prev.slice(-29), newTime])
      setData(prev => [...prev.slice(-29), newValue])
    }, 100)

    return () => clearInterval(interval)
  }, [isSimulating])

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Output Voltage (V)',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-time Output Voltage',
      },
    },
    scales: {
      y: {
        min: 8,
        max: 16,
        title: {
          display: true,
          text: 'Voltage (V)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}