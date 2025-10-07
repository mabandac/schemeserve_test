import { apiService } from "./api";
import type { CrimeStats, CrimeTableData } from "../types/crime";
import type { PostcodeSearchResult } from "../types/postcode";

export const crimeApi = {
  async getCrimeDataForPostcodes(
    postcodeResults: PostcodeSearchResult[],
    date: string
  ): Promise<CrimeTableData[]> {
    const validPostcodes = postcodeResults.filter((pc) => pc.valid);

    if (validPostcodes.length === 0) {
      return [];
    }

    const crimeDataPromises = validPostcodes.map(async (postcode) => {
      try {
        const crimes = await apiService.getCrimeData(
          postcode.latitude,
          postcode.longitude,
          date
        );

        return crimes.map((crime) => ({
          ...crime,
          postcode: postcode.postcode,
          displayDate: this.formatCrimeDate(crime.month),
          streetName: crime.location.street.name,
        }));
      } catch (error) {
        console.error(
          `Failed to fetch crime data for ${postcode.postcode}:`,
          error
        );
        return [];
      }
    });

    const allCrimeData = await Promise.all(crimeDataPromises);
    return allCrimeData.flat();
  },

  calculateStats(crimes: CrimeTableData[]): CrimeStats {
    const totalCrimes = crimes.length;

    const categoryBreakdown = crimes.reduce((acc, crime) => {
      acc[crime.category] = (acc[crime.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const outcomeBreakdown = crimes.reduce((acc, crime) => {
      const outcome = crime.outcome_status?.category || "Unknown";
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCrimes,
      categoryBreakdown,
      outcomeBreakdown,
    };
  },

  filterCrimes(
    crimes: CrimeTableData[],
    filters: {
      postcode?: string;
      category?: string;
      outcome?: string;
    }
  ): CrimeTableData[] {
    return crimes.filter((crime) => {
      if (filters.postcode && crime.postcode !== filters.postcode) {
        return false;
      }
      if (filters.category && crime.category !== filters.category) {
        return false;
      }
      if (filters.outcome) {
        const outcome = crime.outcome_status?.category || "Unknown";
        if (outcome !== filters.outcome) {
          return false;
        }
      }
      return true;
    });
  },

  formatCrimeDate(month: string): string {
    const date = new Date(month);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
    });
  },

  getUniqueValues(crimes: CrimeTableData[]): {
    postcodes: string[];
    categories: string[];
    outcomes: string[];
  } {
    const postcodes = [...new Set(crimes.map((c) => c.postcode))];
    const categories = [...new Set(crimes.map((c) => c.category))];
    const outcomes = [
      ...new Set(crimes.map((c) => c.outcome_status?.category || "Unknown")),
    ];

    return { postcodes, categories, outcomes };
  },
};
