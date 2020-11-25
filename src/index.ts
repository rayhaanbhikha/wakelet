import express, { urlencoded } from 'express'
import { dbService } from './db';
import { envs } from './envs';
import { provisionDB } from './provision';
import { URLSearchParams } from 'url'
import { decodeCursor } from './utils/cursor';

const app = express();

app.get("/health", (req, res) => {
  res.send("status ok")
});

app.get("/v1/events", async (req, res) => {
  try {
    let { sortBy, offsetId, limit } = req.query as { sortBy: string, offsetId: string, limit: string }

    const cursor = offsetId ? decodeCursor(offsetId) : '';
    const index = dbService.getIndex(sortBy);
    const scanLimit = limit ? parseInt(limit) : envs.DEFAULT_SCAN_LIMIT

    console.log({ index: index?.name, cursor, limit: scanLimit })

    const result = await dbService.scan({ index, cursor, limit: scanLimit })
    
    res.json(result);
  } catch (error) {
    console.error(error);
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