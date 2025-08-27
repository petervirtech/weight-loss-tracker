'use client';

import { UserSettings, WeightEntry } from '@/types';
import { formatDate, prepareChartData, sortEntriesByDate } from '@/utils/calculations';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Calendar, TrendingDown } from 'lucide-react';
import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressChartProps {
  entries: WeightEntry[];
  settings: UserSettings;
  showGoalLine?: boolean;
  timeRange?: 'all' | '30days' | '90days' | '180days' | '365days';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  entries,
  settings,
  showGoalLine = true,
  timeRange = 'all',
}) => {
  const chartRef = useRef<ChartJS<'line', number[], string>>(null);

  // Filter entries based on time range
  const getFilteredEntries = (): WeightEntry[] => {
    if (timeRange === 'all') return entries;

    const days = parseInt(timeRange.replace('days', ''));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
  };

  const filteredEntries = getFilteredEntries();
  const sortedEntries = sortEntriesByDate(filteredEntries, 'asc');
  const chartData = prepareChartData(sortedEntries, settings);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <TrendingDown className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Progress Chart</h2>
        </div>
        <div className="text-center py-8">
          <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available for chart. Add some weight entries to see your progress!</p>
        </div>
      </div>
    );
  }

  // Prepare data for Chart.js
  const labels = chartData.map(point =>
    formatDate(point.date, settings.dateFormat)
  );

  const weights = chartData.map(point => point.weight);
  const goalWeights = chartData.map(point => point.goalWeight);

  // Calculate Y-axis range
  const allWeights = [...weights];
  if (settings.goalWeight) allWeights.push(settings.goalWeight);

  const minWeight = Math.min(...allWeights);
  const maxWeight = Math.max(...allWeights);
  const padding = (maxWeight - minWeight) * 0.1 || 5; // 10% padding or minimum 5 units

  const data = {
    labels,
    datasets: [
      {
        label: `Weight (${settings.weightUnit})`,
        data: weights,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.1,
      },
      ...(showGoalLine && settings.goalWeight ? [{
        label: `Goal (${settings.weightUnit})`,
        data: goalWeights,
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: { dataset: { label?: string }, parsed: { y: number } }) {
            const weight = context.parsed.y.toFixed(1);
            const label = context.dataset.label || 'Weight';
            return `${label}: ${weight} ${settings.weightUnit}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 45,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `Weight (${settings.weightUnit})`,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        min: Math.max(0, minWeight - padding),
        max: maxWeight + padding,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: string | number) {
            return typeof value === 'number' ? value.toFixed(1) : value;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingDown className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Progress Chart</h2>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={() => {
              // This would need to be handled by parent component
              // For now, we'll just show all data
            }}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="180days">Last 6 Months</option>
            <option value="365days">Last Year</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <Line ref={chartRef} data={data} options={options} />
      </div>

      {/* Chart Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Lowest Weight</p>
          <p className="text-lg font-semibold text-green-600">
            {Math.min(...weights).toFixed(1)} {settings.weightUnit}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Highest Weight</p>
          <p className="text-lg font-semibold text-red-600">
            {Math.max(...weights).toFixed(1)} {settings.weightUnit}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Total Change</p>
          <p className={`text-lg font-semibold ${
            weights[weights.length - 1] < weights[0] ? 'text-green-600' : 'text-red-600'
          }`}>
            {weights.length > 1 ?
              `${(weights[weights.length - 1] - weights[0] >= 0 ? '+' : '')}${(weights[weights.length - 1] - weights[0]).toFixed(1)} ${settings.weightUnit}`
              : '-'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
