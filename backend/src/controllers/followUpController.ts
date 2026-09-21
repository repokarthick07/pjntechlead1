import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { ensureUserExists } from '../utils/userHelper';

export async function createFollowUp(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { leadId, title, date, time, notes } = req.body;

    if (!leadId || !date) {
      return res.status(400).json({ error: 'leadId and date are required' });
    }

    const followUpDate = new Date(date);

    const followUp = await prisma.followUp.create({
      data: {
        userId,
        leadId,
        title: title || 'Scheduled WhatsApp Follow-up',
        date: followUpDate,
        time: time || '10:00 AM',
        notes: notes || '',
        status: 'PENDING'
      }
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        followUpDate,
        status: 'FOLLOW_UP'
      }
    });

    await prisma.contactHistory.create({
      data: {
        leadId,
        userId,
        action: 'FOLLOW_UP_SCHEDULED',
        notes: `Follow-up scheduled for ${followUpDate.toLocaleDateString()} ${time || ''}`
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        leadId,
        action: 'FOLLOW_UP_SCHEDULED',
        details: `Follow-up set for ${date}`
      }
    });

    return res.status(201).json(followUp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getTodayFollowUps(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const followUps = await prisma.followUp.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: { lead: true },
      orderBy: { date: 'asc' }
    });

    return res.json(followUps);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateFollowUpStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.followUp.update({
      where: { id },
      data: { status }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
