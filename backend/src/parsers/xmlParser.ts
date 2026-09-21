import { XMLParser } from 'fast-xml-parser';
import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export function parseXMLBuffer(buffer: Buffer): Partial<StandardLead>[] {
  const xmlText = buffer.toString('utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });

  const parsed = parser.parse(xmlText);
  const rawObjects: Record<string, any>[] = [];

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          if (hasLeadLikeProperties(item)) {
            rawObjects.push(item);
          } else {
            traverse(item);
          }
        }
      }
    } else {
      for (const key of Object.keys(obj)) {
        const child = obj[key];
        if (Array.isArray(child)) {
          traverse(child);
        } else if (typeof child === 'object' && child !== null) {
          if (hasLeadLikeProperties(child)) {
            rawObjects.push(child);
          } else {
            traverse(child);
          }
        }
      }
    }
  }

  function hasLeadLikeProperties(item: Record<string, any>): boolean {
    const keys = Object.keys(item).map((k) => k.toLowerCase());
    return keys.some((k) =>
      ['name', 'title', 'businessname', 'company', 'phone', 'mobile', 'telephone', 'contact'].some((term) =>
        k.includes(term)
      )
    );
  }

  traverse(parsed);

  return rawObjects.map((item) => mapRawLeadToStandard(item));
}
