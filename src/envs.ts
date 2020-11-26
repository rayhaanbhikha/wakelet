const env = (envName: string, fallback: string) =>
  process.env[envName] || fallback;

export const envs = {
  PORT: parseInt(env('PORT', '8080')),
  NASA_EVENTS_BASE_URL: env(
    'NASA_EVENTS_BASE_URL',
    'https://eonet.sci.gsfc.nasa.gov',
  ),
  SEED_LIMIT: parseInt(env('SEED_LIMIT', '10')),
  DEFAULT_SCAN_LIMIT: parseInt(env('DEFAULT_SCAN_LIMIT', '5')),
  ENVIRONMENT: env('ENVIRONMENT', 'dev'),
  AWS_REGION: env('AWS_REGION', 'us-east-1'),
  DYNAMO_DB_ENDPOINT: process.env.DYNAMO_DB_ENDPOINT,
};
