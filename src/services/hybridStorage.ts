import { WeightEntry, UserSettings } from '@/types';
import { weightEntriesStorage, userSettingsStorage } from '@/utils/storage';
import { AirtableService, AirtableConfig } from './airtable';

export class HybridStorageService {
  private airtableService: AirtableService | null = null;
  private syncQueue: Set<string> = new Set();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor(airtableConfig?: AirtableConfig) {
    if (airtableConfig && typeof window !== 'undefined') {
      this.airtableService = new AirtableService(airtableConfig);

      // Monitor online status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Periodic sync when online
      setInterval(() => {
        if (this.isOnline && this.airtableService) {
          this.processSyncQueue();
        }
      }, 30000);
    }
  }

  async addEntry(entryData: { date: string; weight: number; notes?: string }): Promise<WeightEntry> {
    const newEntry = weightEntriesStorage.add(entryData);
    this.queueSync('entries');
    return newEntry;
  }

  async updateEntry(id: string, updates: { date: string; weight: number; notes?: string }): Promise<WeightEntry | null> {
    const updatedEntry = weightEntriesStorage.update(id, updates);
    if (updatedEntry) {
      this.queueSync('entries');
    }
    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<boolean> {
    const success = weightEntriesStorage.delete(id);
    if (success) {
      this.queueSync('entries');
    }
    return success;
  }

  getEntries(): WeightEntry[] {
    return weightEntriesStorage.getAll();
  }

  async updateSettings(settings: UserSettings): Promise<void> {
    userSettingsStorage.save(settings);
    this.queueSync('settings');
  }

  getSettings(): UserSettings {
    return userSettingsStorage.get();
  }

  private queueSync(type: 'entries' | 'settings'): void {
    this.syncQueue.add(type);
    
    if (this.isOnline && this.airtableService) {
      setTimeout(() => this.processSyncQueue(), 1000);
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.airtableService || !this.isOnline || this.syncQueue.size === 0) {
      return;
    }

    const queueCopy = new Set(this.syncQueue);
    this.syncQueue.clear();

    try {
      if (queueCopy.has('entries')) {
        const entries = this.getEntries();
        await this.airtableService.syncWeightEntries(entries);
      }

      if (queueCopy.has('settings')) {
        const settings = this.getSettings();
        await this.airtableService.syncSettings(settings);
      }

      console.log('✅ Data synced to Airtable successfully');
    } catch (error) {
      console.error('❌ Failed to sync to Airtable:', error);
      queueCopy.forEach(item => this.syncQueue.add(item));
    }
  }

  async recoverFromAirtable(): Promise<{ entries: WeightEntry[], settings: UserSettings | null }> {
    if (!this.airtableService) {
      throw new Error('Airtable service not configured');
    }

    try {
      const [entries, settings] = await Promise.all([
        this.airtableService.getWeightEntries(),
        this.airtableService.getSettings(),
      ]);

      // Update local storage with recovered data
      if (entries.length > 0) {
        weightEntriesStorage.saveAll(entries);
      }

      if (settings) {
        userSettingsStorage.save(settings);
      }

      return { entries, settings };
    } catch (error) {
      console.error('Failed to recover data from Airtable:', error);
      throw error;
    }
  }

  async forceSyncToAirtable(): Promise<void> {
    this.queueSync('entries');
    this.queueSync('settings');
    await this.processSyncQueue();
  }

  getSyncStatus(): { isPending: boolean; isOnline: boolean; hasAirtable: boolean } {
    return {
      isPending: this.syncQueue.size > 0,
      isOnline: this.isOnline,
      hasAirtable: this.airtableService !== null,
    };
  }
}