const env = (envName: string, fallback: string) => process.env[envName] || fallback 

export const envs = {
  PORT: parseInt(env('PORT', '8080')),
  DB_TABLE_NAME: env('DB_TABLE_NAME', 'NasaEvents'),
  NASA_EVENTS_BASE_URL: env("NASA_EVENTS_BASE_URL", "https://eonet.sci.gsfc.nasa.gov"),
  ENVIRONMENT: env('ENVIRONMENT', 'dev'),
  AWS_REGION: env('AWS_REGION', 'us-east-1'),
}