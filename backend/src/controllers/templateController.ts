import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_INDUSTRY_TEMPLATES } from '../services/templateEngine';
import { ensureUserExists } from '../utils/userHelper';
import prisma from '../utils/prisma';

export async function getTemplates(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    await ensureUserExists(userId);

    let templates = await prisma.messageTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // Seed default industry templates if user has no templates
    if (templates.length === 0) {
      for (const t of DEFAULT_INDUSTRY_TEMPLATES) {
        await prisma.messageTemplate.create({
          data: {
            userId,
            name: t.name,
            category: t.category,
            content: t.content,
            isDefault: t.category === 'General Business'
          }
        });
      }

      templates = await prisma.messageTemplate.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      });
    }

    return res.json(templates);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { name, category, content, isDefault } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    if (isDefault) {
      await prisma.messageTemplate.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const template = await prisma.messageTemplate.create({
      data: {
        userId,
        name: name.trim(),
        category: category || 'General Business',
        content: content.trim(),
        isDefault: Boolean(isDefault)
      }
    });

    return res.status(201).json(template);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    await ensureUserExists(userId);
    const { id } = req.params;
    const { name, category, content, isDefault } = req.body;

    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (isDefault) {
      await prisma.messageTemplate.updateMany({
        where: { userId: existing.userId, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.messageTemplate.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        category: category !== undefined ? category : existing.category,
        content: content !== undefined ? content.trim() : existing.content,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    await ensureUserExists(userId);
    const { id } = req.params;

    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await prisma.messageTemplate.delete({ where: { id } });
    return res.json({ success: true, message: 'Template deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
