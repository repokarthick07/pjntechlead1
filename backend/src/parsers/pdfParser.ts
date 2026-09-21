import pdfParse from 'pdf-parse';
import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export interface PDFParseResult {
  leads: Partial<StandardLead>[];
  extractedTextSuccess: boolean;
  message: string;
}

export async function parsePDFBuffer(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';

    if (!text.trim() || text.trim().length < 20) {
      return {
        leads: [],
        extractedTextSuccess: false,
        message: 'This PDF appears to be scanned or image-based. OCR extraction recommended.'
      };
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rawItems: Record<string, any>[] = [];

    // Pattern 1: Delimiter based lines (e.g. "ABC Decor | Interior | +971566445055 | Dubai")
    // Pattern 2: Line groupings of Business Name followed by Phone Number
    let currentLead: Record<string, any> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check pipe or comma or tab separated tabular line
      if (line.includes('|') || line.includes('\t') || (line.includes(',') && /\d{8,}/.test(line))) {
        const parts = line.split(/[|\t,]/).map((p) => p.trim());
        if (parts.length >= 2) {
          const item: Record<string, any> = {};
          for (const part of parts) {
            if (/\+?\d[\d\s\-()]{7,}/.test(part) && !item.phone) {
              item.phone = part;
            } else if (!item.businessName && !/^\d+$/.test(part)) {
              item.businessName = part;
            } else if (!item.category && !item.city) {
              item.category = part;
            } else {
              item.city = part;
            }
          }
          if (item.businessName || item.phone) {
            rawItems.push(item);
          }
          continue;
        }
      }

      // Check key: value format
      if (line.includes(':')) {
        const [k, ...v] = line.split(':');
        const key = k.trim().toLowerCase();
        const val = v.join(':').trim();

        if (['business', 'name', 'company', 'title'].some((x) => key.includes(x))) {
          if (currentLead.businessName) {
            rawItems.push(currentLead);
            currentLead = {};
          }
          currentLead.businessName = val;
        } else if (['phone', 'mobile', 'tel', 'contact'].some((x) => key.includes(x))) {
          currentLead.phone = val;
        } else if (['category', 'industry'].some((x) => key.includes(x))) {
          currentLead.category = val;
        } else if (['city', 'location', 'address'].some((x) => key.includes(x))) {
          currentLead.city = val;
        }
        continue;
      }

      // Standalone line check: Phone number detection
      const phoneMatch = line.match(/\+?\d[\d\s\-()]{8,}/);
      if (phoneMatch) {
        if (!currentLead.phone) {
          currentLead.phone = phoneMatch[0];
        }
        if (currentLead.businessName) {
          rawItems.push(currentLead);
          currentLead = {};
        }
      } else if (line.length > 2 && !/^\d+$/.test(line)) {
        if (!currentLead.businessName) {
          currentLead.businessName = line;
        } else if (!currentLead.category) {
          currentLead.category = line;
        }
      }
    }

    if (currentLead.businessName || currentLead.phone) {
      rawItems.push(currentLead);
    }

    const leads = rawItems.map((item) => mapRawLeadToStandard(item));

    return {
      leads,
      extractedTextSuccess: true,
      message: `Text extracted successfully from PDF (${leads.length} records parsed)`
    };
  } catch (error: any) {
    return {
      leads: [],
      extractedTextSuccess: false,
      message: `PDF parsing error: ${error.message}`
    };
  }
}
