import express from 'express'
import { dbService } from './db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './openapi.json';

import { envs } from './envs';
import { provisionDB } from './provision';
import { decodeCursor } from './utils/cursor';
import { validateLimit, validateOffsetId, validateSortBy } from './utils/validation';

const app = express();

// TODO: unit tests
// TODO: e2e tests
// TODO: linting

app.get("/health", (req, res) => {
  res.send("status ok")
});

app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/v1/events", async (req, res) => {
  try {

    const sortBy = validateSortBy(req.query.sortBy as string, '');
    const offsetId = validateOffsetId(req.query.offsetId as string, '');
    const scanLimit = validateLimit(req.query.limit as string, envs.DEFAULT_SCAN_LIMIT)

    const cursor = decodeCursor(offsetId);
    const index = dbService.getIndex(sortBy);

    console.log({ index: index?.name, cursor, limit: scanLimit })

    const result = await dbService.scan({ index, cursor, limit: scanLimit })
    
    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

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