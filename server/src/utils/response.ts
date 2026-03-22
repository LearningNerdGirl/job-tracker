import { Response } from 'express';

export const sendSuccess = (res: Response, data: unknown, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const sendError = (res: Response, message = 'Error', status = 400) =>
  res.status(status).json({ success: false, message });

export const sendPaginated = (
  res: Response,
  data: unknown,
  total: number,
  page: number,
  limit: number
) =>
  res.json({
    success: true,
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
