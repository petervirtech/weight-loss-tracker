'use client';

import { UserSettings, WeightEntry, WeightEntryForm } from '@/types';
import { formatDate, formatWeight, sortEntriesByDate, validateWeightEntry } from '@/utils/calculations';
import { ChevronDown, ChevronUp, Edit2, History, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface WeightHistoryTableProps {
  entries: WeightEntry[];
  settings: UserSettings;
  onUpdateEntry: (id: string, updates: { date: string; weight: number; notes?: string }) => void;
  onDeleteEntry: (id: string) => void;
  isLoading?: boolean;
}

export const WeightHistoryTable: React.FC<WeightHistoryTableProps> = ({
  entries,
  settings,
  onUpdateEntry,
  onDeleteEntry,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WeightEntryForm>({
    date: '',
    weight: '',
    notes: '',
  });
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort entries
  const sortedEntries = sortEntriesByDate(entries, sortOrder);

  const startEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date,
      weight: entry.weight.toString(),
      notes: entry.notes || '',
    });
    setEditErrors([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', weight: '', notes: '' });
    setEditErrors([]);
  };

  const saveEdit = () => {
    if (!editingId) return;

    // Validate the form data
    const validation = validateWeightEntry(editForm.weight, editForm.date);

    if (!validation.isValid) {
      setEditErrors(validation.errors);
      return;
    }

    try {
      onUpdateEntry(editingId, {
        date: editForm.date,
        weight: parseFloat(editForm.weight),
        notes: editForm.notes.trim() || undefined,
      });

      cancelEdit();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setEditErrors(['Failed to update entry. Please try again.']);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      onDeleteEntry(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const calculateChange = (currentEntry: WeightEntry, previousEntry?: WeightEntry): string => {
    if (!previousEntry) return '';

    const change = currentEntry.weight - previousEntry.weight;
    const changeStr = formatWeight(Math.abs(change), settings.weightUnit);

    if (change > 0) {
      return `+${changeStr}`;
    } else if (change < 0) {
      return `-${changeStr}`;
    }
    return '0';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <History className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Weight History</h2>
        </div>
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No weight entries yet. Add your first entry above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <History className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Weight History</h2>
          <span className="ml-2 text-sm text-gray-500">({entries.length} entries)</span>
        </div>

        <button
          onClick={toggleSortOrder}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Sort by Date
          {sortOrder === 'desc' ? (
            <ChevronDown className="h-4 w-4 ml-1" />
          ) : (
            <ChevronUp className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEntries.map((entry, index) => {
              const previousEntry = sortOrder === 'desc'
                ? sortedEntries[index + 1]
                : sortedEntries[index - 1];
              const isEditing = editingId === entry.id;

              return (
                <tr key={entry.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  {/* Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      formatDate(entry.date, settings.dateFormat)
                    )}
                  </td>

                  {/* Weight Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          value={editForm.weight}
                          onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                          step="0.1"
                          min="0"
                          max="1000"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="ml-1 text-xs text-gray-500">{settings.weightUnit}</span>
                      </div>
                    ) : (
                      formatWeight(entry.weight, settings.weightUnit)
                    )}
                  </td>

                  {/* Change Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className={`font-medium ${
                        calculateChange(entry, previousEntry).startsWith('+')
                          ? 'text-red-600'
                          : calculateChange(entry, previousEntry).startsWith('-')
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {calculateChange(entry, previousEntry) || '-'}
                      </span>
                    )}
                  </td>

                  {/* Notes Column */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        maxLength={200}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        placeholder="Notes..."
                      />
                    ) : (
                      <div className="max-w-xs truncate" title={entry.notes}>
                        {entry.notes || '-'}
                      </div>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors"
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Cancel editing"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                          title="Edit entry"
                          disabled={isLoading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                          title="Delete entry"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Errors */}
      {editErrors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-red-800 text-sm">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {editErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
