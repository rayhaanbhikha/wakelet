import { dbService } from './db';
import { NasaEvent, nasaService } from './services/nasa.service';

export async function provisionDB(seedLimit: number) {
  console.log('Provisioning DB');

  const maxDBBatchWriteSize = 25;

  await dbService.createTable();
  await dbService.waitForTable();

  const result = await dbService.scan({ limit: seedLimit });

  const numberOfNasaEvents = result.data?.length || 0;

  console.log('NasaEvents stored count: ', numberOfNasaEvents);
  console.log('Seed limit: ', seedLimit);

  if (numberOfNasaEvents < seedLimit) {
    console.log('Seeding Database');
    const nasaEvents = await nasaService.getEventsFromAPI();

    const groupedNasaEvents: NasaEvent[][] = [];
    for (let i = 0; i < nasaEvents.length; i += maxDBBatchWriteSize) {
      const chunk = nasaEvents.slice(i, i + maxDBBatchWriteSize);
      groupedNasaEvents.push(chunk);
    }

    const promises = groupedNasaEvents.map(nasaEvents =>
      dbService.batchWrite(nasaEvents),
    );
    await Promise.all(promises);
  }
}
