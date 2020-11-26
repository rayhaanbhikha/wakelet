import {
  validateSortBy,
  QueryParam,
  validateLimit,
  validateOffsetId,
} from '../validation';

describe('Validation', () => {
  describe('sortBy', () => {
    it('should return sortBy', () =>
      expect(validateSortBy('date', '')).toBe('date'));

    it.each([
      [1, ['s', 'o']],
      [1, null],
      [1, 123],
    ])('should return default sortBy value - case %p', (_, sortByArg) =>
      expect(validateSortBy(sortByArg as QueryParam, 'default')).toBe(
        'default',
      ),
    );
  });

  describe('limit', () => {
    it('should return limit', () => expect(validateLimit('10', 2)).toBe(10));

    it.each([
      [1, ['s', 'o']],
      [1, null],
      [1, -1],
      [1, 'some-limit'],
    ])('should return default limit value - case %p', (_, limitArg) =>
      expect(validateLimit(limitArg as QueryParam, 10)).toBe(10),
    );
  });

  describe('offsetId', () => {
    it('should return offsetId', () =>
      expect(validateOffsetId('offsetid', '')).toBe('offsetid'));

    it.each([
      [1, ['s', 'o']],
      [1, null],
      [1, 123],
    ])('should return default offsetId value - case %p', (_, offsetIdArg) =>
      expect(validateOffsetId(offsetIdArg as QueryParam, 'default')).toBe(
        'default',
      ),
    );
  });
});
