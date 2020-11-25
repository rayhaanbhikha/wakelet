import { DBAttribute, GlobalSecondaryIndex, generateHashKey, generateRangeKey} from './utils'

export const tableName = "NasaEvents"

export const region = 'us-east-1'

export const attributeKeys = {
  type: new DBAttribute('type', 'S'),
  id:new DBAttribute('id', 'S'),
  title:new DBAttribute('title', 'S'),
  date:new DBAttribute('date', 'S'),
}

export const dbDefaultKeySchema = [
  generateHashKey(attributeKeys.id.name),
  generateRangeKey(attributeKeys.title.name),
];


export const globalSecondaryIndexes = {
  // sort by id
  TypeIdIndex: new GlobalSecondaryIndex('TypeIdIndex', attributeKeys.type.name, attributeKeys.id.name),
  // sort by title
  TypeTitleIndex: new GlobalSecondaryIndex('TypeTitleIndex', attributeKeys.type.name, attributeKeys.title.name),
  // sort by date
  TypeDateIndex: new GlobalSecondaryIndex('TypeDateIndex', attributeKeys.type.name, attributeKeys.date.name)
}