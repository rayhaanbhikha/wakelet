import axios from 'axios';
import MockAdaper from 'axios-mock-adapter';
import { formattedNasaEvent, nasaEvent } from '../../__mock__/nasa-event';

import { NasaService } from '../nasa.service';

const mock = new MockAdaper(axios);




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
