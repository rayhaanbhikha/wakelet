import {
  DBAttribute,
  GlobalSecondaryIndex,
  generateHashKey,
  generateRangeKey,
} from './utils';

export const tableName = 'NasaEvents';

export const attributeKeyMap = {
  type: new DBAttribute('type', 'S'),
  id: new DBAttribute('id', 'S'),
  title: new DBAttribute('title', 'S'),
  date: new DBAttribute('date', 'S'),
};

export const keySchema = [
  generateHashKey(attributeKeyMap.id.name),
  generateRangeKey(attributeKeyMap.title.name),
];

export const globalSecondaryIndexMap = {
  // sort by id
  TypeIdIndex: new GlobalSecondaryIndex(
    'TypeIdIndex',
    attributeKeyMap.type.name,
    attributeKeyMap.id.name,
  ),
  // sort by title
  TypeTitleIndex: new GlobalSecondaryIndex(
    'TypeTitleIndex',
    attributeKeyMap.type.name,
    attributeKeyMap.title.name,
  ),
  // sort by date
  TypeDateIndex: new GlobalSecondaryIndex(
    'TypeDateIndex',
    attributeKeyMap.type.name,
    attributeKeyMap.date.name,
  ),
};
