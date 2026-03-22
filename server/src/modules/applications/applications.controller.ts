import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from './applications.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth';
import { ApplicationStatus } from '@prisma/client';

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  applyDate: z.string().optional(),
  followUpDate: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  note: z.string().optional(),
});

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { status, search } = req.query as { status?: string; search?: string };
    const { applications, total } = await service.getApplications(req.user!.userId, page, limit, status, search);
    sendPaginated(res, applications, total, page, limit);
  } catch (err) { next(err); }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const app = await service.getApplicationById(Number(req.params.id), req.user!.userId);
    sendSuccess(res, app);
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createSchema.parse(req.body);
    const app = await service.createApplication(req.user!.userId, {
      ...data,
      applyDate: data.applyDate ? new Date(data.applyDate) : undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      jobUrl: data.jobUrl || undefined,
    });
    sendSuccess(res, app, 'Application created', 201);
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createSchema.partial().parse(req.body);
    const app = await service.updateApplication(Number(req.params.id), req.user!.userId, {
      ...data,
      applyDate: data.applyDate ? new Date(data.applyDate) : undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      jobUrl: data.jobUrl || undefined,
    });
    sendSuccess(res, app);
  } catch (err) { next(err); }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = updateStatusSchema.parse(req.body);
    const app = await service.updateStatus(Number(req.params.id), req.user!.userId, status, note);
    sendSuccess(res, app);
  } catch (err) { next(err); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.deleteApplication(Number(req.params.id), req.user!.userId);
    sendSuccess(res, null, 'Application deleted');
  } catch (err) { next(err); }
};

export const getSuggestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await service.getSuggestions(req.user!.userId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};
