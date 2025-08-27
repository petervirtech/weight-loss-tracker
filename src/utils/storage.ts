import { ExportData, UserSettings, WeightEntry } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  WEIGHT_ENTRIES: "weight-tracker-entries",
  USER_SETTINGS: "weight-tracker-settings",
} as const;

// Default user settings
export const DEFAULT_USER_SETTINGS: UserSettings = {
  name: "",
  weightUnit: "lbs",
  dateFormat: "MM/dd/yyyy",
};

// Weight Entries Storage
export const weightEntriesStorage = {
  // Get all weight entries
  getAll(): WeightEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading weight entries from localStorage:", error);
      return [];
    }
  },

  // Save all weight entries
  saveAll(entries: WeightEntry[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.WEIGHT_ENTRIES,
        JSON.stringify(entries)
      );
    } catch (error) {
      console.error("Error saving weight entries to localStorage:", error);
      throw new Error("Failed to save weight entries");
    }
  },

  // Add a new weight entry
  add(entry: Omit<WeightEntry, "id" | "createdAt" | "updatedAt">): WeightEntry {
    const entries = this.getAll();
    const now = new Date().toISOString();

    const newEntry: WeightEntry = {
      ...entry,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    entries.push(newEntry);
    this.saveAll(entries);
    return newEntry;
  },

  // Update an existing weight entry
  update(
    id: string,
    updates: Partial<Pick<WeightEntry, "date" | "weight" | "notes">>
  ): WeightEntry | null {
    const entries = this.getAll();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return null;
    }

    const updatedEntry: WeightEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updatedEntry;
    this.saveAll(entries);
    return updatedEntry;
  },

  // Delete a weight entry
  delete(id: string): boolean {
    const entries = this.getAll();
    const filteredEntries = entries.filter((entry) => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      return false; // Entry not found
    }

    this.saveAll(filteredEntries);
    return true;
  },

  // Get entry by ID
  getById(id: string): WeightEntry | null {
    const entries = this.getAll();
    return entries.find((entry) => entry.id === id) || null;
  },

  // Clear all entries
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_ENTRIES);
  },
};

// User Settings Storage
export const userSettingsStorage = {
  // Get user settings
  get(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data
        ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(data) }
        : DEFAULT_USER_SETTINGS;
    } catch (error) {
      console.error("Error reading user settings from localStorage:", error);
      return DEFAULT_USER_SETTINGS;
    }
  },

  // Save user settings
  save(settings: UserSettings): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Error saving user settings to localStorage:", error);
      throw new Error("Failed to save user settings");
    }
  },

  // Update partial settings
  update(updates: Partial<UserSettings>): UserSettings {
    const currentSettings = this.get();
    const updatedSettings = { ...currentSettings, ...updates };
    this.save(updatedSettings);
    return updatedSettings;
  },

  // Clear settings
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  },
};

// Data Export/Import utilities
export const dataStorage = {
  // Export all data
  exportData(): ExportData {
    return {
      entries: weightEntriesStorage.getAll(),
      settings: userSettingsStorage.get(),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };
  },

  // Import data
  importData(data: ExportData): void {
    try {
      // Validate data structure
      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error("Invalid entries data");
      }

      if (!data.settings || typeof data.settings !== "object") {
        throw new Error("Invalid settings data");
      }

      // Backup current data before import
      const backup = this.exportData();

      try {
        // Import entries
        weightEntriesStorage.saveAll(data.entries);

        // Import settings
        userSettingsStorage.save({
          ...DEFAULT_USER_SETTINGS,
          ...data.settings,
        });
      } catch (importError) {
        // Restore backup if import fails
        weightEntriesStorage.saveAll(backup.entries);
        userSettingsStorage.save(backup.settings);
        throw importError;
      }
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Failed to import data: " + (error as Error).message);
    }
  },

  // Clear all data
  clearAll(): void {
    weightEntriesStorage.clear();
    userSettingsStorage.clear();
  },
};

// Helper function to check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
