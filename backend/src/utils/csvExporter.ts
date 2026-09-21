import { Lead } from '@prisma/client';

export function exportLeadsToCSV(leads: Lead[]): string {
  const headers = [
    'ID',
    'Business Name',
    'Category',
    'Phone',
    'Normalized Phone',
    'Country',
    'City',
    'Address',
    'Rating',
    'Reviews',
    'Status',
    'Last Contacted At',
    'Follow Up Date',
    'WhatsApp URL'
  ];

  const rows = leads.map((l) => {
    const waUrl = l.normalizedPhone ? `https://wa.me/${l.normalizedPhone}` : '';
    return [
      `"${l.id}"`,
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.normalizedPhone || '').replace(/"/g, '""')}"`,
      `"${(l.country || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      l.rating || 0,
      l.reviews || 0,
      `"${l.status}"`,
      `"${l.contactedAt ? l.contactedAt.toISOString() : ''}"`,
      `"${l.followUpDate ? l.followUpDate.toISOString() : ''}"`,
      `"${waUrl}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
