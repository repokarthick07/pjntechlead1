import React from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Star,
  MessageSquare,
  Eye,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onOpenWhatsApp: (lead: Lead) => void;
  onPreviewMessage: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onViewHistory: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onOpenWhatsApp,
  onPreviewMessage,
  onEditLead,
  onDeleteLead,
  onScheduleFollowUp,
  onViewHistory
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONTACTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'WHATSAPP_OPENED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'FOLLOW_UP':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INTERESTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CONVERTED':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'NOT_INTERESTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formattedPhone = lead.phone || lead.normalizedPhone || 'No phone number available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 group">
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200/50 inline-block mb-1">
              {lead.category || 'General Business'}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
              {lead.businessName}
            </h3>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(
              lead.status
            )}`}
          >
            {lead.status.replace('_', ' ')}
          </span>
        </div>

        {/* Location & Rating */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mb-3">
          {(lead.city || lead.country) && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {typeof lead.rating === 'number' && lead.rating > 0 && (
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {lead.rating.toFixed(1)} ({lead.reviews || 0} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Phone Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number</p>
              {lead.normalizedPhone ? (
                <a
                  href={`https://web.whatsapp.com/send?phone=${lead.normalizedPhone.replace(/\D/g, '')}&text=${encodeURIComponent(
                    `Hi ${lead.businessName || 'there'} 👋\n\nWe came across your business and loved what you’re offering! 🌟\n\nWould you be open to a quick chat? 🚀\n\n— PJN Technologies`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-slate-900 hover:text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>{formattedPhone}</span>
                </a>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">No phone number available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreviewMessage(lead)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Message</span>
          </button>

          {lead.normalizedPhone ? (
            <button
              onClick={() => onOpenWhatsApp(lead)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>🟢 Send WhatsApp</span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-bold py-2.5 px-3 rounded-xl cursor-not-allowed"
            >
              <span>No WhatsApp</span>
            </button>
          )}
        </div>

        {/* Action Icon Strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <button
            onClick={() => onViewHistory(lead)}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
            title="View Contact History Timeline"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScheduleFollowUp(lead)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors"
              title="Schedule Follow-up"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditLead(lead)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors"
              title="Edit Lead"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteLead(lead)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
