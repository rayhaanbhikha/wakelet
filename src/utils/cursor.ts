import { DynamoDB } from "aws-sdk";

// TODO: should really encrypt cursor.
export const generateCursor = (data: object) => Buffer.from(JSON.stringify(data)).toString('base64');

export const decodeCursor = (cursor: string) => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('ascii')) as DynamoDB.DocumentClient.Key;
  } catch (error) {
    console.error("Unable to parse cursor: ", error.message);
    return undefined;
  }
}