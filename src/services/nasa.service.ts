import axios, { AxiosInstance } from 'axios';
import { envs } from '../envs';
import { AxiosEventsAPIResponse, Event, Geometry } from './types';

export type NasaEvent = Omit<Event, 'geometry'> & Geometry & { type: string };

export class NasaService {
  private axios: AxiosInstance;
  constructor() {
    this.axios = axios.create({
      baseURL: envs.NASA_EVENTS_BASE_URL,
      timeout: 30_000
    });
   }
  
  async getEventsFromAPI() {
    const res = await this.axios.get<AxiosEventsAPIResponse>('/api/v3/events', {
      params: {
        status: "OPEN",
        limit: envs.SEED_LIMIT
      }
    });
  
    return res.data.events.map(this.formatEvent).flat();
  }

  private formatEvent = (event: Event): NasaEvent[] => {
    const { geometry, ...eventProperties } = event;
    return geometry.map((geometry, index) => {
      return {
        ...eventProperties,
        ...geometry,
        id: `${eventProperties.id}_${index}`,
        title: `${eventProperties.title} - ${index}`
      }
    });
  }
}

export const nasaService = new NasaService();