import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';

    const totalLeads = await prisma.lead.count({ where: { userId } });
    const pendingLeads = await prisma.lead.count({ where: { userId, status: 'PENDING' } });
    const whatsappOpened = await prisma.lead.count({ where: { userId, status: 'WHATSAPP_OPENED' } });
    const contactedLeads = await prisma.lead.count({ where: { userId, status: 'CONTACTED' } });
    const followUpLeads = await prisma.lead.count({ where: { userId, status: 'FOLLOW_UP' } });
    const interestedLeads = await prisma.lead.count({ where: { userId, status: 'INTERESTED' } });
    const convertedLeads = await prisma.lead.count({ where: { userId, status: 'CONVERTED' } });
    const notInterestedLeads = await prisma.lead.count({ where: { userId, status: 'NOT_INTERESTED' } });

    const totalWithPhone = await prisma.lead.count({ where: { userId, normalizedPhone: { not: '' } } });
    const remainingToContact = totalWithPhone - contactedLeads - convertedLeads - notInterestedLeads;

    const statusBreakdown = [
      { name: 'Pending', count: pendingLeads, color: '#3B82F6' },
      { name: 'WhatsApp Opened', count: whatsappOpened, color: '#8B5CF6' },
      { name: 'Contacted', count: contactedLeads, color: '#25D366' },
      { name: 'Follow-Up', count: followUpLeads, color: '#F59E0B' },
      { name: 'Interested', count: interestedLeads, color: '#10B981' },
      { name: 'Converted', count: convertedLeads, color: '#059669' },
      { name: 'Not Interested', count: notInterestedLeads, color: '#EF4444' }
    ];

    const categoryGroup = await prisma.lead.groupBy({
      by: ['category'],
      where: { userId },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6
    });

    const categoryDistribution = categoryGroup.map((c) => ({
      name: c.category || 'General Business',
      value: c._count.category
    }));

    const recentActivities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: { lead: { select: { businessName: true, phone: true } } }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayFollowUps = await prisma.followUp.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
      include: { lead: true },
      take: 5
    });

    return res.json({
      metrics: {
        totalLeads,
        pendingLeads,
        whatsappOpened,
        contactedLeads,
        followUpLeads,
        interestedLeads,
        convertedLeads,
        notInterestedLeads,
        totalWithPhone,
        remainingToContact: Math.max(0, remainingToContact)
      },
      statusBreakdown,
      categoryDistribution,
      recentActivities,
      todayFollowUps
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
