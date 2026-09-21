export type LeadStatus =
  | 'PENDING'
  | 'WHATSAPP_OPENED'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED';

export interface Lead {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  phone?: string;
  normalizedPhone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  email?: string;
  status: LeadStatus;
  whatsappOpenedAt?: string;
  contactedAt?: string;
  contactedBy?: string;
  followUpDate?: string;
  notes?: string;
  importJobId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contactHistory?: number;
    followUps?: number;
  };
  contactHistory?: ContactHistory[];
  followUps?: FollowUp[];
}

export interface ContactHistory {
  id: string;
  leadId: string;
  action: string;
  notes?: string;
  templateUsed?: string;
  timestamp: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  title: string;
  date: string;
  time?: string;
  notes?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  lead?: Lead;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  recordsDetected: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  status: string;
  createdAt: string;
}

export interface ImportPreviewData {
  fileName: string;
  fileType: string;
  fileSize: number;
  totalRecordsDetected: number;
  validBusinessNamesCount: number;
  validPhonesCount: number;
  missingPhonesCount: number;
  invalidPhonesCount: number;
  duplicatesCount: number;
  parseMessage?: string;
  extractedTextSuccess?: boolean;
  items: EvaluatedLeadItem[];
}

export interface EvaluatedLeadItem {
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
  isDuplicate: boolean;
  isInvalid: boolean;
  isMissingPhone: boolean;
}

export interface Settings {
  id: string;
  companyName: string;
  companySignature: string;
  defaultCountry: string;
  defaultTemplateId?: string;
  autoMarkContacted: boolean;
  whatsappBehavior: string;
}

export interface OutreachSessionResponse {
  session: {
    totalEligible: number;
    contactedCount: number;
    whatsappOpenedCount: number;
    remainingCount: number;
    processedCount: number;
    progressText: string;
  };
  lead: Lead | null;
  messagePreview: string;
  whatsAppUrl: string;
}

export interface DashboardMetricsResponse {
  metrics: {
    totalLeads: number;
    pendingLeads: number;
    whatsappOpened: number;
    contactedLeads: number;
    followUpLeads: number;
    interestedLeads: number;
    convertedLeads: number;
    notInterestedLeads: number;
    totalWithPhone: number;
    remainingToContact: number;
  };
  statusBreakdown: { name: string; count: number; color: string }[];
  categoryDistribution: { name: string; value: number }[];
  recentActivities: any[];
  todayFollowUps: FollowUp[];
}
