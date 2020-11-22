package events

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// Categories ...
type Categories struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

// Sources ...
type Sources = Categories

// Geometry ...
type Geometry struct {
	Type        string    `json:"type"`
	Coordinates []float32 `json:"coordinates"`
}

// Properties ...
type Properties struct {
	ID                   string       `json:"id"`
	Title                string       `json:"title"`
	Description          string       `json:"description,omitempty"`
	Link                 string       `json:"link"`
	Closed               string       `json:"closed,omitempty"`
	Date                 string       `json:"date"`
	MagnitudeValue       float32      `json:"magnitudeValue,omitempty"`
	MagnitudeUnit        string       `json:"magnitudeUnit,omitempty"`
	MagnitudeDescription string       `json:"magnitudeDescription,omitempty"`
	Categories           []Categories `json:"categories"`
	GeometryDates        []string     `json:"geometryDates"`
	Sources              []Sources    `json:"sources"`
}

// Event ...
type Event struct {
	Type       string     `json:"type"`
	Properties Properties `json:"properties"`
	Geometry   Geometry   `json:"geometry"`
}

// Events ...
type Events struct {
	Type     string  `json:"type"`
	Features []Event `json:"features"`
}

const nasaEventsURL = "https://eonet.sci.gsfc.nasa.gov/api/v3/events/geojson"

// Get ... returns a list of events.
func Get(limit int) ([]Event, error) {
	url := fmt.Sprintf("%s?status=open&limit=%d", nasaEventsURL, limit)
	fmt.Println(url)
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	events := Events{}

	err = json.Unmarshal(data, &events)
	if err != nil {
		return nil, err
	}
	return events.Features, nil
}
