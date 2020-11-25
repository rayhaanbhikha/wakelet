export type QueryParam = string | string[] | undefined;

export const validateSortBy = (sortBy: QueryParam, defaultValue: string) => {
  return typeof sortBy === 'string' ? sortBy : defaultValue; 
}

export const validateOffsetId = (offsetId: QueryParam, defaultValue: string) => {
  return typeof offsetId === 'string' ? offsetId : defaultValue;
}

export const validateLimit = (limit: QueryParam, defaultValue: number) => {
  const numLimit = Number(limit);
  return typeof numLimit === 'number' && numLimit > 0 ? numLimit : defaultValue
}