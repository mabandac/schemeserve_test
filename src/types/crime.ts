export interface CrimeData {
  category: string;
  location_type: string;
  location: {
    latitude: string;
    longitude: string;
    street: {
      id: number;
      name: string;
    };
  };
  context: string;
  outcome_status: {
    category: string;
    date: string;
  } | null;
  persistent_id: string;
  id: number;
  location_subtype: string;
  month: string;
}

export interface CrimeSearchParams {
  postcodes: string[];
  date: string; // YYYY-MM format
}

export interface CrimeStats {
  totalCrimes: number;
  categoryBreakdown: Record<string, number>;
  outcomeBreakdown: Record<string, number>;
}

export interface CrimeFilter {
  postcode?: string;
  category?: string;
  outcome?: string;
}

export interface CrimeTableData extends CrimeData {
  postcode: string;
  displayDate: string;
  streetName: string;
}
