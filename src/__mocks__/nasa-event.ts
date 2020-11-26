export const nasaEvent = {
  id: 'EONET_5167',
  title: 'Tropical Cyclone Nivar',
  description: 'some-description',
  link: 'https://eonet.sci.gsfc.nasa.gov/api/v3/events/EONET_5167',
  closed: null,
  categories: [
    {
      id: 'severeStorms',
      title: 'Severe Storms',
    },
  ],
  sources: [
    {
      id: 'GDACS',
      url:
        'https://www.gdacs.org/Cyclones/report.aspx?eventid=1000747&amp;eventtype=TC',
    },
  ],
  geometry: [
    {
      magnitudeValue: 35.0,
      magnitudeUnit: 'kts',
      date: '2020-11-23T12:00:00Z',
      type: 'Point',
      coordinates: [83.8, 9.8],
    },
  ],
};

export const formattedNasaEvent = {
  id: 'EONET_5167_0',
  title: 'Tropical Cyclone Nivar - 0',
  description: 'some-description',
  link: 'https://eonet.sci.gsfc.nasa.gov/api/v3/events/EONET_5167',
  closed: null,
  magnitudeValue: 35.0,
  magnitudeUnit: 'kts',
  date: '2020-11-23T12:00:00Z',
  type: 'Point',
  coordinates: [83.8, 9.8],
  sources: [
    {
      id: 'GDACS',
      url:
        'https://www.gdacs.org/Cyclones/report.aspx?eventid=1000747&amp;eventtype=TC',
    },
  ],
  categories: [
    {
      id: 'severeStorms',
      title: 'Severe Storms',
    },
  ],
};
