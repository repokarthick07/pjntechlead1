import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { parseLeadFileBuffer } from '../parsers';
import { normalizeAndValidatePhone } from '../services/phoneNormalizer';
import { evaluateLeadsForPreview } from '../services/duplicateDetector';

const prisma = new PrismaClient();

export async function uploadAndPreview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user?.id || 'default-user-id';
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const buffer = req.file.buffer;

    const settings = await prisma.settings.findUnique({ where: { userId } });
    const defaultCountry = settings?.defaultCountry?.includes('+971') ? 'AE' : 'IN';

    const parseRes = await parseLeadFileBuffer(buffer, fileName, req.file.mimetype);

    const parsedWithPhones = parseRes.leads.map((item) => {
      const phoneValidation = normalizeAndValidatePhone(item.phone, defaultCountry);
      return {
        ...item,
        phoneValidation
      };
    });

    const previewData = await evaluateLeadsForPreview(
      prisma,
      userId,
      fileName,
      parseRes.fileType,
      fileSize,
      parsedWithPhones,
      defaultCountry
    );

    return res.json({
      ...previewData,
      parseMessage: parseRes.message,
      extractedTextSuccess: parseRes.extractedTextSuccess
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Upload error: ${err.message}` });
  }
}

export async function processImport(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const { items, fileName, fileType, fileSize, duplicateStrategy } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items to import' });
    }

    const strategy = duplicateStrategy || 'skip';

    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const importJob = await prisma.importJob.create({
      data: {
        userId,
        fileName: fileName || 'Uploaded_Leads_File',
        fileType: fileType || 'UNKNOWN',
        fileSize: fileSize || 0,
        recordsDetected: items.length,
        status: 'PROCESSING'
      }
    });

    for (const item of items) {
      const {
        businessName,
        category,
        phone,
        normalizedPhone,
        country,
        state,
        city,
        address,
        rating,
        reviews,
        website,
        email,
        isDuplicate,
        isInvalid
      } = item;

      if (isInvalid && !phone) {
        invalidCount++;
      }

      if (isDuplicate) {
        duplicateCount++;
        if (strategy === 'skip') {
          await prisma.importRecord.create({
            data: {
              importJobId: importJob.id,
              rawData: JSON.stringify(item),
              isImported: false,
              isDuplicate: true,
              errorMessage: 'Skipped due to duplicate normalized phone number'
            }
          });
          continue;
        }

        if (strategy === 'update' && normalizedPhone) {
          const existing = await prisma.lead.findFirst({
            where: { userId, normalizedPhone }
          });

          if (existing) {
            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                businessName: businessName || existing.businessName,
                category: category || existing.category,
                city: city || existing.city,
                address: address || existing.address,
                rating: rating || existing.rating,
                reviews: reviews || existing.reviews,
                website: website || existing.website,
                email: email || existing.email
              }
            });
            importedCount++;
            continue;
          }
        }
      }

      await prisma.lead.create({
        data: {
          userId,
          businessName: businessName || 'Unnamed Business',
          category: category || 'General Business',
          phone: phone || '',
          normalizedPhone: normalizedPhone || '',
          country: country || 'IN',
          state: state || '',
          city: city || '',
          address: address || '',
          rating: typeof rating === 'number' ? rating : 0.0,
          reviews: typeof reviews === 'number' ? reviews : 0,
          website: website || '',
          email: email || '',
          status: 'PENDING',
          importJobId: importJob.id
        }
      });

      importedCount++;
    }

    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        importedCount,
        duplicateCount,
        invalidCount,
        status: 'COMPLETED'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'FILE_IMPORTED',
        details: `Imported ${importedCount} leads from ${fileName} (${duplicateCount} duplicates, ${invalidCount} invalid)`
      }
    });

    return res.json({
      success: true,
      importJobId: importJob.id,
      totalDetected: items.length,
      importedCount,
      duplicateCount,
      invalidCount,
      message: `${importedCount} leads imported successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Import failed: ${err.message}` });
  }
}

export async function getImportHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const jobs = await prisma.importJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.json(jobs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
