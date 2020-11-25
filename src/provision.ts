import { dbService } from "./db";
import { nasaService } from "./services/nasa.service";

export async function provisionDB(seedLimit: number) {
  console.log("Provisioning DB");
  await dbService.createTable();

  const result = await dbService.scan({ limit: seedLimit })
  
  const numberOfNasaEvents = result.data?.length || 0
  if (numberOfNasaEvents < seedLimit) {
    const nasaEvents = await nasaService.getEventsFromAPI();
    await dbService.batchWrite(nasaEvents);
  }
}