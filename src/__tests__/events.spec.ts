import { Request, Response } from 'express';
import { dbService } from '../db';
import { globalSecondaryIndexMap } from '../db/config';
import { eventsHandler } from '../events';

describe('Events Handler', () => {
  const dbScanSpy = jest.spyOn(dbService, 'scan');
  beforeEach(jest.clearAllMocks);

  it.each([
    [
      1,
      {},
      {
        index: undefined,
        cursor: undefined,
        limit: 2,
      },
    ],
    [
      2,
      {
        sortBy: 'title',
        offsetId: 'eyJmb28iOiJiYXIifQ==',
        limit: 10,
      },
      {
        index: globalSecondaryIndexMap.TypeTitleIndex,
        cursor: { foo: 'bar' },
        limit: 10,
      },
    ],
  ])(
    'should validate req.query and invoke dbservice scan method with correct params - case %p',
    async (_, queryParams, expectedParams) => {
      dbScanSpy.mockResolvedValue({} as any);
      const req = { query: queryParams } as Request;
      const res = ({ json: jest.fn() } as unknown) as Response;
      await eventsHandler(req, res);
      expect(dbScanSpy).toHaveBeenCalledWith(expectedParams);
    },
  );

  it('should return json response', async () => {
    const mockScanResult = { foo: 'bar' };
    dbScanSpy.mockResolvedValue(mockScanResult as any);
    const resJsonSpy = jest.fn();
    await eventsHandler({ query: {} } as Request, { json: resJsonSpy } as any);
    expect(resJsonSpy).toHaveBeenCalledWith(mockScanResult);
  });

  it('should respond with status code 500 and correct error message when error is thrown', async () => {
    dbScanSpy.mockImplementation(() => {
      throw new Error('some-error');
    });
    const resJsonSpy = jest.fn();
    const statusSpy = jest.fn().mockReturnValue({
      json: resJsonSpy,
    });
    await eventsHandler({ query: {} } as Request, { status: statusSpy } as any);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(resJsonSpy).toHaveBeenCalledWith({ message: 'Server error' });
  });
});
