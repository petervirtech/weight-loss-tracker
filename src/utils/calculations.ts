import {
  ChartDataPoint,
  UserSettings,
  WeightEntry,
  WeightStats,
} from "@/types";
import { differenceInDays, format, parseISO, startOfWeek } from "date-fns";

// BMI Calculation
export const calculateBMI = (
  weight: number,
  heightCm: number,
  weightUnit: "lbs" | "kg"
): number => {
  const heightMeters = heightCm / 100;
  const weightKg = weightUnit === "lbs" ? weight * 0.453592 : weight;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
};

// BMI Category
export const getBMICategory = (
  bmi: number
): "Underweight" | "Normal" | "Overweight" | "Obese" => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

// Convert weight between units
export const convertWeight = (
  weight: number,
  fromUnit: "lbs" | "kg",
  toUnit: "lbs" | "kg"
): number => {
  if (fromUnit === toUnit) return weight;

  if (fromUnit === "lbs" && toUnit === "kg") {
    return Number((weight * 0.453592).toFixed(1));
  }

  if (fromUnit === "kg" && toUnit === "lbs") {
    return Number((weight * 2.20462).toFixed(1));
  }

  return weight;
};

// Sort weight entries by date
export const sortEntriesByDate = (
  entries: WeightEntry[],
  order: "asc" | "desc" = "desc"
): WeightEntry[] => {
  return [...entries].sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
};

// Get latest weight entry
export const getLatestEntry = (entries: WeightEntry[]): WeightEntry | null => {
  if (entries.length === 0) return null;
  const sorted = sortEntriesByDate(entries, "desc");
  return sorted[0];
};

// Get earliest weight entry
export const getEarliestEntry = (
  entries: WeightEntry[]
): WeightEntry | null => {
  if (entries.length === 0) return null;
  const sorted = sortEntriesByDate(entries, "asc");
  return sorted[0];
};

// Calculate weight statistics
export const calculateWeightStats = (
  entries: WeightEntry[],
  settings: UserSettings
): WeightStats => {
  const sortedEntries = sortEntriesByDate(entries, "asc");

  if (sortedEntries.length === 0) {
    return {
      totalLoss: 0,
      currentWeight: 0,
      startWeight: settings.startWeight || 0,
      goalWeight: settings.goalWeight,
      progressPercentage: 0,
      averageWeeklyLoss: 0,
      daysTracking: 0,
    };
  }

  const earliestEntry = sortedEntries[0];
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  const startWeight = settings.startWeight || earliestEntry.weight;
  const currentWeight = latestEntry.weight;
  const totalLoss = startWeight - currentWeight;

  const startDate = parseISO(earliestEntry.date);
  const endDate = parseISO(latestEntry.date);
  const daysTracking = differenceInDays(endDate, startDate) + 1;

  const weeksTracking = daysTracking / 7;
  const averageWeeklyLoss = weeksTracking > 0 ? totalLoss / weeksTracking : 0;

  let progressPercentage = 0;
  if (settings.goalWeight && settings.goalWeight !== startWeight) {
    const goalDifference = startWeight - settings.goalWeight;
    progressPercentage =
      goalDifference !== 0 ? (totalLoss / goalDifference) * 100 : 0;
  }

  let bmi: number | undefined;
  let bmiCategory:
    | "Underweight"
    | "Normal"
    | "Overweight"
    | "Obese"
    | undefined;

  if (settings.heightCm) {
    bmi = calculateBMI(currentWeight, settings.heightCm, settings.weightUnit);
    bmiCategory = getBMICategory(bmi);
  }

  return {
    totalLoss: Number(totalLoss.toFixed(1)),
    currentWeight: Number(currentWeight.toFixed(1)),
    startWeight: Number(startWeight.toFixed(1)),
    goalWeight: settings.goalWeight,
    progressPercentage: Number(progressPercentage.toFixed(1)),
    averageWeeklyLoss: Number(averageWeeklyLoss.toFixed(2)),
    daysTracking,
    bmi,
    bmiCategory,
  };
};

// Prepare chart data
export const prepareChartData = (
  entries: WeightEntry[],
  settings: UserSettings
): ChartDataPoint[] => {
  const sortedEntries = sortEntriesByDate(entries, "asc");

  return sortedEntries.map((entry) => ({
    date: entry.date,
    weight: entry.weight,
    goalWeight: settings.goalWeight,
  }));
};

// Get weekly averages
export const getWeeklyAverages = (entries: WeightEntry[]): ChartDataPoint[] => {
  const sortedEntries = sortEntriesByDate(entries, "asc");
  const weeklyData: { [weekKey: string]: { weights: number[]; date: string } } =
    {};

  sortedEntries.forEach((entry) => {
    const date = parseISO(entry.date);
    const weekStart = startOfWeek(date);
    const weekKey = format(weekStart, "yyyy-MM-dd");

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { weights: [], date: weekKey };
    }

    weeklyData[weekKey].weights.push(entry.weight);
  });

  return Object.values(weeklyData).map((week) => ({
    date: week.date,
    weight: Number(
      (
        week.weights.reduce((sum, weight) => sum + weight, 0) /
        week.weights.length
      ).toFixed(1)
    ),
  }));
};

// Filter entries by date range
export const filterEntriesByDateRange = (
  entries: WeightEntry[],
  startDate?: string,
  endDate?: string
): WeightEntry[] => {
  return entries.filter((entry) => {
    const entryDate = parseISO(entry.date);

    if (startDate && entryDate < parseISO(startDate)) {
      return false;
    }

    if (endDate && entryDate > parseISO(endDate)) {
      return false;
    }

    return true;
  });
};

// Format weight with unit
export const formatWeight = (weight: number, unit: "lbs" | "kg"): string => {
  return `${weight.toFixed(1)} ${unit}`;
};

// Format date according to user preference
export const formatDate = (
  date: string,
  format: "MM/dd/yyyy" | "dd/MM/yyyy"
): string => {
  const parsedDate = parseISO(date);

  if (format === "dd/MM/yyyy") {
    return parsedDate.toLocaleDateString("en-GB");
  }

  return parsedDate.toLocaleDateString("en-US");
};

// Validate weight entry
export const validateWeightEntry = (
  weight: string,
  date: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate weight
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    errors.push("Weight must be a positive number");
  } else if (weightNum > 1000) {
    errors.push("Weight seems unrealistic (over 1000)");
  }

  // Validate date
  const entryDate = parseISO(date);
  const today = new Date();
  if (isNaN(entryDate.getTime())) {
    errors.push("Invalid date format");
  } else if (entryDate > today) {
    errors.push("Date cannot be in the future");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
