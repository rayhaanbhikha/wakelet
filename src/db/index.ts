import { DynamoDB } from 'aws-sdk';
import { decodeCursor, generateCursor } from '../utils/cursor';
import { NasaEvent } from '../services/nasa.service';
import * as dbConfig from './config';
import { GlobalSecondaryIndex } from './utils';

export enum DBSortBy {
  Title = 'title',
  Id = 'id',
  Date = 'date',
}

export interface IScanOptions {
  index?: GlobalSecondaryIndex,
  cursor?: string,
  limit: number
}

class DBService {
  private client: DynamoDB.DocumentClient;
  private dbClient: DynamoDB;

  constructor() {
    this.client = new DynamoDB.DocumentClient({
      region: dbConfig.region
    })

    this.dbClient = new DynamoDB({
      region: dbConfig.region,
    });
  }

  private createTableParams() {
    return {
      TableName: dbConfig.tableName,
      KeySchema: dbConfig.dbDefaultKeySchema,
      AttributeDefinitions: Object.values(dbConfig.attributeKeys).map(attribute => attribute.definition),
      GlobalSecondaryIndexes: Object.values(dbConfig.globalSecondaryIndexes).map(index => index.definition),
      BillingMode: "PAY_PER_REQUEST"
    };
  }

  async createTable() {
    const params: DynamoDB.CreateTableInput = this.createTableParams();
    try {
      await this.dbClient.createTable(params).promise()
    } catch (error) {
      console.log(error);
      if (error?.code === 'ResourceInUseException') {
        console.log(`${dbConfig.tableName} table already exists`)
        return
      } else {
        throw error
      }
    }
  }

  async batchWrite(nasaEvents: NasaEvent[]) {
    const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [dbConfig.tableName]: nasaEvents.map(nasaEvent => ({
          PutRequest: {
            Item: {
              ...nasaEvent,
              [dbConfig.attributeKeys.type.name]: 'nasaEvent',
              [dbConfig.attributeKeys.id.name]: nasaEvent.id,
              [dbConfig.attributeKeys.date.name]: nasaEvent.date,
              [dbConfig.attributeKeys.title.name]: nasaEvent.title
            }
          }
        }))
      }
    }
    await this.client.batchWrite(params).promise()
  }

  getIndex(sortBy: string) {
    switch (sortBy?.toLowerCase()) {
      case DBSortBy.Title:
        return dbConfig.globalSecondaryIndexes.TypeTitleIndex
      case DBSortBy.Date:
        return dbConfig.globalSecondaryIndexes.TypeDateIndex
      case DBSortBy.Id:
          return dbConfig.globalSecondaryIndexes.TypeIdIndex
      default:
        return undefined;
    }
  }

  async scan({index, cursor, limit}: IScanOptions) {

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: dbConfig.tableName,
      Limit: limit,
      IndexName: index?.name,
    }

    if (cursor) {
      params.ExclusiveStartKey = decodeCursor(cursor)
    }

    const result = await this.client.scan(params).promise();

    let newOffsetId = ''
    if (result.LastEvaluatedKey) {
      newOffsetId = generateCursor(result.LastEvaluatedKey);
    }

    return {
      data: result.Items,
      meta: {
        offsetId: newOffsetId
      }
    };
  }
}

export const dbService = new DBService();