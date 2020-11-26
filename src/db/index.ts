import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { generateCursor } from '../utils/cursor';
import { NasaEvent } from '../services/nasa.service';
import {
  tableName,
  attributeKeyMap,
  globalSecondaryIndexMap,
  keySchema,
} from './config';
import { GlobalSecondaryIndex } from './utils';
import { envs } from '../envs';

export enum DBSortBy {
  Title = 'title',
  Id = 'id',
  Date = 'date',
}

export interface IScanOptions {
  index?: GlobalSecondaryIndex;
  cursor?: DynamoDB.DocumentClient.Key;
  limit: number;
}

export class DBService {
  private client: DynamoDB.DocumentClient;
  private dbClient: DynamoDB;

  constructor() {
    const clientConfig = {
      region: envs.AWS_REGION,
      endpoint: process.env.DYNAMO_DB_ENDPOINT,
    };
    this.client = new DocumentClient(clientConfig);
    this.dbClient = new DynamoDB(clientConfig);
  }

  createTableParams() {
    return {
      TableName: tableName,
      KeySchema: keySchema,
      AttributeDefinitions: Object.values(attributeKeyMap).map(
        attribute => attribute.definition,
      ),
      GlobalSecondaryIndexes: Object.values(globalSecondaryIndexMap).map(
        index => index.definition,
      ),
      BillingMode: 'PAY_PER_REQUEST',
    };
  }

  async createTable() {
    try {
      const params: DynamoDB.CreateTableInput = this.createTableParams();
      await this.dbClient.createTable(params).promise();
    } catch (error) {
      if (error?.code === 'ResourceInUseException') {
        console.log(`${tableName} table already exists`);
        return;
      } else {
        throw error;
      }
    }
  }

  async batchWrite(nasaEvents: NasaEvent[]) {
    const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [tableName]: nasaEvents.map(nasaEvent => ({
          PutRequest: {
            Item: {
              ...nasaEvent,
              [attributeKeyMap.type.name]: 'nasaEvent',
              [attributeKeyMap.id.name]: nasaEvent.id,
              [attributeKeyMap.date.name]: nasaEvent.date,
              [attributeKeyMap.title.name]: nasaEvent.title,
            },
          },
        })),
      },
    };
    await this.client.batchWrite(params).promise();
  }

  getIndex(sortBy: string) {
    switch (sortBy?.toLowerCase()) {
      case DBSortBy.Title:
        return globalSecondaryIndexMap.TypeTitleIndex;
      case DBSortBy.Date:
        return globalSecondaryIndexMap.TypeDateIndex;
      case DBSortBy.Id:
        return globalSecondaryIndexMap.TypeIdIndex;
      default:
        return undefined;
    }
  }

  async scan({ index, cursor, limit }: IScanOptions) {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
      Limit: limit,
      IndexName: index?.name,
    };

    if (cursor) {
      params.ExclusiveStartKey = cursor;
    }

    const result = await this.client.scan(params).promise();

    let newOffsetId = '';
    if (result.LastEvaluatedKey) {
      newOffsetId = generateCursor(result.LastEvaluatedKey);
    }

    return {
      data: result.Items,
      meta: {
        offsetId: newOffsetId,
      },
    };
  }
}

export const dbService = new DBService();
