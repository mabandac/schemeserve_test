import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useCrimeStats } from "../../hooks/useCrimeData";
import { useSearch } from "../../contexts/SearchContext";
import { CategoryChart } from "./CategoryChart";
import { OutcomeChart } from "./OutcomeChart";

export function CrimeOverview() {
  const { crimes } = useSearch();
  const stats = useCrimeStats(crimes);

  if (crimes.length === 0) {
    return (
      <Container className="my-4">
        <h2>Crime Overview</h2>
        <Alert variant="info" className="mt-3">
          No crime data available. Please search for postcodes to see statistics.
          <br />
          <small className="text-muted">
            Tip: If you searched but see no data, try selecting a date 2-3 months in the past.
          </small>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Crime Overview</h2>

      <Row className="g-3 mb-4">
        {/* Total Crimes */}
        <Col md={4}>
          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title>Total Crimes</Card.Title>
              <h3 className="display-4">{stats.totalCrimes.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>

        {/* Categories */}
        <Col md={4}>
          <Card bg="success" text="white">
            <Card.Body>
              <Card.Title>Crime Categories</Card.Title>
              <h3 className="display-4">{Object.keys(stats.categoryBreakdown).length}</h3>
            </Card.Body>
          </Card>
        </Col>

        {/* Outcomes */}
        <Col md={4}>
          <Card bg="warning" text="dark">
            <Card.Body>
              <Card.Title>Outcome Types</Card.Title>
              <h3 className="display-4">{Object.keys(stats.outcomeBreakdown).length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-3">
        <Col lg={6}>
          <CategoryChart data={stats.categoryBreakdown} />
        </Col>
        <Col lg={6}>
          <OutcomeChart data={stats.outcomeBreakdown} />
        </Col>
      </Row>
    </Container>
  );
}
