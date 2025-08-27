'use client';

import { UserSettings, WeightEntry } from '@/types';
import { calculateWeightStats } from '@/utils/calculations';
import { AlertCircle, Cloud, CloudOff, RefreshCw, Scale, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AirtableSetup } from './AirtableSetup';
import { DataExportImport } from './DataExportImport';
import { ProgressChart } from './ProgressChart';
import { StatsCard } from './StatsCard';
import { WeightEntryFormComponent } from './WeightEntryForm';
import { WeightHistoryTable } from './WeightHistoryTable';

// Dynamic import for hybrid storage to avoid SSR issues
const getHybridStorage = async () => {
  const { HybridStorageService } = await import('@/services/hybridStorage');

  const airtableConfig = {
    baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '',
    tableName: process.env.NEXT_PUBLIC_AIRTABLE_WEIGHT_TABLE || 'WeightEntries',
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '',
  };

  const hasAirtableConfig = airtableConfig.baseId && airtableConfig.apiKey;

  return new HybridStorageService(hasAirtableConfig ? airtableConfig : undefined);
};

export const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    weightUnit: 'lbs',
    dateFormat: 'MM/dd/yyyy',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAirtableSetup, setShowAirtableSetup] = useState(false);
  const [hybridStorage, setHybridStorage] = useState<import('@/services/hybridStorage').HybridStorageService | null>(null);
  const [syncStatus, setSyncStatus] = useState({
    isPending: false,
    isOnline: true,
    hasAirtable: false,
  });

  // Initialize hybrid storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        const storage = await getHybridStorage();
        setHybridStorage(storage);

        // Load initial data
        const loadedEntries = storage.getEntries();
        const loadedSettings = storage.getSettings();

        setEntries(loadedEntries);
        setSettings(loadedSettings);

        // Show settings if this is first time user (no name set)
        if (!loadedSettings.name) {
          setShowSettings(true);
        }

        // Update sync status
        setSyncStatus(storage.getSyncStatus());

      } catch (err) {
        console.error('Error initializing storage:', err);
        setError('Failed to initialize application.');
      } finally {
        setIsLoading(false);
      }
    };

    initStorage();
  }, []);

  // Update sync status periodically
  useEffect(() => {
    if (!hybridStorage) return;

    const interval = setInterval(() => {
      setSyncStatus(hybridStorage.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, [hybridStorage]);

  // Add new weight entry
  const handleAddEntry = async (entryData: { date: string; weight: number; notes?: string }) => {
    if (!hybridStorage) return;

    try {
      const newEntry = await hybridStorage.addEntry(entryData);
      setEntries(prev => [...prev, newEntry]);
      setError(null);
    } catch (err) {
      console.error('Error adding entry:', err);
      setError('Failed to save weight entry.');
      throw err;
    }
  };

  // Update existing weight entry
  const handleUpdateEntry = async (id: string, updates: { date: string; weight: number; notes?: string }) => {
    if (!hybridStorage) return;

    try {
      const updatedEntry = await hybridStorage.updateEntry(id, updates);
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
        setError(null);
      }
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update weight entry.');
      throw err;
    }
  };

  // Delete weight entry
  const handleDeleteEntry = async (id: string) => {
    if (!hybridStorage) return;

    try {
      const success = await hybridStorage.deleteEntry(id);
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
        setError(null);
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete weight entry.');
    }
  };

  // Update user settings
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!hybridStorage) return;

    try {
      await hybridStorage.updateSettings(newSettings);
      setSettings(newSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to save settings.');
    }
  };

  // Handle data imported - reload all data
  const handleDataImported = async () => {
    if (!hybridStorage) return;

    try {
      const loadedEntries = hybridStorage.getEntries();
      const loadedSettings = hybridStorage.getSettings();
      setEntries(loadedEntries);
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      console.error('Error reloading data after import:', err);
      setError('Failed to reload data after import.');
    }
  };

  // Force sync to Airtable
  const handleForceSync = async () => {
    if (!hybridStorage) return;

    try {
      await hybridStorage.forceSyncToAirtable();
      setError(null);
    } catch (err) {
      console.error('Error syncing to Airtable:', err);
      setError('Failed to sync to Airtable. Check your configuration.');
    }
  };

  // Recover from Airtable
  const handleRecoverFromAirtable = async () => {
    if (!hybridStorage) return;

    try {
      setIsLoading(true);
      const { entries: recoveredEntries, settings: recoveredSettings } = await hybridStorage.recoverFromAirtable();

      if (recoveredEntries.length > 0) {
        setEntries(recoveredEntries);
      }

      if (recoveredSettings) {
        setSettings(recoveredSettings);
      }

      setError(null);
    } catch (err) {
      console.error('Error recovering from Airtable:', err);
      setError('Failed to recover data from Airtable.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = calculateWeightStats(entries, settings);

  // Sync status indicator
  const SyncIndicator = () => {
    if (!syncStatus.hasAirtable) {
      return (
        <div className="flex items-center text-gray-500 text-sm">
          <CloudOff className="h-4 w-4 mr-1" />
          Local Only
        </div>
      );
    }

    if (!syncStatus.isOnline) {
      return (
        <div className="flex items-center text-yellow-600 text-sm">
          <CloudOff className="h-4 w-4 mr-1" />
          Offline
        </div>
      );
    }

    if (syncStatus.isPending) {
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          Syncing...
        </div>
      );
    }

    return (
      <div className="flex items-center text-green-600 text-sm">
        <Cloud className="h-4 w-4 mr-1" />
        Synced
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your weight tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Weight Loss Tracker</h1>
                {settings.name && (
                  <p className="text-sm text-gray-600">Welcome back, {settings.name}!</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <SyncIndicator />

              {/* Sync Controls */}
              {syncStatus.hasAirtable && (
                <button
                  onClick={handleForceSync}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100"
                  title="Force sync to Airtable"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div className="flex-1">
                <span className="text-red-800">{error}</span>
                {(error.includes('not found') || error.includes('404')) && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setShowAirtableSetup(true);
                        setError(null);
                      }}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                    >
                      Open Airtable Setup Guide
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Airtable Recovery */}
        {syncStatus.hasAirtable && entries.length === 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cloud className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-blue-800">No local data found. Recover from Airtable?</span>
              </div>
              <button
                onClick={handleRecoverFromAirtable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Recover Data
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Settings & Airtable Sync</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Airtable Status */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-blue-800">
                    {syncStatus.hasAirtable ? 'Connected to Airtable' : 'Airtable Not Configured'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAirtableSetup(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Setup Guide
                  </button>
                  {syncStatus.hasAirtable && (
                    <button
                      onClick={handleForceSync}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              </div>
              {!syncStatus.hasAirtable && (
                <p className="text-blue-700 text-sm mt-2">
                  Add your Airtable Base ID to .env.local to enable cloud sync
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleUpdateSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight Unit
                </label>
                <select
                  value={settings.weightUnit}
                  onChange={(e) => handleUpdateSettings({ ...settings, weightUnit: e.target.value as 'lbs' | 'kg' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Weight ({settings.weightUnit})
                </label>
                <input
                  type="number"
                  value={settings.goalWeight || ''}
                  onChange={(e) => handleUpdateSettings({
                    ...settings,
                    goalWeight: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  step="0.1"
                  min="0"
                  placeholder="Enter goal weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Weight ({settings.weightUnit})
                </label>
                <input
                  type="number"
                  value={settings.startWeight || ''}
                  onChange={(e) => handleUpdateSettings({
                    ...settings,
                    startWeight: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  step="0.1"
                  min="0"
                  placeholder="Enter starting weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={settings.heightCm || ''}
                  onChange={(e) => handleUpdateSettings({
                    ...settings,
                    heightCm: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  min="50"
                  max="250"
                  placeholder="170"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Export/Import */}
        {showSettings && (
          <div className="mb-6">
            <DataExportImport onDataImported={handleDataImported} />
          </div>
        )}

        {/* Statistics */}
        <StatsCard stats={stats} settings={settings} />

        {/* Weight Entry Form */}
        <WeightEntryFormComponent
          onSubmit={handleAddEntry}
          settings={settings}
          isLoading={isLoading}
        />

        {/* Progress Chart */}
        {entries.length > 0 && (
          <div className="mb-6">
            <ProgressChart
              entries={entries}
              settings={settings}
              showGoalLine={true}
            />
          </div>
        )}

        {/* Weight History Table */}
        <WeightHistoryTable
          entries={entries}
          settings={settings}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          isLoading={isLoading}
        />

        {/* Airtable Setup Modal */}
        {showAirtableSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-h-[90vh] overflow-y-auto">
              <AirtableSetup onClose={() => setShowAirtableSetup(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
