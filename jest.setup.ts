Object.assign(process.env, {
  PORT: 8080,
  NASA_EVENTS_BASE_URL: "http://nasa-url.com",
  SEED_LIMIT: 10,
  DEFAULT_SCAN_LIMIT: 2,
  ENVIRONMENT: 'dev',
  AWS_REGION: 'us-east-1',
  DYNAMO_DB_ENDPOINT: 'http://dynamodb:endpoint'
});