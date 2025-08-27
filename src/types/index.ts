// Types for the Weight Loss Tracker Application

export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight: number; // in pounds or kilograms
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface UserSettings {
  name: string;
  goalWeight?: number;
  startWeight?: number;
  heightCm?: number;
  weightUnit: "lbs" | "kg";
  dateFormat: "MM/dd/yyyy" | "dd/MM/yyyy";
}

export interface WeightStats {
  totalLoss: number;
  currentWeight: number;
  startWeight: number;
  goalWeight?: number;
  progressPercentage: number;
  averageWeeklyLoss: number;
  daysTracking: number;
  bmi?: number;
  bmiCategory?: "Underweight" | "Normal" | "Overweight" | "Obese";
}

export interface ChartDataPoint {
  date: string;
  weight: number;
  goalWeight?: number;
}

export type SortOrder = "asc" | "desc";

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  sortBy: "date" | "weight";
  sortOrder: SortOrder;
}

// Form types
export interface WeightEntryForm {
  date: string;
  weight: string; // string for form input
  notes: string;
}

export interface UserSettingsForm {
  name: string;
  goalWeight: string;
  startWeight: string;
  heightCm: string;
  weightUnit: "lbs" | "kg";
  dateFormat: "MM/dd/yyyy" | "dd/MM/yyyy";
}

// Application state
export interface AppState {
  entries: WeightEntry[];
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

// API responses
export interface ExportData {
  entries: WeightEntry[];
  settings: UserSettings;
  exportDate: string;
  version: string;
}
