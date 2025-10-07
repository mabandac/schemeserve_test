import { useState, useMemo } from "react";
import { Container, Table, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { useSearch } from "../../contexts/SearchContext";
import { useFilteredCrimes } from "../../hooks/useCrimeData";
import type { CrimeTableData } from "../../types/crime";

export function CrimeTable() {
  const { crimes } = useSearch();
  const [filters, setFilters] = useState({
    postcode: "",
    category: "",
    outcome: "",
  });
  const [sortField, setSortField] = useState<keyof CrimeTableData>("month");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredCrimes = useFilteredCrimes(crimes, filters);

  const sortedCrimes = useMemo(() => {
    return [...filteredCrimes].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCrimes, sortField, sortDirection]);

  const uniqueValues = useMemo(() => {
    const postcodes = [...new Set(crimes.map((c) => c.postcode))];
    const categories = [...new Set(crimes.map((c) => c.category))];
    const outcomes = [
      ...new Set(crimes.map((c) => c.outcome_status?.category || "Unknown")),
    ];

    return { postcodes, categories, outcomes };
  }, [crimes]);

  const handleSort = (field: keyof CrimeTableData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilter = (
    type: "postcode" | "category" | "outcome",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ postcode: "", category: "", outcome: "" });
  };

  if (crimes.length === 0) {
    return (
      <Container className="my-4">
        <h2>Crime Data</h2>
        <Alert variant="info" className="mt-3">
          No crime data available. Please search for postcodes to see crime
          details.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          Crime Data - {filteredCrimes.length} crime(s)
        </h2>
        <Button variant="secondary" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Filters */}
      <Form className="mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Postcode</Form.Label>
              <Form.Select
                value={filters.postcode}
                onChange={(e) => handleFilter("postcode", e.target.value)}
              >
                <option value="">All Postcodes</option>
                {uniqueValues.postcodes.map((postcode) => (
                  <option key={postcode} value={postcode}>
                    {postcode}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Category</Form.Label>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilter("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueValues.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Outcome</Form.Label>
              <Form.Select
                value={filters.outcome}
                onChange={(e) => handleFilter("outcome", e.target.value)}
              >
                <option value="">All Outcomes</option>
                {uniqueValues.outcomes.map((outcome) => (
                  <option key={outcome} value={outcome}>
                    {outcome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("postcode")}
              >
                Postcode{" "}
                {sortField === "postcode" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("month")}
              >
                Date{" "}
                {sortField === "month" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("streetName")}
              >
                Street{" "}
                {sortField === "streetName" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortField === "category" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {sortedCrimes.map((crime) => (
              <tr key={crime.id}>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleFilter("postcode", crime.postcode)}
                    className="p-0 text-decoration-none"
                  >
                    {crime.postcode}
                  </Button>
                </td>
                <td>{crime.displayDate}</td>
                <td>{crime.streetName}</td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleFilter("category", crime.category)}
                    className="p-0 text-decoration-none"
                  >
                    {crime.category}
                  </Button>
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      handleFilter(
                        "outcome",
                        crime.outcome_status?.category || "Unknown"
                      )
                    }
                    className="p-0 text-decoration-none"
                  >
                    {crime.outcome_status?.category || "Unknown"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {sortedCrimes.length === 0 && (
        <Alert variant="warning">
          No crimes match the current filters.
        </Alert>
      )}
    </Container>
  );
}
