import { dbService } from '../db';
import { provisionDB } from '../provision';
import { nasaService } from '../services/nasa.service';
import { formattedNasaEvent } from '../__mocks__/nasa-event';

describe('Provision', () => {
  const createTableSpy = jest
    .spyOn(dbService, 'createTable')
    .mockResolvedValue();
  const dbBatchWriteSpy = jest
    .spyOn(dbService, 'batchWrite')
    .mockResolvedValue();
  const dbScanSpy = jest.spyOn(dbService, 'scan');
  const nasaGetEventsSpy = jest.spyOn(nasaService, 'getEventsFromAPI');
  const seedLimit = 2;

  beforeEach(jest.clearAllMocks);

  it('should create table', async () => {
    dbScanSpy.mockResolvedValue({
      data: [{ foo: 'bar' }, { bar: 'baz' }],
      meta: {
        offsetId: '',
      },
    });
    await provisionDB(seedLimit);
    expect(createTableSpy).toHaveBeenCalled();
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
});
