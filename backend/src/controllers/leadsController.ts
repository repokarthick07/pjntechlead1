import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { normalizeAndValidatePhone } from '../services/phoneNormalizer';

const prisma = new PrismaClient();

export async function getLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const {
      search,
      category,
      country,
      city,
      status,
      minRating,
      hasPhone,
      followUpToday,
      page = '1',
      limit = '25',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { businessName: { contains: q } },
        { phone: { contains: q } },
        { normalizedPhone: { contains: q } },
        { category: { contains: q } },
        { city: { contains: q } },
        { address: { contains: q } }
      ];
    }

    if (category && String(category) !== 'ALL') {
      where.category = String(category);
    }

    if (country && String(country) !== 'ALL') {
      where.country = String(country);
    }

    if (city && String(city) !== 'ALL') {
      where.city = String(city);
    }

    if (status && String(status) !== 'ALL') {
      where.status = String(status);
    }

    if (minRating && !isNaN(parseFloat(String(minRating)))) {
      where.rating = { gte: parseFloat(String(minRating)) };
    }

    if (hasPhone === 'true') {
      where.normalizedPhone = { not: '' };
    } else if (hasPhone === 'false') {
      where.OR = [{ normalizedPhone: '' }, { normalizedPhone: null }];
    }

    if (followUpToday === 'true') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      where.followUpDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const total = await prisma.lead.count({ where });

    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [String(sortBy)]: String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc'
      },
      include: {
        _count: {
          select: { contactHistory: true, followUps: true }
        }
      }
    });

    const categoriesGroup = await prisma.lead.groupBy({
      by: ['category'],
      where: { userId },
      _count: { category: true }
    });

    const citiesGroup = await prisma.lead.groupBy({
      by: ['city'],
      where: { userId, city: { not: '' } },
      _count: { city: true }
    });

    return res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      filterOptions: {
        categories: categoriesGroup.map((c) => ({ name: c.category || 'General', count: c._count.category })),
        cities: citiesGroup.map((c) => ({ name: c.city || 'Unknown', count: c._count.city }))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getLeadById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { id } = req.params;

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
      include: {
        contactHistory: { orderBy: { timestamp: 'desc' } },
        followUps: { orderBy: { date: 'asc' } }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json(lead);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createLead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const {
      businessName,
      category,
      phone,
      country = 'IN',
      state,
      city,
      address,
      rating,
      reviews,
      website,
      email,
      notes
    } = req.body;

    if (!businessName || !businessName.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const defaultCountryCode = country.includes('+971') ? 'AE' : 'IN';
    const phoneVal = normalizeAndValidatePhone(phone, defaultCountryCode);

    const lead = await prisma.lead.create({
      data: {
        userId,
        businessName: businessName.trim(),
        category: category || 'General Business',
        phone: phone || '',
        normalizedPhone: phoneVal.normalizedPhone,
        country: country || 'IN',
        state: state || '',
        city: city || '',
        address: address || '',
        rating: typeof rating === 'number' ? rating : parseFloat(rating) || 0.0,
        reviews: typeof reviews === 'number' ? reviews : parseInt(reviews, 10) || 0,
        website: website || '',
        email: email || '',
        notes: notes || '',
        status: 'PENDING'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        leadId: lead.id,
        action: 'LEAD_CREATED',
        details: `Manually created lead: ${lead.businessName}`
      }
    });

    return res.status(201).json(lead);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateLead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { id } = req.params;
    const {
      businessName,
      category,
      phone,
      country,
      state,
      city,
      address,
      rating,
      reviews,
      website,
      email,
      status,
      notes,
      followUpDate
    } = req.body;

    const existing = await prisma.lead.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let normalizedPhone = existing.normalizedPhone;
    if (phone !== undefined && phone !== existing.phone) {
      const defaultCountryCode = (country || existing.country || 'IN').includes('+971') ? 'AE' : 'IN';
      const phoneVal = normalizeAndValidatePhone(phone, defaultCountryCode);
      normalizedPhone = phoneVal.normalizedPhone;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        businessName: businessName !== undefined ? businessName : existing.businessName,
        category: category !== undefined ? category : existing.category,
        phone: phone !== undefined ? phone : existing.phone,
        normalizedPhone,
        country: country !== undefined ? country : existing.country,
        state: state !== undefined ? state : existing.state,
        city: city !== undefined ? city : existing.city,
        address: address !== undefined ? address : existing.address,
        rating: rating !== undefined ? parseFloat(rating) : existing.rating,
        reviews: reviews !== undefined ? parseInt(reviews, 10) : existing.reviews,
        website: website !== undefined ? website : existing.website,
        email: email !== undefined ? email : existing.email,
        status: status !== undefined ? status : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
        followUpDate: followUpDate ? new Date(followUpDate) : existing.followUpDate
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        leadId: id,
        action: 'LEAD_EDITED',
        details: `Updated details for ${updated.businessName}`
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteLead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { id } = req.params;

    const existing = await prisma.lead.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await prisma.lead.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LEAD_DELETED',
        details: `Deleted lead: ${existing.businessName}`
      }
    });

    return res.json({ success: true, message: `Lead '${existing.businessName}' deleted` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function bulkUpdateStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { leadIds, status } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0 || !status) {
      return res.status(400).json({ error: 'leadIds array and status are required' });
    }

    const updated = await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        userId
      },
      data: { status }
    });

    return res.json({ success: true, updatedCount: updated.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function bulkDeleteLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'leadIds array is required' });
    }

    const deleted = await prisma.lead.deleteMany({
      where: {
        id: { in: leadIds },
        userId
      }
    });

    return res.json({ success: true, deletedCount: deleted.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
