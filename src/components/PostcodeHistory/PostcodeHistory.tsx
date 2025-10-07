import { Container, Badge, Button, ButtonGroup } from "react-bootstrap";
import { useSearch } from "../../contexts/SearchContext";

export function PostcodeHistory() {
  const { postcodeHistory, removeFromHistory, clearHistory, setPostcodes } =
    useSearch();

  if (postcodeHistory.length === 0) {
    return null;
  }

  const handlePostcodeClick = (postcode: string) => {
    setPostcodes([postcode]);
  };

  return (
    <Container className="my-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Recent Searches</h5>
        <Button variant="outline-secondary" size="sm" onClick={clearHistory}>
          Clear All
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {postcodeHistory.map((item) => (
          <div key={`${item.postcode}-${item.timestamp}`}>
            <ButtonGroup size="sm">
              <Button
                variant="outline-primary"
                onClick={() => handlePostcodeClick(item.postcode)}
              >
                {item.postcode}
                <Badge bg="secondary" className="ms-2">
                  {new Date(item.timestamp).toLocaleDateString()}
                </Badge>
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => removeFromHistory(item.postcode)}
                title="Remove from history"
              >
                ×
              </Button>
            </ButtonGroup>
          </div>
        ))}
      </div>
    </Container>
  );
}
