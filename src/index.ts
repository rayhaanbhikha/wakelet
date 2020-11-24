import express, { Request, Response, NextFunction } from 'express'
import { dbService } from './services/db.service';
import { envs } from './envs';
import { nasaService } from './services/nasa.service';

const app = express();

const errorHandlerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    next();
  } catch (error) {
    console.error("there was an error");
    res.status(500).send("Server error")
  }
};

// app.use(errorHandlerMiddleware);


app.get("/health", (req, res) => {
  res.send("status ok")
});

app.get("/v1/events", async (req, res) => {

  const { sortBy, offsetId } = req.query as { sortBy: string, offsetId: string };

  const result = await dbService.scan({ sortBy, offsetId })
  
  res.json(result);
// res.send("ok")/;
});


if (envs.ENVIRONMENT != "prod") {
  app.post("/v1/provision", async (req, res) => {
    // TODO: error handling
    await dbService.deleteTable();
    await dbService.createTable();
  
    // TODO: could wait for table to be ready.
  
    res.send("Provisioned successfully");
  })
  
  app.post("/v1/seed", async (req, res) => {
    const nasaEvents = await nasaService.getEventsFromAPI();
    await dbService.batchWrite(nasaEvents);
  
    res.send("Table populated with NasaEvents");
  })
}

app.listen(envs.PORT, () => console.log(`server started on port ${envs.PORT}`))