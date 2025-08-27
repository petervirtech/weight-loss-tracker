'use client';

import { dataStorage } from '@/utils/storage';
import { AlertCircle, CheckCircle, Download, FileText, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface DataExportImportProps {
  onDataImported: () => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({ onDataImported }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const data = dataStorage.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weight-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
      clearMessage();
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      clearMessage();
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleImport(file);
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setMessage(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a valid JSON file.');
      }

      // Read file content
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid file format: missing entries array.');
      }

      if (!data.settings || typeof data.settings !== 'object') {
        throw new Error('Invalid file format: missing settings object.');
      }

      // Confirm import with user
      const entryCount = data.entries.length;
      const confirmMessage = `This will replace all your current data with ${entryCount} weight entries from the backup. Are you sure you want to continue?`;

      if (!window.confirm(confirmMessage)) {
        setIsImporting(false);
        return;
      }

      // Import the data
      dataStorage.importData(data);

      setMessage({
        type: 'success',
        text: `Successfully imported ${entryCount} weight entries and settings!`
      });

      // Notify parent component to refresh data
      onDataImported();
      clearMessage();
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data.';
      setMessage({ type: 'error', text: errorMessage });
      clearMessage();
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 text-gray-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Export your data for backup or import data from a previous backup. All data is stored locally in your browser.
      </p>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Download className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Export Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Download all your weight entries and settings as a JSON file for backup.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Upload className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Import Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload a JSON backup file to restore your weight entries and settings.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Important:</strong> Importing data will replace all your current weight entries and settings.
            Make sure to export your current data first if you want to keep it as a backup.
          </div>
        </div>
      </div>
    </div>
  );
};
