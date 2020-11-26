import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './openapi.json';

import { envs } from './envs';
import { provisionDB } from './provision';
import { eventsHandler } from './events';

const app = express();

// TODO: unit tests
// TODO: linting

app.get("/health", (req, res) => {
  res.send("status ok")
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/v1/events", eventsHandler);

const serverInit = async () => {
  try {
    await provisionDB(envs.SEED_LIMIT);
    app.listen(envs.PORT, () => console.log(`server started on port ${envs.PORT}`))
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

serverInit();