import { WeightEntry, UserSettings } from '@/types';

export interface AirtableConfig {
  baseId: string;
  tableName: string;
  apiKey: string;
}

export class AirtableService {
  private config: AirtableConfig;
  private baseUrl: string;

  constructor(config: AirtableConfig) {
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        throw new Error(`Airtable table '${this.config.tableName}' not found. Please create the table in your Airtable base first.`);
      }
      throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async syncWeightEntries(entries: WeightEntry[]): Promise<void> {
    try {
      // Get existing records
      const existing = await this.getWeightEntries();
      const existingIds = new Set(existing.map(e => e.id));

      // Create new records
      const toCreate = entries.filter(e => !existingIds.has(e.id));
      
      if (toCreate.length > 0) {
        await this.createWeightEntries(toCreate);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn('Cannot sync weight entries: Airtable table not found. Please create the required tables in your Airtable base.');
        throw new Error('Airtable tables not found. Please set up your Airtable base with the required tables first.');
      }
      console.error('Failed to sync weight entries to Airtable:', error);
      throw error;
    }
  }

  async getWeightEntries(): Promise<WeightEntry[]> {
    try {
      const response = await this.makeRequest(`${this.config.tableName}`);
      return response.records.map((record: { id: string; fields: Record<string, string | number | boolean> }) => ({
        id: record.fields['Entry ID'] || record.id,
        date: record.fields.Date as string,
        weight: record.fields.Weight as number,
        notes: record.fields.Notes as string,
        createdAt: record.fields['Created At'] as string || new Date().toISOString(),
        updatedAt: record.fields['Updated At'] as string || new Date().toISOString(),
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn(`Airtable table '${this.config.tableName}' not found. Returning empty array.`);
        return [];
      }
      console.error('Failed to fetch weight entries from Airtable:', error);
      return [];
    }
  }

  private async createWeightEntries(entries: WeightEntry[]): Promise<void> {
    const records = entries.map(entry => ({
      fields: {
        'Entry ID': entry.id,
        Date: entry.date,
        Weight: entry.weight,
        Notes: entry.notes || '',
        'Created At': entry.createdAt,
        'Updated At': entry.updatedAt,
      },
    }));

    // Airtable allows max 10 records per batch
    const batches = this.chunkArray(records, 10);
    
    for (const batch of batches) {
      try {
        await this.makeRequest(this.config.tableName, {
          method: 'POST',
          body: JSON.stringify({ records: batch }),
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('UNKNOWN_FIELD_NAME')) {
          throw new Error(`Field name mismatch in ${this.config.tableName} table. Please ensure all field names are created exactly as specified in the setup guide.`);
        }
        throw error;
      }
    }
  }

  async syncSettings(settings: UserSettings): Promise<void> {
    try {
      // First, check if a settings record already exists
      const existingResponse = await this.makeRequest('Settings?maxRecords=1');
      
      const record = {
        fields: {
          Name: settings.name,
          'Goal Weight': settings.goalWeight,
          'Start Weight': settings.startWeight,
          'Height Cm': settings.heightCm,
          'Weight Unit': settings.weightUnit,
          'Date Format': settings.dateFormat,
          'Last Updated': new Date().toISOString(),
        },
      };

      if (existingResponse.records && existingResponse.records.length > 0) {
        // Update existing record
        const existingRecordId = existingResponse.records[0].id;
        await this.makeRequest(`Settings/${existingRecordId}`, {
          method: 'PATCH',
          body: JSON.stringify({ fields: record.fields }),
        });
        console.log('Settings updated in Airtable');
      } else {
        // Create new record if none exists
        await this.makeRequest('Settings', {
          method: 'POST',
          body: JSON.stringify({ records: [record] }),
        });
        console.log('Settings created in Airtable');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          console.warn('Cannot sync settings: Airtable Settings table not found. Please create the required tables in your Airtable base.');
          throw new Error('Airtable Settings table not found. Please set up your Airtable base first.');
        }
        if (error.message.includes('UNKNOWN_FIELD_NAME')) {
          console.warn('Field name mismatch in Settings table. Please check field names match exactly.');
          throw new Error('Field name mismatch in Settings table. Please ensure all field names are created exactly as specified in the setup guide.');
        }
        if (error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
          console.warn('Single select field options not configured properly in Settings table.');
          throw new Error('Single select field options missing. Please add the required options to "Weight Unit" and "Date Format" fields in your Settings table.');
        }
      }
      console.error('Failed to sync settings to Airtable:', error);
      throw error;
    }
  }

  async getSettings(): Promise<UserSettings | null> {
    try {
      const response = await this.makeRequest('Settings?maxRecords=1');
      if (response.records.length === 0) return null;

      const record = response.records[0];
      return {
        name: record.fields.Name as string || '',
        goalWeight: record.fields['Goal Weight'] as number,
        startWeight: record.fields['Start Weight'] as number,
        heightCm: record.fields['Height Cm'] as number,
        weightUnit: (record.fields['Weight Unit'] as 'lbs' | 'kg') || 'lbs',
        dateFormat: (record.fields['Date Format'] as 'MM/dd/yyyy' | 'dd/MM/yyyy') || 'MM/dd/yyyy',
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.warn('Airtable Settings table not found. Returning null.');
        return null;
      }
      console.error('Failed to fetch settings from Airtable:', error);
      return null;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Helper method to get setup instructions
  static getSetupInstructions(): { weightTableSchema: string; settingsTableSchema: string; instructions: string } {
    return {
      weightTableSchema: `
WeightEntries Table Schema:
- Entry ID (Single line text)
- Date (Date)
- Weight (Number)
- Notes (Long text)
- Created At (Date)
- Updated At (Date)`,
      
      settingsTableSchema: `
Settings Table Schema:
- Name (Single line text)
- Goal Weight (Number)
- Start Weight (Number)
- Height Cm (Number)
- Weight Unit (Single select: lbs, kg)
- Date Format (Single select: MM/dd/yyyy, dd/MM/yyyy)
- Last Updated (Date)`,
      
      instructions: `
To set up your Airtable base for the Weight Loss Tracker:

1. Go to your Airtable base: https://airtable.com/
2. Create two tables with the exact names: 'WeightEntries' and 'Settings'
3. Add the fields as specified in the schemas above
4. Make sure field names match exactly (case-sensitive)
5. Once tables are created, the app will automatically sync your data

Note: The app will work offline without Airtable, but sync functionality requires properly configured tables.`
    };
  }

  // Method to test connection and table existence
  async testConnection(): Promise<{ success: boolean; message: string; missingTables: string[] }> {
    const missingTables: string[] = [];
    let message = 'Connection successful! All tables found.';
    
    try {
      // Test WeightEntries table
      try {
        await this.makeRequest(`${this.config.tableName}?maxRecords=1`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          missingTables.push(this.config.tableName);
        } else {
          throw error;
        }
      }

      // Test Settings table
      try {
        await this.makeRequest('Settings?maxRecords=1');
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          missingTables.push('Settings');
        } else {
          throw error;
        }
      }

      if (missingTables.length > 0) {
        message = `Missing tables: ${missingTables.join(', ')}. Please create them in your Airtable base.`;
        return { success: false, message, missingTables };
      }

      return { success: true, message, missingTables };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        missingTables 
      };
    }
  }

  // Method to clean up duplicate settings records
  async cleanupDuplicateSettings(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
      // Get all settings records
      const response = await this.makeRequest('Settings');
      
      if (!response.records || response.records.length <= 1) {
        return { success: true, message: 'No duplicate records found.', deletedCount: 0 };
      }

      // Keep the most recent record (last in array) and delete the rest
      const recordsToDelete = response.records.slice(0, -1);
      const recordIdsToDelete = recordsToDelete.map((record: { id: string }) => record.id);

      // Delete records in batches (Airtable allows max 10 per batch)
      const batches = this.chunkArray(recordIdsToDelete, 10);
      
      for (const batch of batches) {
        const deleteRequests = batch.map(id => ({ id }));
        await this.makeRequest('Settings', {
          method: 'DELETE',
          body: JSON.stringify({ records: deleteRequests }),
        });
      }

      return { 
        success: true, 
        message: `Successfully deleted ${recordIdsToDelete.length} duplicate records.`, 
        deletedCount: recordIdsToDelete.length 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to cleanup duplicate records',
        deletedCount: 0 
      };
    }
  }
}