import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Container, Navbar } from "react-bootstrap";
import { SearchProvider } from "./contexts/SearchContext";
import { useCrimeData } from "./hooks/useCrimeData";
import { SearchBar } from "./components/SearchBar/SearchBar";
import { CrimeOverview } from "./components/CrimeOverview/CrimeOverview";
import { CrimeTable } from "./components/CrimeTable/CrimeTable";
import { CrimeMap } from "./components/CrimeMap/CrimeMap";
import { PostcodeHistory } from "./components/PostcodeHistory/PostcodeHistory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  // Fetch crime data when postcodes/date changes
  useCrimeData();

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand className="fs-3 fw-bold">
            UK Crime Dashboard
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid>
        <SearchBar />
        <PostcodeHistory />
        <CrimeOverview />
        <CrimeTable />
        <CrimeMap />
      </Container>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
