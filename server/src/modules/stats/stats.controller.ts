import { Response, NextFunction } from 'express';
import * as service from './stats.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth';

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getSummary(req.user!.userId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getTimeline = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getTimeline(req.user!.userId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getFollowUps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getUpcomingFollowUps(req.user!.userId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};
