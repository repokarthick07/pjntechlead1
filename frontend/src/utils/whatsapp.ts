export interface LeadDataForTemplate {
  businessName?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  email?: string;
  [key: string]: any;
}

export function buildWhatsAppUrl(normalizedPhone: string, message: string): string {
  const cleanPhone = (normalizedPhone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(message || '');
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

export function renderTemplate(
  templateContent: string,
  lead: LeadDataForTemplate,
  companySignature: string = '— PJN Technologies'
): string {
  if (!templateContent) return '';

  let output = templateContent;

  const replacements: Record<string, string> = {
    business_name: lead.businessName || 'Business Partner',
    category: lead.category || 'Business',
    city: lead.city || 'your city',
    state: lead.state || '',
    country: lead.country || '',
    phone: lead.phone || '',
    website: lead.website || '',
    email: lead.email || '',
    company_signature: companySignature
  };

  for (const [key, val] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    output = output.replace(regex, val);
  }

  return output;
}

