import axios from 'axios';
import MockAdaper from 'axios-mock-adapter';

import { NasaService } from '../nasa.service';

const mock = new MockAdaper(axios);

const nasaEvent = {
  "id": "EONET_5167",
  "title": "Tropical Cyclone Nivar",
  "description": null,
  "link": "https://eonet.sci.gsfc.nasa.gov/api/v3/events/EONET_5167",
  "closed": null,
  "categories": [
    {
      "id": "severeStorms",
      "title": "Severe Storms"
    }
  ],
  "sources": [
    {
      "id": "GDACS",
      "url": "https://www.gdacs.org/Cyclones/report.aspx?eventid=1000747&amp;eventtype=TC"
    },
  ],
  "geometry": [
    {
      "magnitudeValue": 35.00,
      "magnitudeUnit": "kts",
      "date": "2020-11-23T12:00:00Z",
      "type": "Point",
      "coordinates": [
        83.8,
        9.8
      ]
    },
  ]
};

const formattedNasaEvent = {
  "id": "EONET_5167_0",
  "title": "Tropical Cyclone Nivar - 0",
  "description": null,
  "link": "https://eonet.sci.gsfc.nasa.gov/api/v3/events/EONET_5167",
  "closed": null,
  "magnitudeValue": 35.00,
  "magnitudeUnit": "kts",
  "date": "2020-11-23T12:00:00Z",
  "type": "Point",
  "coordinates": [
    83.8,
    9.8
  ],
  "sources": [
    {
      "id": "GDACS",
      "url": "https://www.gdacs.org/Cyclones/report.aspx?eventid=1000747&amp;eventtype=TC"
    },
  ],
  "categories": [
    {
      "id": "severeStorms",
      "title": "Severe Storms"
    }
  ],
};



describe('Nasa Service', () => {
  
  const nasaService = new NasaService();
  
  it('should fetch NasaEvents from api and format correctly', async () => {
    mock.onGet('/api/v3/events').reply(200, {
      events: [
        nasaEvent
      ]
    })
    
    const data = await nasaService.getEventsFromAPI();
    expect(data).toEqual([formattedNasaEvent]);
  })
})
