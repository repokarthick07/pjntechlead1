import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export function parseJSONBuffer(buffer: Buffer): Partial<StandardLead>[] {
  const text = buffer.toString('utf-8');
  let data: any;

  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON file content');
  }

  const rawObjects: Record<string, any>[] = [];

  function extractObjects(obj: any) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          rawObjects.push(item);
        }
      }
    } else if (typeof obj === 'object') {
      // Check if root object has keys containing array of leads
      let foundArray = false;
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          foundArray = true;
          extractObjects(obj[key]);
        }
      }
      if (!foundArray) {
        rawObjects.push(obj);
      }
    }
  }

  extractObjects(data);

  return rawObjects.map((item) => mapRawLeadToStandard(item));
}
