import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { renderMessageTemplate, findBestMatchingTemplate, buildWhatsAppUrl } from '../services/templateEngine';
import prisma from '../utils/prisma';
import { ensureUserExists } from '../utils/userHelper';

export async function getOutreachSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    await ensureUserExists(userId);
    const { statusFilter = 'PENDING,WHATSAPP_OPENED,FOLLOW_UP' } = req.query;

    const statuses = String(statusFilter)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const templates = await prisma.messageTemplate.findMany({ where: { userId } });
    const settings = await prisma.settings.findUnique({ where: { userId } });
    const companySignature = settings?.companySignature || '— PJN Technologies';

    const totalEligible = await prisma.lead.count({
      where: {
        userId,
        normalizedPhone: { not: '' }
      }
    });

    const contactedCount = await prisma.lead.count({
      where: { userId, status: 'CONTACTED' }
    });

    const whatsappOpenedCount = await prisma.lead.count({
      where: { userId, status: 'WHATSAPP_OPENED' }
    });

    const remainingCount = await prisma.lead.count({
      where: {
        userId,
        normalizedPhone: { not: '' },
        status: { in: statuses }
      }
    });

    let queueSession = await prisma.outreachQueueSession.findUnique({ where: { userId } });
    let currentLead = null;

    if (queueSession?.currentLeadId) {
      currentLead = await prisma.lead.findFirst({
        where: { id: queueSession.currentLeadId, userId }
      });
    }

    if (!currentLead) {
      currentLead = await prisma.lead.findFirst({
        where: {
          userId,
          normalizedPhone: { not: '' },
          status: { in: statuses }
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
      });

      if (currentLead) {
        queueSession = await prisma.outreachQueueSession.upsert({
          where: { userId },
          create: {
            userId,
            currentLeadId: currentLead.id,
            totalEligible,
            contactedCount,
            whatsappOpenedCount,
            remainingCount
          },
          update: {
            currentLeadId: currentLead.id,
            totalEligible,
            contactedCount,
            whatsappOpenedCount,
            remainingCount,
            lastActiveAt: new Date()
          }
        });
      }
    }

    let messagePreview = '';
    let whatsAppUrl = '';

    if (currentLead && currentLead.normalizedPhone) {
      const rawTemplate = findBestMatchingTemplate(currentLead.category || '', templates);
      messagePreview = renderMessageTemplate(rawTemplate, {
        business_name: currentLead.businessName,
        category: currentLead.category || 'Business',
        city: currentLead.city || '',
        state: currentLead.state || '',
        country: currentLead.country || '',
        phone: currentLead.phone || '',
        company_signature: companySignature
      });
      whatsAppUrl = buildWhatsAppUrl(currentLead.normalizedPhone, messagePreview);
    }

    const processedCount = contactedCount + whatsappOpenedCount;

    return res.json({
      session: {
        totalEligible,
        contactedCount,
        whatsappOpenedCount,
        remainingCount,
        processedCount,
        progressText: `${processedCount} / ${totalEligible}`
      },
      lead: currentLead,
      messagePreview,
      whatsAppUrl
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function openWhatsApp(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { leadId, customMessage } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required' });
    }

    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead || !lead.normalizedPhone) {
      return res.status(404).json({ error: 'Lead with valid phone not found' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'WHATSAPP_OPENED',
        whatsappOpenedAt: new Date()
      }
    });

    await prisma.contactHistory.create({
      data: {
        leadId,
        userId,
        action: 'WHATSAPP_OPENED',
        notes: 'WhatsApp Web/App opened with personalized message pre-filled'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        leadId,
        action: 'WHATSAPP_OPENED',
        details: `WhatsApp opened for ${lead.businessName} (+${lead.normalizedPhone})`
      }
    });

    const templates = await prisma.messageTemplate.findMany({ where: { userId } });
    const settings = await prisma.settings.findUnique({ where: { userId } });
    const companySignature = settings?.companySignature || '— PJN Technologies';

    const message = customMessage || renderMessageTemplate(
      findBestMatchingTemplate(lead.category || '', templates),
      {
        business_name: lead.businessName,
        category: lead.category || 'Business',
        city: lead.city || '',
        company_signature: companySignature
      }
    );

    const whatsAppUrl = buildWhatsAppUrl(lead.normalizedPhone, message);

    return res.json({
      success: true,
      lead: updatedLead,
      whatsAppUrl,
      message: 'WhatsApp click-to-chat URL generated and action recorded.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function markContacted(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { leadId, notes } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required' });
    }

    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONTACTED',
        contactedAt: new Date(),
        contactedBy: req.user?.email || 'User'
      }
    });

    await prisma.contactHistory.create({
      data: {
        leadId,
        userId,
        action: 'MARKED_CONTACTED',
        notes: notes || 'Manually marked lead as Contacted'
      }
    });

    const nextLead = await prisma.lead.findFirst({
      where: {
        userId,
        id: { not: leadId },
        normalizedPhone: { not: '' },
        status: { in: ['PENDING', 'WHATSAPP_OPENED', 'FOLLOW_UP'] }
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });

    if (nextLead) {
      await prisma.outreachQueueSession.upsert({
        where: { userId },
        create: { userId, currentLeadId: nextLead.id },
        update: { currentLeadId: nextLead.id, lastActiveAt: new Date() }
      });
    }

    return res.json({
      success: true,
      message: `Lead '${lead.businessName}' marked as Contacted.`,
      nextLead
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function nextLead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { currentLeadId } = req.body;

    const nextLead = await prisma.lead.findFirst({
      where: {
        userId,
        id: currentLeadId ? { not: currentLeadId } : undefined,
        normalizedPhone: { not: '' },
        status: { in: ['PENDING', 'WHATSAPP_OPENED', 'FOLLOW_UP'] }
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });

    if (nextLead) {
      await prisma.outreachQueueSession.upsert({
        where: { userId },
        create: { userId, currentLeadId: nextLead.id },
        update: { currentLeadId: nextLead.id, lastActiveAt: new Date() }
      });
    }

    return res.json({ nextLead });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
