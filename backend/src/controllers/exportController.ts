import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { exportLeadsToCSV } from '../utils/csvExporter';
import { exportLeadsToExcel } from '../utils/excelExporter';
import { exportLeadsToPDFBuffer } from '../utils/pdfExporter';
import prisma from '../utils/prisma';
import { ensureUserExists } from '../utils/userHelper';

async function getFilteredLeadsForExport(userId: string, query: any) {
  const { search, category, status, leadIds } = query;
  const where: any = { userId };

  if (leadIds) {
    const ids = String(leadIds).split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length > 0) {
      where.id = { in: ids };
      return prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
  }

  if (search) {
    const q = String(search).trim();
    where.OR = [
      { businessName: { contains: q } },
      { phone: { contains: q } },
      { category: { contains: q } },
      { city: { contains: q } }
    ];
  }

  if (category && category !== 'ALL') where.category = String(category);
  if (status && status !== 'ALL') where.status = String(status);

  return prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function exportCSV(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const leads = await getFilteredLeadsForExport(userId, req.query);

    const csvData = exportLeadsToCSV(leads);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=PJN_Leads_${Date.now()}.csv`);
    return res.send(csvData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function exportExcel(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const leads = await getFilteredLeadsForExport(userId, req.query);

    const excelBuffer = exportLeadsToExcel(leads);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=PJN_Leads_${Date.now()}.xlsx`);
    return res.send(excelBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function exportPDF(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const leads = await getFilteredLeadsForExport(userId, req.query);
    const settings = await prisma.settings.findUnique({ where: { userId } });

    const pdfBuffer = await exportLeadsToPDFBuffer(leads, settings?.companyName || 'PJN Technologies');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PJN_Leads_${Date.now()}.pdf`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
