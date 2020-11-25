import express from 'express'
import { dbService } from './db';
import { envs } from './envs';
import { provisionDB } from './provision';
import { decodeCursor } from './utils/cursor';
import { validateLimit, validateOffsetId, validateSortBy } from './utils/validation';

const app = express();

app.get("/health", (req, res) => {
  res.send("status ok")
});

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
    res.status(500).send("Server error");
  }
});

const serverInit = async () => {
  try {
    await provisionDB();
    app.listen(envs.PORT, () => console.log(`server started on port ${envs.PORT}`))
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
}

serverInit();