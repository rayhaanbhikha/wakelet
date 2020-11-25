import { dbService, DBSortBy } from "./db";
import { envs } from "./envs";
import { nasaService } from "./services/nasa.service";

export async function provisionDB() {
  try {
    await dbService.createTable();

    const result = await dbService.scan({ limit: envs.SEED_LIMIT })
    
    const numberOfNasaEvents = result.data?.length || 0

    if (numberOfNasaEvents < envs.SEED_LIMIT) {
      const nasaEvents = await nasaService.getEventsFromAPI();
      await dbService.batchWrite(nasaEvents);
    }
  } catch (error) {
    console.error("PROVISION ERROR", error);
    process.exit(1)
  }
}