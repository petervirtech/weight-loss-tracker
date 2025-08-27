'use client';

import { UserSettings, WeightStats } from '@/types';
import { formatWeight } from '@/utils/calculations';
import { Activity, Calendar, Heart, Scale, Target, TrendingDown } from 'lucide-react';
import React from 'react';

interface StatsCardProps {
  stats: WeightStats;
  settings: UserSettings;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, settings }) => {
  const getBMIColor = (bmi?: number) => {
    if (!bmi) return 'text-gray-500';
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatProgressPercentage = (percentage: number): string => {
    if (percentage > 100) return '100+';
    if (percentage < 0) return '0';
    return percentage.toFixed(0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Total Weight Loss */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Loss
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatWeight(Math.abs(stats.totalLoss), settings.weightUnit)}
            </p>
            {stats.totalLoss < 0 && (
              <p className="text-sm text-red-600 mt-1">Weight gained</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <TrendingDown className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Current Weight */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Current Weight
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatWeight(stats.currentWeight, settings.weightUnit)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Start: {formatWeight(stats.startWeight, settings.weightUnit)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Scale className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      {stats.goalWeight && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Goal Progress
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatProgressPercentage(stats.progressPercentage)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Goal: {formatWeight(stats.goalWeight, settings.weightUnit)}
              </p>
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.progressPercentage)}`}
                    style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Average Weekly Loss */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Weekly Average
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatWeight(Math.abs(stats.averageWeeklyLoss), settings.weightUnit)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.averageWeeklyLoss >= 0 ? 'Loss per week' : 'Gain per week'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Days Tracking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Days Tracking
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.daysTracking}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {Math.floor(stats.daysTracking / 7)} weeks
            </p>
          </div>
          <div className="flex-shrink-0">
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* BMI */}
      {stats.bmi && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                BMI
              </h3>
              <p className={`text-2xl font-bold mt-2 ${getBMIColor(stats.bmi)}`}>
                {stats.bmi}
              </p>
              <p className={`text-sm mt-1 ${getBMIColor(stats.bmi)}`}>
                {stats.bmiCategory}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Heart className={`h-8 w-8 ${getBMIColor(stats.bmi).replace('text-', '')}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
