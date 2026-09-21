import React, { useEffect, useState } from 'react';
import { X, History, MessageSquare, CheckCircle2, Calendar, Edit3 } from 'lucide-react';
import { Lead } from '../types';
import { leadsService } from '../services/api';

interface ContactHistoryModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactHistoryModal: React.FC<ContactHistoryModalProps> = ({
  lead,
  isOpen,
  onClose
}) => {
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead?.id && isOpen) {
      setLoading(true);
      leadsService
        .getLeadById(lead.id)
        .then((res) => setLeadDetails(res))
        .catch(() => setLeadDetails(lead))
        .finally(() => setLoading(false));
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const history = leadDetails?.contactHistory || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Contact History</h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">{lead.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading timeline...</p>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No previous contact history logged yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-6">
              {history.map((item) => (
                <div key={item.id} className="relative">
                  {/* Circle Marker */}
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  </span>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-extrabold text-slate-900">
                        {item.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {item.notes && <p className="text-xs text-slate-600 font-medium">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
