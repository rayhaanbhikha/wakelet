import { DynamoDB } from 'aws-sdk';
import { envs } from '../envs';
import { decodeCursor, generateCursor } from '../utils/cursor';
import { NasaEvent } from './nasa.service';

export enum DBSortBy {
  Title = 'title',
  Id = 'id',
  Date = 'date',
}

export interface IScanOptions {
  sortBy?: string,
  offsetId?: string,
  limit?: number
}

class DBService {
  private dbClient: DynamoDB;
  private dbDocumentClient: DynamoDB.DocumentClient;
  private tableName: string;
  private attributeKeys = {
    type: 'type',
    id: 'id',
    title: 'title',
    date: 'date',
  }
  private indexes: { [key: string]: { IndexName: string, KeySchema: DynamoDB.DocumentClient.KeySchema } } = {
    TypeTitleIndex: {
      IndexName: 'TypeTitleIndex',
      KeySchema: [
        {
          "AttributeName": this.attributeKeys.type,
          "KeyType": "HASH"
        },
        {
          "AttributeName": this.attributeKeys.title,
          "KeyType": "RANGE"
        }
      ]
    },
    TypeDateIndex: {
      IndexName: 'TypeDateIndex',
      KeySchema: [
        {
          "AttributeName": this.attributeKeys.type,
          "KeyType": "HASH"
        },
        {
          "AttributeName": this.attributeKeys.date,
          "KeyType": "RANGE"
        }
      ]
    }
  }

  constructor() {
    this.dbDocumentClient = new DynamoDB.DocumentClient({
      region: 'us-east-1',
    })

    this.dbClient = new DynamoDB({
      region: 'us-east-1',
    }
    );

    this.tableName = envs.DB_TABLE_NAME;
  }

  async batchWrite(nasaEvents: NasaEvent[]) {
    const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [this.tableName]: nasaEvents.map(nasaEvent => ({
          PutRequest: {
            Item: {
              ...nasaEvent,
              [this.attributeKeys.type]: 'nasaEvent',
              [this.attributeKeys.id]: nasaEvent.id,
              [this.attributeKeys.date]: nasaEvent.date,
              [this.attributeKeys.title]: nasaEvent.title
            }
          }
        }))
      }
    }
    await this.dbDocumentClient.batchWrite(params).promise()
  }

  private createTableParams() {
    return {
      TableName: this.tableName,
      KeySchema: [
        {
          AttributeName: this.attributeKeys.type,
          KeyType: 'HASH',
        },
        {
          AttributeName: this.attributeKeys.id,
          KeyType: 'RANGE',
        },
      ],
      AttributeDefinitions: Object.keys(this.attributeKeys).map(attribute => ({
        AttributeName: attribute,
        AttributeType: 'S',
      })),
      GlobalSecondaryIndexes: Object.entries(this.indexes).map(([_, { IndexName, KeySchema }]) => ({
        IndexName,
        KeySchema,
        Projection: {
          ProjectionType: "ALL"
        }
      })),
      BillingMode: "PAY_PER_REQUEST"
    };
  }

  async createTable() {
    const params: DynamoDB.CreateTableInput = this.createTableParams();
    try {
      await this.dbClient.createTable(params).promise()
    } catch (error) {
      if (error?.code === 'ResourceInUseException') {
        console.log(`${this.tableName} table already exists`)
        return
      } else {
        throw error
      }
    }
  }

  async deleteTable() {
    const params = {
      TableName: this.tableName
    }
    try {
      await this.dbClient.deleteTable(params).promise();
    } catch (error) {
      if (error?.code === "ResourceNotFoundException") {
        console.log(`${this.tableName} table does not exist`)
        return
      } else {
        throw error;
      }
    }
  }

  private getIndex(sortBy: string) {
    switch (sortBy?.toLowerCase()) {
      case DBSortBy.Title:
        return this.indexes.TypeTitleIndex.IndexName
      case DBSortBy.Date:
        return this.indexes.TypeDateIndex.IndexName
      case DBSortBy.Id:
      default:
        return undefined;
    }
  }

  async scan({sortBy = DBSortBy.Id, offsetId='', limit = 10}: IScanOptions) {

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
      Limit: limit,
      IndexName: this.getIndex(sortBy),
    }

    if (offsetId) {
      try {
        params.ExclusiveStartKey = decodeCursor(offsetId)
      } catch (error) {
        console.log("failed to parse offset id")
        console.log(error.message);
      }
    }

    const result = await this.dbDocumentClient.scan(params).promise();

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