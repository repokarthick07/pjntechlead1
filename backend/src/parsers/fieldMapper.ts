export interface RawLeadObject {
  [key: string]: any;
}

export interface StandardLead {
  businessName: string;
  category: string;
  phone: string;
  normalizedPhone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  rating: number;
  reviews: number;
  website: string;
  email: string;
  raw: any;
}

// Field aliases mapping to standardized Lead fields
const FIELD_ALIASES: Record<string, string[]> = {
  businessName: [
    'business_name', 'businessname', 'business name', 'company_name', 'companyname',
    'company name', 'company', 'title', 'name', 'store_name', 'shop_name', 'organization'
  ],
  category: [
    'category', 'category_name', 'categoryname', 'category name', 'business_category',
    'industry', 'type', 'service_type', 'domain', 'segment'
  ],
  phone: [
    'phone', 'phone_number', 'phonenumber', 'phone number', 'mobile', 'mobile_number',
    'mobilenumber', 'telephone', 'tel', 'contact', 'contact_number', 'contactnumber',
    'whatsapp', 'cell', 'phone1'
  ],
  address: [
    'address', 'full_address', 'fulladdress', 'street', 'location', 'address_line1'
  ],
  city: [
    'city', 'town', 'municipality', 'district', 'area', 'region'
  ],
  state: [
    'state', 'province', 'territory'
  ],
  country: [
    'country', 'country_code', 'countrycode', 'nation'
  ],
  rating: [
    'rating', 'total_score', 'totalscore', 'stars', 'score', 'google_rating'
  ],
  reviews: [
    'reviews', 'reviews_count', 'reviewscount', 'total_reviews', 'user_ratings_total', 'review_count'
  ],
  website: [
    'website', 'url', 'site', 'web', 'domain', 'link'
  ],
  email: [
    'email', 'e_mail', 'mail', 'email_address', 'contact_email'
  ]
};

export function normalizeHeaderKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s\-_]+/g, '');
}

export function mapRawLeadToStandard(rawItem: RawLeadObject): Partial<StandardLead> {
  const result: Partial<StandardLead> = {
    businessName: '',
    category: 'General Business',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'IN',
    rating: 0,
    reviews: 0,
    website: '',
    email: '',
    raw: rawItem
  };

  if (!rawItem || typeof rawItem !== 'object') return result;

  const rawKeys = Object.keys(rawItem);
  const normalizedRawMap: Record<string, any> = {};

  for (const key of rawKeys) {
    const cleanKey = normalizeHeaderKey(key);
    normalizedRawMap[cleanKey] = rawItem[key];
  }

  for (const [targetField, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const cleanAlias = normalizeHeaderKey(alias);
      if (normalizedRawMap[cleanAlias] !== undefined && normalizedRawMap[cleanAlias] !== null) {
        const val = String(normalizedRawMap[cleanAlias]).trim();
        if (val) {
          if (targetField === 'rating') {
            const parsed = parseFloat(val);
            result.rating = isNaN(parsed) ? 0 : parsed;
          } else if (targetField === 'reviews') {
            const parsed = parseInt(val, 10);
            result.reviews = isNaN(parsed) ? 0 : parsed;
          } else {
            (result as any)[targetField] = val;
          }
          break;
        }
      }
    }
  }

  // Fallback for businessName if still empty: take first string field with non-numeric value
  if (!result.businessName) {
    for (const key of rawKeys) {
      const val = String(rawItem[key]).trim();
      if (val && val.length > 2 && !/^\+?\d[\d\s\-()]+$/.test(val)) {
        result.businessName = val;
        break;
      }
    }
  }

  // Fallback for phone if still empty: check all keys for digit pattern
  if (!result.phone) {
    for (const key of rawKeys) {
      const val = String(rawItem[key]).trim();
      if (/\+?\d{8,15}/.test(val.replace(/[\s\-()]/g, ''))) {
        result.phone = val;
        break;
      }
    }
  }

  return result;
}
