import prisma from '../../config/db';
import { ApplicationStatus } from '@prisma/client';

const ALL_STATUSES: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];

export const getSummary = async (userId: number) => {
  const counts = await prisma.application.groupBy({
    by: ['status'],
    where: { userId },
    _count: { status: true },
  });
  const summary: Record<string, number> = {};
  ALL_STATUSES.forEach((s) => { summary[s] = 0; });
  counts.forEach((c) => { summary[c.status] = c._count.status; });
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const responseRate = summary.APPLIED > 0
    ? Math.round(((summary.SCREENING + summary.INTERVIEW + summary.OFFER) / (summary.APPLIED + summary.SCREENING + summary.INTERVIEW + summary.OFFER + summary.REJECTED)) * 100)
    : 0;
  return { summary, total, responseRate };
};

export const getTimeline = async (userId: number) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const apps = await prisma.application.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const byDay: Record<string, number> = {};
  apps.forEach((a) => {
    const day = a.createdAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });
  return Object.entries(byDay).map(([date, count]) => ({ date, count }));
};

export const getUpcomingFollowUps = async (userId: number) => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return prisma.application.findMany({
    where: {
      userId,
      followUpDate: { gte: today, lte: nextWeek },
      status: { notIn: ['REJECTED', 'OFFER'] },
    },
    orderBy: { followUpDate: 'asc' },
  });
};
