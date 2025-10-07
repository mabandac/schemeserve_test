import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { SearchState, PostcodeHistoryItem } from "../types/api";
import type { CrimeTableData } from "../types/crime";
import type { PostcodeSearchResult } from "../types/postcode";

interface SearchContextType extends SearchState {
  crimes: CrimeTableData[];
  validPostcodes: PostcodeSearchResult[];
  postcodeHistory: PostcodeHistoryItem[];
  searchTrigger: number; // Counter to trigger search without affecting query key
  setPostcodes: (postcodes: string[]) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCrimes: (crimes: CrimeTableData[]) => void;
  setValidPostcodes: (postcodes: PostcodeSearchResult[]) => void;
  addToHistory: (postcode: string) => void;
  removeFromHistory: (postcode: string) => void;
  clearHistory: () => void;
  triggerSearch: () => void; // Manual search trigger
}

type SearchAction =
  | { type: "SET_POSTCODES"; payload: string[] }
  | { type: "SET_DATE_FROM"; payload: string }
  | { type: "SET_DATE_TO"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Default to current month
const getDefaultDate = () => new Date().toISOString().slice(0, 7);


const initialState: SearchState = {
  postcodes: [],
  dateFrom: getDefaultDate(), // Start date of range
  dateTo: getDefaultDate(), // End date of range (same as start initially)
  isLoading: false,
  error: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_POSTCODES":
      return { ...state, postcodes: action.payload };
    case "SET_DATE_FROM":
      return { ...state, dateFrom: action.payload };
    case "SET_DATE_TO":
      return { ...state, dateTo: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [crimes, setCrimes] = useState<CrimeTableData[]>([]);
  const [validPostcodes, setValidPostcodes] = useState<PostcodeSearchResult[]>(
    []
  );
  const [postcodeHistory, setPostcodeHistory] = useState<PostcodeHistoryItem[]>(
    []
  );
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Track if we're initializing to prevent URL update loops
  const isInitializing = useRef(true);

  // Load postcode history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("postcodeHistory");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setPostcodeHistory(history);
      } catch (error) {
        console.error("Failed to load postcode history:", error);
      }
    }
  }, []);

  // Save postcode history to localStorage whenever it changes
  useEffect(() => {
    if (!isInitializing.current) {
      localStorage.setItem("postcodeHistory", JSON.stringify(postcodeHistory));
    }
  }, [postcodeHistory]);

  // Load search parameters from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postcodesParam = urlParams.get("postcodes");
    const dateFromParam = urlParams.get("dateFrom");
    const dateToParam = urlParams.get("dateTo");
    // Support legacy 'date' param
    const legacyDateParam = urlParams.get("date");

    if (postcodesParam) {
      const postcodes = postcodesParam.split(",").map((pc) => pc.trim());
      dispatch({ type: "SET_POSTCODES", payload: postcodes });
    }

    if (dateFromParam) {
      dispatch({ type: "SET_DATE_FROM", payload: dateFromParam });
    } else if (legacyDateParam) {
      dispatch({ type: "SET_DATE_FROM", payload: legacyDateParam });
    }

    if (dateToParam) {
      dispatch({ type: "SET_DATE_TO", payload: dateToParam });
    } else if (legacyDateParam) {
      dispatch({ type: "SET_DATE_TO", payload: legacyDateParam });
    }

    // Mark initialization as complete
    isInitializing.current = false;
  }, []);

  // Update URL when search parameters change (but not during initialization)
  useEffect(() => {
    if (isInitializing.current) return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Get current params
    const currentPostcodes = params.get("postcodes");
    const currentDateFrom = params.get("dateFrom");
    const currentDateTo = params.get("dateTo");

    // Calculate what params should be
    const newPostcodes =
      state.postcodes.length > 0 ? state.postcodes.join(",") : null;
    const newDateFrom = state.dateFrom || null;
    const newDateTo = state.dateTo || null;

    // Only update if something changed
    if (
      currentPostcodes !== newPostcodes ||
      currentDateFrom !== newDateFrom ||
      currentDateTo !== newDateTo
    ) {
      if (newPostcodes) {
        params.set("postcodes", newPostcodes);
      } else {
        params.delete("postcodes");
      }

      if (newDateFrom) {
        params.set("dateFrom", newDateFrom);
      } else {
        params.delete("dateFrom");
      }

      if (newDateTo) {
        params.set("dateTo", newDateTo);
      } else {
        params.delete("dateTo");
      }

      // Remove legacy 'date' param if it exists
      params.delete("date");

      window.history.replaceState({}, "", url.toString());
    }
  }, [state.postcodes, state.dateFrom, state.dateTo]);

  const addToHistory = useCallback(
    (postcode: string) => {
      const newItem: PostcodeHistoryItem = {
        postcode,
        searchDate: state.dateFrom, // Use dateFrom for history
        timestamp: Date.now(),
      };

      setPostcodeHistory((prev) => {
        const filtered = prev.filter((item) => item.postcode !== postcode);
        return [newItem, ...filtered].slice(0, 10); // Keep only last 10 searches
      });
    },
    [state.dateFrom]
  );

  const removeFromHistory = useCallback((postcode: string) => {
    setPostcodeHistory((prev) =>
      prev.filter((item) => item.postcode !== postcode)
    );
  }, []);

  const clearHistory = useCallback(() => {
    setPostcodeHistory([]);
  }, []);

  const setPostcodes = useCallback((postcodes: string[]) => {
    dispatch({ type: "SET_POSTCODES", payload: postcodes });
  }, []);

  const setDateFrom = useCallback((date: string) => {
    dispatch({ type: "SET_DATE_FROM", payload: date });
  }, []);

  const setDateTo = useCallback((date: string) => {
    dispatch({ type: "SET_DATE_TO", payload: date });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const triggerSearch = useCallback(() => {
    setSearchTrigger((prev) => prev + 1);
  }, []);

  const contextValue: SearchContextType = useMemo(
    () => ({
      ...state,
      crimes,
      validPostcodes,
      postcodeHistory,
      searchTrigger,
      setPostcodes,
      setDateFrom,
      setDateTo,
      setLoading,
      setError,
      setCrimes,
      setValidPostcodes,
      addToHistory,
      removeFromHistory,
      clearHistory,
      triggerSearch,
    }),
    [
      state,
      crimes,
      validPostcodes,
      postcodeHistory,
      searchTrigger,
      setCrimes,
      setValidPostcodes,
      addToHistory,
      removeFromHistory,
      clearHistory,
      triggerSearch,
    ]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
