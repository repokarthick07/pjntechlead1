import * as XLSX from 'xlsx';
import { mapRawLeadToStandard, StandardLead } from './fieldMapper';

export function parseCSVBuffer(buffer: Buffer): Partial<StandardLead>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  return rawRows.map((row) => mapRawLeadToStandard(row));
}
