import { formattedNasaEvent } from '../../__mocks__/nasa-event';
import { globalSecondaryIndexMap } from '../config';

describe('DB service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModuleRegistry();
  });

  describe('Create Table', () => {
    it('should invoke create table successfully', async () => {
      const createTableSpy = jest.fn().mockReturnValue({
        promise: jest.fn(),
      });

      jest.mock('aws-sdk', () => ({
        DynamoDB: jest.fn().mockImplementation(() => ({
          createTable: createTableSpy,
        })),
      }));

      const { DBService } = await import('../index');
      const dbService = new DBService();

      jest
        .spyOn(dbService, 'createTableParams')
        .mockReturnValue({ foo: 'bar' } as any);

      await dbService.createTable();

      expect(createTableSpy).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should return silently if ResourceInUseExeception is thrown', async () => {
      jest.mock('aws-sdk', () => ({
        DynamoDB: jest.fn().mockImplementation(() => ({
          createTable: jest.fn().mockReturnValue({
            promise: jest.fn().mockImplementation(() => {
              const error = {
                code: 'ResourceInUseException',
              };
              throw error;
            }),
          }),
        })),
      }));

      const { DBService } = await import('../index');
      const dbService = new DBService();

      jest
        .spyOn(dbService, 'createTableParams')
        .mockReturnValue({ foo: 'bar' } as any);

      await expect(dbService.createTable()).resolves.toEqual(undefined);
    });
  });

  it.each([
    [1, 'title', globalSecondaryIndexMap.TypeTitleIndex],
    [1, 'date', globalSecondaryIndexMap.TypeDateIndex],
    [1, 'id', globalSecondaryIndexMap.TypeIdIndex],
  ])(
    'should return correct index - case %p',
    async (_, sortBy, expectedIndex) => {
      const { DBService } = await import('../index');
      const dbService = new DBService();
      expect(dbService.getIndex(sortBy)).toEqual(expectedIndex);
    },
  );

  it('should invoke batchWrite method with correct params', async () => {
    const batchWriteSpy = jest.fn().mockReturnValue({
      promise: jest.fn(),
    });

    jest.mock('aws-sdk/clients/dynamodb', () => ({
      DocumentClient: jest.fn().mockImplementation(() => ({
        batchWrite: batchWriteSpy,
      })),
    }));

    const { DBService } = await import('../index');
    const dbService = new DBService();

    await dbService.batchWrite([formattedNasaEvent]);

    expect(batchWriteSpy).toHaveBeenCalledWith({
      RequestItems: {
        NasaEvents: [
          {
            PutRequest: {
              Item: {
                ...formattedNasaEvent,
                id: formattedNasaEvent.id,
                date: formattedNasaEvent.date,
                title: formattedNasaEvent.title,
                type: 'nasaEvent',
              },
            },
          },
        ],
      },
    });
  });

  describe('Scan', () => {
    it.each([
      [
        1,
        {
          index: globalSecondaryIndexMap.TypeIdIndex,
          cursor: undefined,
          limit: 10,
        },
        {
          TableName: 'NasaEvents',
          Limit: 10,
          IndexName: 'TypeIdIndex',
        },
      ],
      [
        2,
        {
          index: globalSecondaryIndexMap.TypeTitleIndex,
          cursor: { key: 'some-key' },
          limit: 10,
        },
        {
          TableName: 'NasaEvents',
          Limit: 10,
          IndexName: 'TypeTitleIndex',
          ExclusiveStartKey: { key: 'some-key' },
        },
      ],
    ])(
      'should invoke scan with correct params - case %p',
      async (_, scanOptions, expectedParams) => {
        const scanSpy = jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({}),
        });

        jest.mock('aws-sdk/clients/dynamodb', () => ({
          DocumentClient: jest.fn().mockImplementation(() => ({
            scan: scanSpy,
          })),
        }));

        const { DBService } = await import('../index');
        const dbService = new DBService();
        await dbService.scan(scanOptions);
        expect(scanSpy).toHaveBeenCalledWith(expectedParams);
      },
    );

    it.each([
      [
        1,
        {
          Items: [{ foo: 'bar', baz: 'bong' }],
        },
        {
          data: [{ foo: 'bar', baz: 'bong' }],
          meta: {
            offsetId: '',
          },
        },
      ],
      [
        2,
        {
          Items: [{ foo: 'bar', baz: 'bong' }],
          LastEvaluatedKey: { foo: 'bar' },
        },
        {
          data: [{ foo: 'bar', baz: 'bong' }],
          meta: {
            offsetId: 'eyJmb28iOiJiYXIifQ==',
          },
        },
      ],
    ])(
      'should return scanned items with offset id set to empty string - case %p',
      async (_, mockScanResponse, expectedResponse) => {
        jest.mock('aws-sdk/clients/dynamodb', () => ({
          DocumentClient: jest.fn().mockImplementation(() => ({
            scan: jest.fn().mockReturnValue({
              promise: jest.fn().mockResolvedValue(mockScanResponse),
            }),
          })),
        }));

        const { DBService } = await import('../index');
        const dbService = new DBService();
        const result = await dbService.scan({
          limit: 10,
        });

        expect(result).toEqual(expectedResponse);
      },
    );
  });
});
