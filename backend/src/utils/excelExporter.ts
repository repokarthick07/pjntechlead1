import * as XLSX from 'xlsx';
import { Lead } from '@prisma/client';

export function exportLeadsToExcel(leads: Lead[]): Buffer {
  const data = leads.map((l) => ({
    'ID': l.id,
    'Business Name': l.businessName,
    'Category': l.category,
    'Phone': l.phone,
    'Normalized Phone': l.normalizedPhone,
    'Country': l.country,
    'City': l.city,
    'Address': l.address,
    'Rating': l.rating,
    'Reviews': l.reviews,
    'Status': l.status,
    'Last Contacted At': l.contactedAt ? l.contactedAt.toISOString() : '',
    'Follow Up Date': l.followUpDate ? l.followUpDate.toISOString() : '',
    'WhatsApp Link': l.normalizedPhone ? `https://wa.me/${l.normalizedPhone}` : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PJN Leads');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
