export interface TemplateVariableContext {
  business_name?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  email?: string;
  company_name?: string;
  company_signature?: string;
}

export interface DefaultIndustryTemplate {
  name: string;
  category: string;
  content: string;
}

export const DEFAULT_INDUSTRY_TEMPLATES: DefaultIndustryTemplate[] = [
  {
    name: 'General Business Outreach',
    category: 'General Business',
    content: `Hi {{business_name}} 👋

We came across your business and loved what you’re offering! 🌟

We help businesses grow online with:

🌐 Professional Website Development
📱 Social Media Marketing
🎬 Reels & Creative Content
📈 Digital Marketing & Lead Generation
🎨 Posters & Branding

Would you be open to a quick chat about how we can help your business grow? 🚀

{{company_signature}}`
  },
  {
    name: 'Construction Outreach',
    category: 'Construction',
    content: `Hi {{business_name}} 👋

We came across your construction business and loved what you're building! 🏗️

We help construction companies get more client enquiries online through:

🌐 Professional Website & Portfolio Showcase
📱 Social Media Marketing & Site Tour Reels
🎬 Project Videos & Drone Footage Branding
📈 Targeted Lead Generation Ads

Would you be open to a quick chat? 🚀

{{company_signature}}`
  },
  {
    name: 'Interior Design Outreach',
    category: 'Interior Design',
    content: `Hi {{business_name}} 👋

We saw your interior design work in {{city}} and were truly impressed by your aesthetic! 🎨✨

We help interior design studios attract high-ticket clients with:

🌐 Architectural & Portfolio Website Design
📸 High-Quality Instagram Reels & Before/After Showcases
📈 Premium Facebook & Google Ads for Homeowners

Are you available for a brief 5-minute call this week?

{{company_signature}}`
  },
  {
    name: 'Restaurant & Cafe Outreach',
    category: 'Restaurant',
    content: `Hi {{business_name}} 👋

Your menu and food presentations look incredible! 🍔🍕

We help restaurants & cafes increase foot traffic & online orders through:

🎬 Viral Food Reels & TikTok Content
📲 Interactive Digital QR Menus & Mobile Sites
🚀 Local Google Map SEO & Instagram Promotion

Would you be open to a quick chat on boosting daily orders? 🚀

{{company_signature}}`
  },
  {
    name: 'Real Estate Outreach',
    category: 'Real Estate',
    content: `Hi {{business_name}} 👋

We noticed your property listings and real estate services in {{city}}! 🏠🏢

We help real estate agencies generate qualified buyer & seller leads via:

🌐 High-Converting Property Landing Pages
📱 Property Walkthrough Reels & Video Tours
📈 High-ROI Meta & Google Lead Gen Campaigns

Would you be open to exploring how we can drive more buyer leads to your listings?

{{company_signature}}`
  },
  {
    name: 'Salon & Spa Outreach',
    category: 'Salon',
    content: `Hi {{business_name}} 👋

Your salon & beauty services look fantastic! ✂️💅

We help salons fill their appointment slots with:

📲 Online Booking Website Integration
🎬 Trending Transformation Reels
📈 Instagram Ads targeting local beauty clients

Would you be open to a quick chat on scaling weekly appointments? 🚀

{{company_signature}}`
  },
  {
    name: 'Gym & Fitness Outreach',
    category: 'Gym',
    content: `Hi {{business_name}} 👋

We love your fitness center and energy! 🏋️‍♂️💪

We help gyms & fitness studios sign up 30-50 new members every month using:

🌐 High-Converting Membership Landing Pages
🎬 Workout & Trainer Spotlight Reels
📈 Targeted Local Fitness Lead Campaigns

Would you be open to a 5-minute call on boosting member signups?

{{company_signature}}`
  },
  {
    name: 'Dental & Clinic Outreach',
    category: 'Dental',
    content: `Hi {{business_name}} 👋

We noticed your healthcare clinic in {{city}}! 🩺🦷

We assist dental & medical practices in attracting new patients through:

🌐 Modern Patient Portal & Website Design
📈 Google Local Search Optimization
📲 Patient Testimonial & Educational Reels

Are you open to a quick chat on expanding patient inquiries?

{{company_signature}}`
  },
  {
    name: 'Education & Coaching Outreach',
    category: 'Education',
    content: `Hi {{business_name}} 👋

We admire your commitment to education in {{city}}! 📚🎓

We help academies & coaching institutes grow student enrollments with:

🌐 Modern Course Catalog & Admission Portals
🎬 Student Success Stories & Event Reels
📈 Digital Marketing for Admission Campaigns

Would you be interested in a quick chat about upcoming batch admissions?

{{company_signature}}`
  },
  {
    name: 'IT & Software Outreach',
    category: 'IT Company',
    content: `Hi {{business_name}} 👋

We noticed your tech solutions & software services! 💻⚡

We partner with IT companies to scale their client pipeline through:

🌐 Corporate Website Redesign & SaaS UI/UX
📈 B2B Lead Generation & LinkedIn Outreach
🎬 Tech Product Explainer Videos & Branding

Would you be open to a quick chat about driving tech leads?

{{company_signature}}`
  },
  {
    name: 'Retail & E-Commerce Outreach',
    category: 'Retail',
    content: `Hi {{business_name}} 👋

Your store products look great! 🛒🛍️

We help retail stores scale online sales with:

🌐 Fast Shopify & Custom E-commerce Websites
🎬 Product Highlight Reels & Ads
📈 Facebook & Instagram Shopping Campaigns

Would you be open to a quick chat on multiplying your sales?

{{company_signature}}`
  },
  {
    name: 'Hotel & Hospitality Outreach',
    category: 'Hotel',
    content: `Hi {{business_name}} 👋

Your hospitality property in {{city}} looks wonderful! 🏨🌴

We help hotels & resorts drive direct room bookings through:

🌐 Direct Booking Website & Virtual Tour
🎬 Ambiance & Experience Showcase Reels
📈 Targeted Traveler Ads

Would you be open to a brief chat on increasing direct bookings?

{{company_signature}}`
  },
  {
    name: 'Travel & Tourism Outreach',
    category: 'Travel',
    content: `Hi {{business_name}} 👋

We came across your travel packages and itineraries! ✈️🗺️

We help travel agencies capture high-intent travelers with:

🌐 Tour Package Booking Websites
🎬 Destination Spotlight Reels
📈 High-ROI Vacation Lead Campaigns

Are you available for a quick chat to discuss boosting tour bookings?

{{company_signature}}`
  },
  {
    name: 'Automotive Outreach',
    category: 'Automotive',
    content: `Hi {{business_name}} 👋

We saw your auto services & dealership listings! 🚗🔧

We assist automotive businesses in getting steady service appointments & car inquiries via:

🌐 Service Booking & Inventory Sites
🎬 Vehicle Detail & Feature Reels
📈 Local Google & Social Lead Ads

Would you be open to a quick chat on driving more service calls?

{{company_signature}}`
  },
  {
    name: 'Electrician & Contractor Outreach',
    category: 'Electrician',
    content: `Hi {{business_name}} 👋

We came across your electrical contractor services! ⚡🔌

We help trade contractors get consistent local emergency & contract jobs through:

🌐 Professional Contractor Web Pages
📍 Google Business Profile Top Ranking
📈 Targeted Local Call Ads

Would you be open to a quick chat on getting more daily service jobs?

{{company_signature}}`
  },
  {
    name: 'Plumber Services Outreach',
    category: 'Plumber',
    content: `Hi {{business_name}} 👋

We saw your plumbing & maintenance business! 🚰🔧

We help plumbers get instant local customer calls through:

🌐 Service Request Websites
📍 Local Google Search Top Positioning
📈 Fast Call Generation Campaigns

Would you be open to a 5-minute chat on scaling local service calls?

{{company_signature}}`
  },
  {
    name: 'Professional Services Outreach',
    category: 'Professional Services',
    content: `Hi {{business_name}} 👋

We admire your professional consultancy in {{city}}! 💼📊

We help firm owners capture high-value clients through:

🌐 Premium Corporate Website Design
📈 Authority Content & Lead Funnels
🎬 Professional Brand Videos

Would you be open to a quick chat on client acquisition?

{{company_signature}}`
  }
];

