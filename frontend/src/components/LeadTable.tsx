import React from 'react';
import {
  Phone,
  MessageSquare,
  Eye,
  Calendar,
  Edit,
  Trash2,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectLead: (id: string) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onPreviewMessage: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectLead,
  onOpenWhatsApp,
  onPreviewMessage,
  onEditLead,
  onDeleteLead,
  onScheduleFollowUp
}) => {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const isAllSelected = safeLeads.length > 0 && selectedIds.length === safeLeads.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Business Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {safeLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No lead records found.
                </td>
              </tr>
            ) : (
              safeLeads.map((lead, idx) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectLead(lead.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {lead.businessName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                        {lead.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.normalizedPhone ? (
                        <a
                          href={`https://web.whatsapp.com/send?phone=${lead.normalizedPhone.replace(/\D/g, '')}&text=${encodeURIComponent(
                            `Hi ${lead.businessName || 'there'} 👋\n\nWe came across your business and loved what you’re offering! 🌟\n\nWould you be open to a quick chat? 🚀\n\n— PJN Technologies`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-900 font-semibold hover:text-emerald-600 hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lead.phone || lead.normalizedPhone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No Phone</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {[lead.city, lead.country].filter(Boolean).join(', ') || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.rating && lead.rating > 0 ? (
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {lead.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          lead.status === 'CONTACTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : lead.status === 'WHATSAPP_OPENED'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : lead.status === 'FOLLOW_UP'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreviewMessage(lead)}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                          title="Preview Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {lead.normalizedPhone && (
                          <button
                            onClick={() => onOpenWhatsApp(lead)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                            title="Send WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onScheduleFollowUp(lead)}
                          className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors"
                          title="Schedule Follow-up"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="p-1.5 hover:bg-brand-50 text-slate-500 hover:text-brand-600 rounded-lg transition-colors"
                          title="Edit Lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead)}
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
