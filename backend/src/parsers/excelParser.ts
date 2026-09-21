import * as XLSX from 'xlsx';
import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export function parseExcelBuffer(buffer: Buffer): Partial<StandardLead>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const allLeads: Partial<StandardLead>[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    for (const row of rawRows) {
      allLeads.push(mapRawLeadToStandard(row));
    }
  }

  return allLeads;
}
