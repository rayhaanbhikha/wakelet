import { DynamoDB, Endpoint } from 'aws-sdk';
import { decodeCursor, generateCursor } from '../utils/cursor';
import { NasaEvent } from '../services/nasa.service';
import * as dbConfig from './config';
import { GlobalSecondaryIndex } from './utils';
import { envs } from '../envs';

export enum DBSortBy {
  Title = 'title',
  Id = 'id',
  Date = 'date',
}

export interface IScanOptions {
  index?: GlobalSecondaryIndex,
  cursor?: DynamoDB.DocumentClient.Key,
  limit: number
}

class DBService {
  private client: DynamoDB.DocumentClient;
  private dbClient: DynamoDB;

  constructor() {
    const clientConfig = {
      region: envs.AWS_REGION,
      endpoint: process.env.DYNAMO_DB_ENDPOINT
    }
    this.client = new DynamoDB.DocumentClient(clientConfig)
    this.dbClient = new DynamoDB(clientConfig);
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
      params.ExclusiveStartKey = cursor
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