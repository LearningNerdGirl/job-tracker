import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await service.registerUser(data.name, data.email, data.password);
    sendSuccess(res, user, 'Registration successful', 201);
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await service.loginUser(data.email, data.password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ success: false, message: 'Refresh token required' }); return; }
    const tokens = await service.refreshTokens(refreshToken);
    sendSuccess(res, tokens);
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await service.getMe(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) { next(err); }
};
