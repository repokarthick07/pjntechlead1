import { parsePhoneNumberWithError, CountryCode } from 'libphonenumber-js';

export interface PhoneValidationResult {
  rawPhone: string;
  normalizedPhone: string; // e.g. "971566445055" or "919876543210"
  formattedPhone: string;  // e.g. "+971 56 644 5055"
  isValid: boolean;
  country: string;
  status: 'VALID' | 'INVALID' | 'MISSING';
  reason?: string;
}

export function normalizeAndValidatePhone(
  phoneInput?: string,
  defaultCountryCode: string = 'IN'
): PhoneValidationResult {
  if (!phoneInput || typeof phoneInput !== 'string') {
    return {
      rawPhone: '',
      normalizedPhone: '',
      formattedPhone: '',
      isValid: false,
      country: defaultCountryCode,
      status: 'MISSING',
      reason: 'No phone number provided'
    };
  }

  const cleaned = phoneInput.trim().replace(/[^\d+]/g, '');

  if (!cleaned || cleaned.replace(/\D/g, '').length < 6) {
    return {
      rawPhone: phoneInput,
      normalizedPhone: '',
      formattedPhone: phoneInput,
      isValid: false,
      country: defaultCountryCode,
      status: 'MISSING',
      reason: 'Phone number string has insufficient digits'
    };
  }

  // Derive country code standard (2-letter ISO code e.g. IN, AE, US, GB)
  let isoCountry: CountryCode = (defaultCountryCode.toUpperCase() as CountryCode) || 'IN';

  try {
    const phoneNumber = parsePhoneNumberWithError(cleaned, isoCountry);
    const isValid = phoneNumber.isValid();
    const e164 = phoneNumber.format('E.164'); // e.g. "+971566445055"
    const digitsOnly = e164.replace('+', '');

    return {
      rawPhone: phoneInput,
      normalizedPhone: digitsOnly,
      formattedPhone: phoneNumber.formatInternational(),
      isValid,
      country: phoneNumber.country || isoCountry,
      status: isValid ? 'VALID' : 'INVALID',
      reason: isValid ? undefined : 'Invalid number for country format'
    };
  } catch (error: any) {
    // Basic fallback regex normalization if libphonenumber fails to parse custom layout
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return {
        rawPhone: phoneInput,
        normalizedPhone: digits,
        formattedPhone: '+' + digits,
        isValid: true,
        country: defaultCountryCode,
        status: 'VALID'
      };
    }

    return {
      rawPhone: phoneInput,
      normalizedPhone: digits,
      formattedPhone: phoneInput,
      isValid: false,
      country: defaultCountryCode,
      status: 'INVALID',
      reason: error?.message || 'Phone number format error'
    };
  }
}