export function renderMessageTemplate(
  templateContent: string,
  context: TemplateVariableContext
): string {
  if (!templateContent) return '';

  let output = templateContent;

  const replacements: Record<string, string> = {
    business_name: context.business_name || context.company_name || 'Business Partner',
    category: context.category || 'Business',
    city: context.city || 'your city',
    state: context.state || '',
    country: context.country || '',
    phone: context.phone || '',
    website: context.website || '',
    email: context.email || '',
    company_signature: context.company_signature || '— PJN Technologies'
  };

  for (const [key, val] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    output = output.replace(regex, val);
  }

  return output;
}

export function findBestMatchingTemplate(
  category?: string,
  templates: { category: string; content: string }[] = []
): string {
  if (!category) {
    const defaultGeneral = templates.find((t) => t.category.toLowerCase() === 'general business');
    return defaultGeneral ? defaultGeneral.content : DEFAULT_INDUSTRY_TEMPLATES[0].content;
  }

  const cleanCategory = category.trim().toLowerCase();

  // Try exact category match from user templates
  const userMatch = templates.find((t) => t.category.trim().toLowerCase() === cleanCategory);
  if (userMatch) return userMatch.content;

  // Try partial match from user templates
  const userPartial = templates.find((t) => cleanCategory.includes(t.category.trim().toLowerCase()));
  if (userPartial) return userPartial.content;

  // Try exact match from default templates
  const defaultMatch = DEFAULT_INDUSTRY_TEMPLATES.find((t) => t.category.trim().toLowerCase() === cleanCategory);
  if (defaultMatch) return defaultMatch.content;

  // Try partial match from default templates
  const defaultPartial = DEFAULT_INDUSTRY_TEMPLATES.find((t) =>
    cleanCategory.includes(t.category.trim().toLowerCase()) || t.category.trim().toLowerCase().includes(cleanCategory)
  );
  if (defaultPartial) return defaultPartial.content;

  return DEFAULT_INDUSTRY_TEMPLATES[0].content;
}

export function buildWhatsAppUrl(normalizedPhone: string, message: string): string {
  const cleanPhone = normalizedPhone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

