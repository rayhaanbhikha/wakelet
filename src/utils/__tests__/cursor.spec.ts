import { generateCursor, decodeCursor } from '../cursor';

describe('Cursor', () => {
  const cursorValue = { foo: 'bar' }
  const encodedCursorValue = 'eyJmb28iOiJiYXIifQ==';
  it('should encode cursor', () => expect(generateCursor(cursorValue)).toBe(encodedCursorValue));

  it('should decode cursor', () => expect(decodeCursor(encodedCursorValue)).toEqual(cursorValue));

  it.each([
    [1, ''],
    [2, 1],
    [3, 'some-random-string']
  ])('should return undefined when cursor is malformed - case: %p', (_, encodedCursorValue) => {
    expect(decodeCursor(encodedCursorValue as string)).toBeUndefined();
  })
})
