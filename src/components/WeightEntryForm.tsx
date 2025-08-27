'use client';

import { UserSettings, WeightEntryForm } from '@/types';
import { validateWeightEntry } from '@/utils/calculations';
import { Calendar, FileText, Plus, Scale } from 'lucide-react';
import React, { useState } from 'react';

interface WeightEntryFormProps {
  onSubmit: (entry: { date: string; weight: number; notes?: string }) => void;
  settings: UserSettings;
  isLoading?: boolean;
}

export const WeightEntryFormComponent: React.FC<WeightEntryFormProps> = ({
  onSubmit,
  settings,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<WeightEntryForm>({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    weight: '',
    notes: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    // Validate the form data
    const validation = validateWeightEntry(formData.weight, formData.date);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        date: formData.date,
        weight: parseFloat(formData.weight),
        notes: formData.notes.trim() || undefined,
      });

      // Reset form after successful submission
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        notes: '',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setErrors(['Failed to save weight entry. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof WeightEntryForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Plus className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Add Weight Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Weight Input */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            <Scale className="h-4 w-4 inline mr-1" />
            Weight ({settings.weightUnit})
          </label>
          <input
            type="number"
            id="weight"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            step="0.1"
            min="0"
            max="1000"
            placeholder={`Enter weight in ${settings.weightUnit}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="h-4 w-4 inline mr-1" />
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Add any notes about your progress, diet, exercise, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.notes.length}/200 characters
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">
              <strong>Please fix the following errors:</strong>
              <ul className="mt-1 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Add Weight Entry'
          )}
        </button>
      </form>
    </div>
  );
};
