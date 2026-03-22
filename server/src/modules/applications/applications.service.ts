import prisma from '../../config/db';
import { ApplicationStatus } from '@prisma/client';

export const getApplications = async (
  userId: number,
  page: number,
  limit: number,
  status?: string,
  search?: string
) => {
  const where: any = { userId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { company: { contains: search } },
      { role: { contains: search } },
    ];
  }
  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
    prisma.application.count({ where }),
  ]);
  return { applications, total };
};

export const getApplicationById = async (id: number, userId: number) => {
  const app = await prisma.application.findUnique({
    where: { id },
    include: { logs: { orderBy: { createdAt: 'desc' } } },
  });
  if (!app || app.userId !== userId) throw Object.assign(new Error('Not found'), { statusCode: 404 });
  return app;
};

export const createApplication = async (userId: number, data: {
  company: string; role: string; location?: string;
  salaryMin?: number; salaryMax?: number; status?: ApplicationStatus;
  applyDate?: Date; followUpDate?: Date; jobUrl?: string; notes?: string;
}) => {
  const app = await prisma.application.create({
    data: { userId, ...data },
  });
  await prisma.statusLog.create({
    data: { applicationId: app.id, toStatus: app.status, note: 'Application created' },
  });
  return app;
};

export const updateApplication = async (id: number, userId: number, data: {
  company?: string; role?: string; location?: string;
  salaryMin?: number; salaryMax?: number;
  applyDate?: Date; followUpDate?: Date; jobUrl?: string; notes?: string;
}) => {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw Object.assign(new Error('Not found'), { statusCode: 404 });
  return prisma.application.update({ where: { id }, data });
};

export const updateStatus = async (id: number, userId: number, toStatus: ApplicationStatus, note?: string) => {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw Object.assign(new Error('Not found'), { statusCode: 404 });
  const [app] = await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: toStatus } }),
    prisma.statusLog.create({ data: { applicationId: id, fromStatus: existing.status, toStatus, note } }),
  ]);
  return app;
};

export const getSuggestions = async (userId: number) => {
  const apps = await prisma.application.findMany({
    where: { userId },
    select: { company: true, role: true },
    orderBy: { updatedAt: 'desc' },
  });
  const companies = [...new Set(apps.map((a) => a.company).filter(Boolean))];
  const roles = [...new Set(apps.map((a) => a.role).filter(Boolean))];
  return { companies, roles };
};

export const deleteApplication = async (id: number, userId: number) => {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw Object.assign(new Error('Not found'), { statusCode: 404 });
  return prisma.application.delete({ where: { id } });
};
