import type { CrimeData } from "./crime";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

export interface SearchState {
  postcodes: string[];
  dateFrom: string; // Start of date range (YYYY-MM)
  dateTo: string; // End of date range (YYYY-MM)
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface PostcodeHistoryItem {
  postcode: string;
  searchDate: string;
  timestamp: number;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  crime: CrimeData;
  postcode: string;
}
