import { PrismaClient } from '@prisma/client';
import { PhoneValidationResult } from './phoneNormalizer';

export interface EvaluatedLeadItem {
  raw: any;
  businessName: string;
  category: string;
  phone: string;
  normalizedPhone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  rating: number;
  reviews: number;
  website: string;
  email: string;
  phoneValidation: PhoneValidationResult;
  isDuplicate: boolean;
  isInvalid: boolean;
  isMissingPhone: boolean;
}

export interface ImportPreviewStatistics {
  fileName: string;
  fileType: string;
  fileSize: number;
  totalRecordsDetected: number;
  validBusinessNamesCount: number;
  validPhonesCount: number;
  missingPhonesCount: number;
  invalidPhonesCount: number;
  duplicatesCount: number;
  message?: string;
  items: EvaluatedLeadItem[];
}

export async function evaluateLeadsForPreview(
  prisma: PrismaClient,
  userId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  parsedLeads: any[],
  defaultCountry: string = 'IN'
): Promise<ImportPreviewStatistics> {
  const evaluatedItems: EvaluatedLeadItem[] = [];

  // Fetch existing normalized phones for this user to detect duplicates against DB
  const existingLeads = await prisma.lead.findMany({
    where: { userId },
    select: { normalizedPhone: true }
  });

  const existingPhoneSet = new Set<string>(
    existingLeads.map((l) => l.normalizedPhone).filter(Boolean) as string[]
  );

  const seenInCurrentBatch = new Set<string>();

  let validBusinessNamesCount = 0;
  let validPhonesCount = 0;
  let missingPhonesCount = 0;
  let invalidPhonesCount = 0;
  let duplicatesCount = 0;

  for (const item of parsedLeads) {
    const businessName = item.businessName || 'Unnamed Business';
    if (businessName !== 'Unnamed Business') {
      validBusinessNamesCount++;
    }

    const phoneValidation: PhoneValidationResult = item.phoneValidation;
    const normalizedPhone = phoneValidation.normalizedPhone;

    let isMissingPhone = phoneValidation.status === 'MISSING';
    let isInvalid = phoneValidation.status === 'INVALID';

    if (phoneValidation.isValid) {
      validPhonesCount++;
    } else if (isMissingPhone) {
      missingPhonesCount++;
    } else {
      invalidPhonesCount++;
    }

    let isDuplicate = false;
    if (normalizedPhone && normalizedPhone.length >= 6) {
      if (existingPhoneSet.has(normalizedPhone) || seenInCurrentBatch.has(normalizedPhone)) {
        isDuplicate = true;
        duplicatesCount++;
      } else {
        seenInCurrentBatch.add(normalizedPhone);
      }
    }

    evaluatedItems.push({
      raw: item.raw || item,
      businessName,
      category: item.category || 'General Business',
      phone: item.phone || '',
      normalizedPhone,
      country: item.country || defaultCountry,
      state: item.state || '',
      city: item.city || '',
      address: item.address || '',
      rating: item.rating || 0.0,
      reviews: item.reviews || 0,
      website: item.website || '',
      email: item.email || '',
      phoneValidation,
      isDuplicate,
      isInvalid,
      isMissingPhone
    });
  }

  return {
    fileName,
    fileType,
    fileSize,
    totalRecordsDetected: evaluatedItems.length,
    validBusinessNamesCount,
    validPhonesCount,
    missingPhonesCount,
    invalidPhonesCount,
    duplicatesCount,
    items: evaluatedItems
  };
}
