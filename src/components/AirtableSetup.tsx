'use client';

import { AirtableService } from '@/services/airtable';
import { AlertCircle, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';

interface AirtableSetupProps {
  onClose?: () => void;
}

export const AirtableSetup: React.FC<AirtableSetupProps> = ({ onClose }) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
    missingTables: string[];
  } | null>(null);
  const [cleanupResult, setCleanupResult] = useState<{
    success: boolean;
    message: string;
    deletedCount: number;
  } | null>(null);

  const testAirtableConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const airtableConfig = {
        baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '',
        tableName: process.env.NEXT_PUBLIC_AIRTABLE_WEIGHT_TABLE || 'WeightEntries',
        apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '',
      };

      if (!airtableConfig.baseId || !airtableConfig.apiKey) {
        setConnectionResult({
          success: false,
          message: 'Airtable configuration is missing. Please check your environment variables.',
          missingTables: []
        });
        return;
      }

      const airtableService = new AirtableService(airtableConfig);
      const result = await airtableService.testConnection();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        missingTables: []
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const cleanupDuplicateSettings = async () => {
    setIsCleaningUp(true);
    setCleanupResult(null);

    try {
      const airtableConfig = {
        baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '',
        tableName: process.env.NEXT_PUBLIC_AIRTABLE_WEIGHT_TABLE || 'WeightEntries',
        apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '',
      };

      if (!airtableConfig.baseId || !airtableConfig.apiKey) {
        setCleanupResult({
          success: false,
          message: 'Airtable configuration is missing. Please check your environment variables.',
          deletedCount: 0
        });
        return;
      }

      const airtableService = new AirtableService(airtableConfig);
      const result = await airtableService.cleanupDuplicateSettings();
      setCleanupResult(result);
    } catch (error) {
      setCleanupResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        deletedCount: 0
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <HelpCircle className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Airtable Setup Guide</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Current Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Configuration</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Base ID:</span> 
              <span className="ml-2 font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'Not configured'}
              </span>
            </div>
            <div>
              <span className="font-medium">API Key:</span> 
              <span className="ml-2">
                {process.env.NEXT_PUBLIC_AIRTABLE_API_KEY 
                  ? `${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY.substring(0, 8)}...` 
                  : 'Not configured'
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Weight Table:</span> 
              <span className="ml-2 font-mono text-blue-600">
                {process.env.NEXT_PUBLIC_AIRTABLE_WEIGHT_TABLE || 'WeightEntries'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Test Connection</h3>
            <button
              onClick={testAirtableConnection}
              disabled={isTestingConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {connectionResult && (
            <div className={`p-3 rounded-md ${
              connectionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center mb-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{connectionResult.message}</span>
              </div>
              
              {connectionResult.missingTables.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Missing tables that need to be created:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {connectionResult.missingTables.map(table => (
                      <li key={table} className="font-mono">{table}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cleanup Duplicates */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Cleanup Duplicate Settings</h3>
            <button
              onClick={cleanupDuplicateSettings}
              disabled={isCleaningUp}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCleaningUp ? 'Cleaning...' : 'Remove Duplicates'}
            </button>
          </div>
          
          <p className="text-yellow-800 text-sm mb-3">
            If you have multiple duplicate settings records (like 5 entries for &quot;Peter&quot;), use this to keep only the latest record and delete the duplicates.
          </p>

          {cleanupResult && (
            <div className={`p-3 rounded-md ${
              cleanupResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center mb-2">
                {cleanupResult.success ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{cleanupResult.message}</span>
              </div>
              
              {cleanupResult.success && cleanupResult.deletedCount > 0 && (
                <p className="text-sm mt-1">Deleted {cleanupResult.deletedCount} duplicate records.</p>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Setup Instructions</h3>
          <div className="prose prose-sm text-gray-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Airtable base at 
                <a 
                  href={`https://airtable.com/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center"
                >
                  airtable.com
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Create two tables with the exact names: <code className="bg-gray-200 px-1 rounded">WeightEntries</code> and <code className="bg-gray-200 px-1 rounded">Settings</code></li>
              <li>Add the fields as specified in the schemas below</li>
              <li><strong>Important:</strong> For Single Select fields, add all required options (click field → Customize → Add options)</li>
              <li>Make sure field names match exactly (case-sensitive)</li>
              <li>Once tables are created and configured, test the connection above</li>
            </ol>
          </div>
        </div>

        {/* Table Schemas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* WeightEntries Schema */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">WeightEntries Table</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2 font-medium text-gray-600 border-b pb-1">
                <span>Field Name</span>
                <span>Field Type</span>
              </div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Entry ID</span><span>Single line text</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Date</span><span>Date</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Weight</span><span>Number</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Notes</span><span>Long text</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Created At</span><span>Date</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Updated At</span><span>Date</span></div>
            </div>
          </div>

          {/* Settings Schema */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Settings Table</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2 font-medium text-gray-600 border-b pb-1">
                <span>Field Name</span>
                <span>Field Type & Options</span>
              </div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Name</span><span>Single line text</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Goal Weight</span><span>Number</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Start Weight</span><span>Number</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-green-50 px-1 rounded">Height Cm</span><span>Number</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-orange-50 px-1 rounded font-semibold">Weight Unit</span><span><strong>Single select</strong><br/>Options: lbs, kg</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-orange-50 px-1 rounded font-semibold">Date Format</span><span><strong>Single select</strong><br/>Options: MM/dd/yyyy, dd/MM/yyyy</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="font-mono bg-blue-50 px-1 rounded">Last Updated</span><span>Date</span></div>
            </div>
          </div>
        </div>

        {/* Field Names Checklist */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">⚠️ Current Issue: Single Select Field Options Missing</h3>
          <p className="text-orange-700 mb-3">The error indicates that Single Select fields need their options configured. Please set up the following:</p>
          
          <div className="space-y-4">
            <div className="bg-white border border-orange-200 rounded p-3">
              <h4 className="font-semibold text-orange-800 mb-2">Weight Unit Field:</h4>
              <ul className="text-orange-700 text-sm space-y-1 ml-4">
                <li>• Field type: <strong>Single select</strong></li>
                <li>• Add option: <code className="bg-orange-100 px-1 rounded font-mono">lbs</code></li>
                <li>• Add option: <code className="bg-orange-100 px-1 rounded font-mono">kg</code></li>
              </ul>
            </div>
            
            <div className="bg-white border border-orange-200 rounded p-3">
              <h4 className="font-semibold text-orange-800 mb-2">Date Format Field:</h4>
              <ul className="text-orange-700 text-sm space-y-1 ml-4">
                <li>• Field type: <strong>Single select</strong></li>
                <li>• Add option: <code className="bg-orange-100 px-1 rounded font-mono">MM/dd/yyyy</code></li>
                <li>• Add option: <code className="bg-orange-100 px-1 rounded font-mono">dd/MM/yyyy</code></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-orange-100 rounded">
            <p className="text-sm text-orange-800">
              <strong>How to add options:</strong> In Airtable, click on the field → Customize field type → Add the exact options listed above
            </p>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Critical Setup Requirements:</p>
              <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                <li><strong>Field names MUST match exactly</strong> (including spaces and capitalization)</li>
                <li>Table names must be exactly: <code className="bg-amber-100 px-1 rounded">WeightEntries</code> and <code className="bg-amber-100 px-1 rounded">Settings</code></li>
                <li>If you get &quot;UNKNOWN_FIELD_NAME&quot; errors, double-check field names</li>
                <li>The app will work offline without Airtable - your data is always saved locally</li>
                <li>Airtable sync provides cloud backup and cross-device access</li>
                <li>You can use your existing Airtable base - just add the required tables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};