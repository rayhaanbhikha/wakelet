interface Category {
  id: string;
  title: string;
}

interface Source {
  id: string;
  url: string;
}

export interface Geometry {
  magnitudeValue?: number;
  magnitudeUnit?: string;
  magnitudeDescription?: string;
  date: string;
  type: string;
  coordinates: number[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  link: string;
  closed: string | null;
  categories: Category[];
  sources: Source[];
  geometry: Geometry[];
}

export interface AxiosEventsAPIResponse {
  title: string;
  description: string;
  link: string;
  events: Event[];
}
