import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export function parseTXTBuffer(buffer: Buffer): Partial<StandardLead>[] {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rawItems: Record<string, any>[] = [];

  let current: Record<string, any> = {};

  for (const line of lines) {
    if (line.includes('|') || line.includes('\t') || line.includes(',')) {
      const delimiter = line.includes('|') ? '|' : line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map((p) => p.trim());
      const item: Record<string, any> = {};
      parts.forEach((p, idx) => {
        if (/\+?\d[\d\s\-()]{7,}/.test(p)) {
          item.phone = p;
        } else if (idx === 0) {
          item.businessName = p;
        } else if (idx === 1) {
          item.category = p;
        } else {
          item.city = p;
        }
      });
      if (item.businessName || item.phone) {
        rawItems.push(item);
      }
      continue;
    }

    if (line.includes(':')) {
      const [k, ...v] = line.split(':');
      const key = k.trim().toLowerCase();
      const val = v.join(':').trim();
      current[key] = val;
      continue;
    }

    // Blank line or boundary
    if (Object.keys(current).length > 0) {
      rawItems.push(current);
      current = {};
    }
  }

  if (Object.keys(current).length > 0) {
    rawItems.push(current);
  }

  return rawItems.map((item) => mapRawLeadToStandard(item));
}
