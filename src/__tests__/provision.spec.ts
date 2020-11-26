import { dbService } from '../db';
import { provisionDB } from '../provision';
import { nasaService } from '../services/nasa.service';
import { formattedNasaEvent } from '../__mocks__/nasa-event';

describe('Provision', () => {
  const createTableSpy = jest
    .spyOn(dbService, 'createTable')
    .mockResolvedValue();
  const dbWaitForTableSpy = jest
    .spyOn(dbService, 'waitForTable')
    .mockResolvedValue({} as any);
  const dbBatchWriteSpy = jest
    .spyOn(dbService, 'batchWrite')
    .mockResolvedValue();
  const dbScanSpy = jest.spyOn(dbService, 'scan');
  const nasaGetEventsSpy = jest.spyOn(nasaService, 'getEventsFromAPI');
  const seedLimit = 2;

  beforeEach(jest.resetAllMocks);

  it('should create table', async () => {
    nasaGetEventsSpy.mockResolvedValue({} as any);
    dbScanSpy.mockResolvedValue({} as any);
    await provisionDB(seedLimit);
    expect(createTableSpy).toHaveBeenCalled();
  });

  it('should wait for the table to exist', async () => {
    nasaGetEventsSpy.mockResolvedValue({} as any);
    dbScanSpy.mockResolvedValue({} as any);
    await provisionDB(seedLimit);
    expect(dbWaitForTableSpy).toHaveBeenCalled();
  });

  it('should fetch and write nasa events to db if under seed limit', async () => {
    dbScanSpy.mockResolvedValue({
      data: [{ foo: 'bar' }],
      meta: {
        offsetId: '',
      },
    });

    const nasaGetEventResponse = [formattedNasaEvent];
    nasaGetEventsSpy.mockResolvedValue(nasaGetEventResponse);

    await provisionDB(seedLimit);

    expect(nasaGetEventsSpy).toHaveBeenCalled();
    expect(dbBatchWriteSpy).toHaveBeenCalledWith(nasaGetEventResponse);
  });

  it('should not fetch and write nasa events to db if number of items <= seed limit', async () => {
    dbScanSpy.mockResolvedValue({
      data: [{ foo: 'bar' }, { bar: 'baz' }],
      meta: {
        offsetId: '',
      },
    });

    await provisionDB(seedLimit);

    expect(nasaGetEventsSpy).not.toHaveBeenCalled();
    expect(dbBatchWriteSpy).not.toHaveBeenCalled();
  });

  it('should split nasa events into smaller batches of 25', async () => {
    const mockNasaEvents = Array(100);
    dbScanSpy.mockResolvedValue({} as any);
    nasaGetEventsSpy.mockResolvedValue(mockNasaEvents);
    await provisionDB(seedLimit);

    expect(dbBatchWriteSpy).toHaveBeenCalledTimes(mockNasaEvents.length / 25);
  });
});
