// TODO: should really encrypt cursor.
export const generateCursor = (data: object) => Buffer.from(JSON.stringify(data)).toString('base64');

export const decodeCursor = (cursor: string) => JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));