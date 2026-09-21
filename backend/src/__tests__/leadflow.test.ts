import { normalizeAndValidatePhone } from '../services/phoneNormalizer';
import { renderMessageTemplate, findBestMatchingTemplate, buildWhatsAppUrl } from '../services/templateEngine';
import { mapRawLeadToStandard } from '../parsers/fieldMapper';
import { parseJSONBuffer } from '../parsers/jsonParser';
import { parseCSVBuffer } from '../parsers/csvParser';
import { parseXMLBuffer } from '../parsers/xmlParser';

describe('PJN LeadFlow Engine Unit Tests', () => {
  describe('Phone Normalization & Validation', () => {
    test('Normalizes UAE phone +971 56 644 5055 to E.164 digits without plus', () => {
      const res = normalizeAndValidatePhone('+971 56 644 5055', 'AE');
      expect(res.normalizedPhone).toBe('971566445055');
      expect(res.isValid).toBe(true);
      expect(res.status).toBe('VALID');
    });

    test('Normalizes Indian phone 9876543210 using default country IN to 919876543210', () => {
      const res = normalizeAndValidatePhone('9876543210', 'IN');
      expect(res.normalizedPhone).toBe('919876543210');
      expect(res.isValid).toBe(true);
      expect(res.status).toBe('VALID');
    });

    test('Tags missing or invalid phone number strings correctly', () => {
      const emptyRes = normalizeAndValidatePhone('', 'IN');
      expect(emptyRes.status).toBe('MISSING');

      const invalidRes = normalizeAndValidatePhone('123', 'IN');
      expect(invalidRes.status).toBe('MISSING');
    });
  });

  describe('WhatsApp URL Generation & Message Variable Replacement', () => {
    test('Renders template variables correctly', () => {
      const template = 'Hi {{business_name}} 👋 We loved your work in {{city}}! — {{company_signature}}';
      const rendered = renderMessageTemplate(template, {
        business_name: 'Decor N More LLC',
        city: 'Dubai',
        company_signature: '— PJN Technologies'
      });
      expect(rendered).toContain('Decor N More LLC');
      expect(rendered).toContain('Dubai');
      expect(rendered).toContain('— PJN Technologies');
    });

    test('Generates valid WhatsApp click-to-chat URL', () => {
      const url = buildWhatsAppUrl('971566445055', 'Hi Decor N More LLC');
      expect(url).toBe('https://web.whatsapp.com/send?phone=971566445055&text=Hi%20Decor%20N%20More%20LLC');
    });

    test('Matches category template dynamically', () => {
      const matched = findBestMatchingTemplate('Interior Design');
      expect(matched).toContain('interior design');
    });
  });

  describe('Field Mapping & Ingestion Parsers', () => {
    test('Maps raw field variations to Standard Lead fields', () => {
      const raw = {
        title: 'ABC Construction',
        categoryName: 'Construction',
        telephone: '+91 98765 43210',
        city: 'Bangalore',
        totalScore: '4.8',
        reviewsCount: '50'
      };

      const mapped = mapRawLeadToStandard(raw);
      expect(mapped.businessName).toBe('ABC Construction');
      expect(mapped.category).toBe('Construction');
      expect(mapped.phone).toBe('+91 98765 43210');
      expect(mapped.rating).toBe(4.8);
      expect(mapped.reviews).toBe(50);
    });

    test('Parses Array JSON lead buffer', () => {
      const jsonText = JSON.stringify([
        { name: 'Test Business 1', phone: '+919876543210' },
        { company_name: 'Test Business 2', mobile: '+971501234567' }
      ]);
      const leads = parseJSONBuffer(Buffer.from(jsonText));
      expect(leads.length).toBe(2);
      expect(leads[0].businessName).toBe('Test Business 1');
      expect(leads[1].businessName).toBe('Test Business 2');
    });
  });
});
