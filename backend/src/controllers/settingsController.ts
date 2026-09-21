import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';

    let settings = await prisma.settings.findUnique({ where: { userId } });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          companyName: 'PJN Technologies',
          companySignature: '— PJN Technologies',
          defaultCountry: 'IN (+91)',
          autoMarkContacted: false,
          whatsappBehavior: 'web'
        }
      });
    }

    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { companyName, companySignature, defaultCountry, defaultTemplateId, autoMarkContacted, whatsappBehavior } = req.body;

    const settings = await prisma.settings.upsert({
      where: { userId },
      create: {
        userId,
        companyName: companyName || 'PJN Technologies',
        companySignature: companySignature || '— PJN Technologies',
        defaultCountry: defaultCountry || 'IN (+91)',
        defaultTemplateId: defaultTemplateId || null,
        autoMarkContacted: Boolean(autoMarkContacted),
        whatsappBehavior: whatsappBehavior || 'web'
      },
      update: {
        companyName,
        companySignature,
        defaultCountry,
        defaultTemplateId,
        autoMarkContacted: autoMarkContacted !== undefined ? Boolean(autoMarkContacted) : undefined,
        whatsappBehavior
      }
    });

    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
