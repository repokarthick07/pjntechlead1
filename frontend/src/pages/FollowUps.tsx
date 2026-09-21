import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, Phone, XCircle } from 'lucide-react';
import { followUpService } from '../services/api';
import { FollowUp } from '../types';
import { useToast } from '../context/ToastContext';

export const FollowUps: React.FC = () => {
  const { showToast } = useToast();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await followUpService.getTodayFollowUps();
      setFollowUps(Array.isArray(res) ? res : []);
    } catch (err) {
      setFollowUps([]);
      showToast('Failed to load follow-ups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await followUpService.updateStatus(id, status);
      showToast(`Follow-up marked as ${status}.`);
      fetchFollowUps();
    } catch (err) {
      showToast('Failed to update follow-up status', 'error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Today's Follow-up Schedule</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Leads scheduled for WhatsApp outreach check-in today
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading follow-ups...</div>
      ) : followUps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Follow-ups Today</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are all caught up! You can schedule follow-ups from the Lead Database or Outreach Mode.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    ⏰ {item.time || '10:00 AM'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {item.lead?.businessName || item.title}
                  </span>
                </div>
                {item.notes && <p className="text-xs text-slate-600 font-medium">{item.notes}</p>}
                {item.lead?.phone && (
                  <p className="text-xs font-mono font-bold text-slate-500">📞 {item.lead.phone}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {item.lead?.normalizedPhone && (
                  <a
                    href={`https://web.whatsapp.com/send?phone=${item.lead.normalizedPhone.replace(/\D/g, '')}&text=${encodeURIComponent(
                      `Hi ${item.lead.businessName || 'there'} 👋\n\nFollowing up regarding our previous conversation. Would you be free for a quick chat today? 🚀\n\n— PJN Technologies`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Open WhatsApp
                  </a>
                )}
                <button
                  onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                  className="px-4 py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-xl"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
