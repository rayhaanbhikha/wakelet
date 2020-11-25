import { DBSortBy } from '..'
import { formattedNasaEvent } from '../../__mocks__/nasa-event'
import { globalSecondaryIndexMap } from '../config'

describe('DB service', () => {

  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModuleRegistry()
  })

  describe('Create Table', () => {
    it('should invoke create table successfully', async () => {
      const createTableSpy = jest.fn().mockReturnValue({
        promise: jest.fn()
      })
    
      jest.mock('aws-sdk', () => ({
        DynamoDB: jest.fn().mockImplementation(() => ({
          createTable: createTableSpy,
        }))
      }));

      const { DBService } = await import('../index');
      const dbService = new DBService();

      jest.spyOn(dbService, 'createTableParams').mockReturnValue({ foo: 'bar' } as any)  
      
      await dbService.createTable()

      expect(createTableSpy).toHaveBeenCalledWith({ foo: 'bar'})
    })
  
    it('should return silently if ResourceInUseExeception is thrown', async () => {
    
      jest.mock('aws-sdk', () => ({
        DynamoDB: jest.fn().mockImplementation(() => ({
          createTable: jest.fn().mockReturnValue({
            promise: jest.fn().mockImplementation(() => {
              const error = {
                code: 'ResourceInUseException'
              }
              throw error;
            })
          }),
        }))
      }));

      const { DBService } = await import('../index');
      const dbService = new DBService();

      jest.spyOn(dbService, 'createTableParams').mockReturnValue({ foo: 'bar' } as any)  

      await expect(dbService.createTable()).resolves.toEqual(undefined)
    })
  })

  it.each([
    [1, 'title', globalSecondaryIndexMap.TypeTitleIndex],
    [1, 'date', globalSecondaryIndexMap.TypeDateIndex],
    [1, 'id', globalSecondaryIndexMap.TypeIdIndex],
  ])('should return correct index - case %p', async (_, sortBy, expectedIndex) => {

    const { DBService } = await import('../index');
    const dbService = new DBService();
    expect(dbService.getIndex(sortBy)).toEqual(expectedIndex);
  })

  it('should invoke batchWrite method with correct params', async () => {
    const batchWriteSpy = jest.fn().mockReturnValue({
      promise: jest.fn()
    });

    jest.mock('aws-sdk/clients/dynamodb', () => ({
      DocumentClient: jest.fn().mockImplementation(() => ({
        batchWrite: batchWriteSpy
      }))
    }));

    const { DBService } = await import('../index');
    const dbService = new DBService();

    await dbService.batchWrite([formattedNasaEvent]);

    expect(batchWriteSpy).toHaveBeenCalledWith({
      RequestItems:{
        NasaEvents:[
        {
          PutRequest:{
            Item:{
              ...formattedNasaEvent,
              'id': formattedNasaEvent.id,
              'date': formattedNasaEvent.date,
              'title': formattedNasaEvent.title,
              type:"nasaEvent"
            }
          }
        }
        ]
      }
   })

  });
  
  describe('Scan', () => {})
})
