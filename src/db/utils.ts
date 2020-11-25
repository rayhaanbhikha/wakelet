import { AttributeDefinition } from "aws-sdk/clients/dynamodb";

export const generateHashKey = (key: string) => ({
  AttributeName: key,
  KeyType: "HASH"
})

export const generateRangeKey = (key: string) => ({
  AttributeName: key,
  KeyType: "RANGE"
})

export class DBAttribute{
  public definition: AttributeDefinition;
  constructor(public name: string, public type: string) {
    this.definition = {
      AttributeName: this.name,
      AttributeType: this.type
    }
  }
}

export class GlobalSecondaryIndex {
  constructor(public name: string, public hashAttribute: string, public rangeAttribute: string) { }
  
  get definition() {
    return {
      IndexName: this.name,
      KeySchema: [
        generateHashKey(this.hashAttribute),
        generateRangeKey(this.rangeAttribute),
      ],
      Projection: {
        ProjectionType: "ALL"
      }
    }
  }
}
