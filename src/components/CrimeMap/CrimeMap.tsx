import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { Container, Alert, Card } from "react-bootstrap";
import { useSearch } from "../../contexts/SearchContext";
import type { CrimeTableData } from "../../types/crime";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapCentreProps {
  centre: [number, number];
}

function MapCentre({ centre }: MapCentreProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(centre, 13);
  }, [map, centre]);

  return null;
}

export function CrimeMap() {
  const { crimes, validPostcodes } = useSearch();
  const [mapCentre, setMapCentre] = useState<[number, number]>([51.505, -0.09]);

  // Calculate map centre based on valid postcodes
  useEffect(() => {
    if (validPostcodes.length > 0) {
      const avgLat =
        validPostcodes.reduce((sum, pc) => sum + pc.latitude, 0) /
        validPostcodes.length;
      const avgLng =
        validPostcodes.reduce((sum, pc) => sum + pc.longitude, 0) /
        validPostcodes.length;
      setMapCentre([avgLat, avgLng]);
    }
  }, [validPostcodes]);

  if (crimes.length === 0) {
    return (
      <Container className="my-4">
        <h2>Crime Map</h2>
        <Alert variant="info" className="mt-3">
          No crime data available. Please search for postcodes to see crime
          locations on the map.
        </Alert>
      </Container>
    );
  }

  // Group crimes by location to avoid overlapping markers
  const crimeGroups = crimes.reduce(
    (groups, crime) => {
      const key = `${crime.location.latitude},${crime.location.longitude}`;
      if (!groups[key]) {
        groups[key] = {
          position: [
            parseFloat(crime.location.latitude),
            parseFloat(crime.location.longitude),
          ] as [number, number],
          crimes: [],
          postcode: crime.postcode,
        };
      }
      groups[key].crimes.push(crime);
      return groups;
    },
    {} as Record<
      string,
      {
        position: [number, number];
        crimes: CrimeTableData[];
        postcode: string;
      }
    >
  );

  const crimeGroupsArray = Object.values(crimeGroups);

  return (
    <Container className="my-4">
      <h2 className="mb-3">Crime Map - {crimes.length} crime(s)</h2>

      <Card>
        <Card.Body className="p-0">
          <div style={{ height: "600px", width: "100%" }}>
            <MapContainer
              center={mapCentre}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCentre centre={mapCentre} />

              {crimeGroupsArray.map((group, index) => (
                <Marker key={index} position={group.position}>
                  <Popup>
                    <div>
                      <h6 className="fw-bold">
                        {group.postcode} - {group.crimes.length} crime(s)
                      </h6>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {group.crimes.slice(0, 10).map((crime, crimeIndex) => (
                          <div key={crimeIndex} className="border-bottom pb-2 mb-2">
                            <div className="fw-bold text-primary">
                              {crime.category}
                            </div>
                            <div className="text-muted small">
                              {crime.streetName}
                            </div>
                            <div className="small">
                              {crime.outcome_status?.category || "Unknown outcome"}
                            </div>
                          </div>
                        ))}
                        {group.crimes.length > 10 && (
                          <div className="text-muted small">
                            ... and {group.crimes.length - 10} more crimes
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
