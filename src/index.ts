import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './openapi.json';

import { envs } from './envs';
import { provisionDB } from './provision';
import { eventsHandler } from './events';

const app = express();

app.get('/health', (req, res) => {
  res.send('status ok');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/v1/events', eventsHandler);

provisionDB(envs.SEED_LIMIT)
  .then(() =>
    app.listen(envs.PORT, () =>
      console.log(`server started on port ${envs.PORT}`),
    ),
  )
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
