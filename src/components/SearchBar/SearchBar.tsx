import { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputGroup,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useSearch } from "../../contexts/SearchContext";
import { useDebounce } from "../../hooks/useDebounce";
import { postcodeApi } from "../../services/postcodeApi";

export function SearchBar() {
  const {
    postcodes,
    dateFrom,
    dateTo,
    setPostcodes,
    setDateFrom,
    setDateTo,
    isLoading,
    error,
    triggerSearch,
  } = useSearch();
  const [inputValue, setInputValue] = useState(postcodes.join(", "));
  const [validationError, setValidationError] = useState<string | null>(null);

  const debouncedInput = useDebounce(inputValue, 300);

  // Update input when postcodes change from URL
  useEffect(() => {
    setInputValue(postcodes.join(", "));
  }, [postcodes]);

  // Validate postcodes when input changes
  useEffect(() => {
    if (debouncedInput.trim()) {
      const parsedPostcodes = postcodeApi.parsePostcodeInput(debouncedInput);
      if (parsedPostcodes.length === 0) {
        setValidationError("Please enter at least one valid postcode");
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [debouncedInput]);

  const handleSearch = async () => {
    if (!debouncedInput.trim()) {
      setValidationError("Please enter at least one postcode");
      return;
    }

    const parsedPostcodes = postcodeApi.parsePostcodeInput(debouncedInput);
    if (parsedPostcodes.length === 0) {
      setValidationError("Please enter at least one valid postcode");
      return;
    }

    setPostcodes(parsedPostcodes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    // Trigger search if we already have postcodes
    if (postcodes.length > 0) {
      triggerSearch();
    }
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    // Trigger search if we already have postcodes
    if (postcodes.length > 0) {
      triggerSearch();
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-3">Search Crime Data</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          {/* Postcode Input */}
          <Col md={6}>
            <Form.Group>
              <Form.Label htmlFor="postcode-input">
                Postcodes (comma-separated)
              </Form.Label>
              <InputGroup>
                <Form.Control
                  id="postcode-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., SW1A 1AA, M1 1AA"
                  disabled={isLoading}
                  isInvalid={!!validationError}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !!validationError}
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </InputGroup>
              {validationError && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{ display: "block" }}
                >
                  {validationError}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          {/* Date Range Inputs */}
          <Col md={3}>
            <Form.Group>
              <Form.Label htmlFor="date-from-input">From (YYYY-MM)</Form.Label>
              <Form.Control
                id="date-from-input"
                type="month"
                value={dateFrom}
                onChange={handleDateFromChange}
                disabled={isLoading}
                min="2020-01"
                max="2025-12"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label htmlFor="date-to-input">To (YYYY-MM)</Form.Label>
              <Form.Control
                id="date-to-input"
                type="month"
                value={dateTo}
                onChange={handleDateToChange}
                disabled={isLoading}
                min={dateFrom}
                max="2025-12"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            <Form.Text className="text-muted">
              Note: UK Police data is typically 1-2 months behind. You
              can select both month and year using the date pickers above.
            </Form.Text>
          </Col>
        </Row>

        {/* Error Display */}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Search Info */}
        {postcodes.length > 0 && (
          <Alert variant="info" className="mt-3">
            Searching for crimes in {postcodes.length} postcode
            {postcodes.length > 1 ? "s" : ""}: {postcodes.join(", ")}
            <br />
            Date range: {dateFrom} to {dateTo}
          </Alert>
        )}
      </Form>
    </Container>
  );
}
