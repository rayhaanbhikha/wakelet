import { Request, Response } from 'express';
import { dbService } from './db';
import { envs } from './envs';
import { decodeCursor } from './utils/cursor';
import {
  validateLimit,
  validateOffsetId,
  validateSortBy,
} from './utils/validation';

export const eventsHandler = async (req: Request, res: Response) => {
  try {
    const sortBy = validateSortBy(req.query.sortBy as string, '');
    const offsetId = validateOffsetId(req.query.offsetId as string, '');
    const scanLimit = validateLimit(
      req.query.limit as string,
      envs.DEFAULT_SCAN_LIMIT,
    );

    const cursor = decodeCursor(offsetId);
    const index = dbService.getIndex(sortBy);

    console.log({ index: index?.name, cursor, limit: scanLimit });

    const result = await dbService.scan({ index, cursor, limit: scanLimit });

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
