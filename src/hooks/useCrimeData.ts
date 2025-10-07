import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { postcodeApi } from "../services/postcodeApi";
import { crimeApi } from "../services/crimeApi";
import { useSearch } from "../contexts/SearchContext";
import type { CrimeTableData } from "../types/crime";

// Generate array of months between two dates (YYYY-MM format)
function getMonthsBetween(startDate: string, endDate: string): string[] {
  const months: string[] = [];
  const start = new Date(startDate + "-01");
  const end = new Date(endDate + "-01");

  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export function useCrimeData() {
  const {
    postcodes,
    dateFrom,
    dateTo,
    searchTrigger,
    setCrimes,
    setValidPostcodes,
    setError,
    setLoading,
  } = useSearch();

  const {
    data: crimeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["crimeData", postcodes, searchTrigger],
    queryFn: async () => {
      if (postcodes.length === 0) {
        return { crimes: [], validPostcodes: [] };
      }

      // Validate postcodes first
      const validPostcodes = await postcodeApi.validateMultiplePostcodes(
        postcodes
      );
      const validResults = validPostcodes.filter((pc) => pc.valid);

      if (validResults.length === 0) {
        throw new Error("No valid postcodes provided");
      }

      // Generate array of months to query
      const months = getMonthsBetween(dateFrom, dateTo);

      // Fetch crime data for each month and each postcode
      const allCrimes: CrimeTableData[] = [];

      for (const month of months) {
        const monthCrimes = await crimeApi.getCrimeDataForPostcodes(
          validResults,
          month
        );
        allCrimes.push(...monthCrimes);
      }

      return { crimes: allCrimes, validPostcodes: validResults };
    },
    enabled: postcodes.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Update context when data changes
  useEffect(() => {
    if (crimeData) {
      setCrimes(crimeData.crimes);
      setValidPostcodes(crimeData.validPostcodes);
    }
  }, [crimeData, setCrimes, setValidPostcodes]);

  // Update loading state in context
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Update error in context
  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } else {
      setError(null);
    }
  }, [error, setError]);

  return {
    crimes: crimeData?.crimes || [],
    validPostcodes: crimeData?.validPostcodes || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting crime statistics
export function useCrimeStats(crimes: CrimeTableData[]) {
  return useMemo(() => {
    return crimeApi.calculateStats(crimes);
  }, [crimes]);
}

// Hook for filtering crimes
export function useFilteredCrimes(
  crimes: CrimeTableData[],
  filters: {
    postcode?: string;
    category?: string;
    outcome?: string;
  }
) {
  return useMemo(() => {
    return crimeApi.filterCrimes(crimes, filters);
  }, [crimes, filters]);
}
