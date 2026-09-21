import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Lead } from '../types';
import { followUpService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface FollowUpModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onFollowUpCreated?: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  lead,
  isOpen,
  onClose,
  onFollowUpCreated
}) => {
  const { showToast } = useToast();
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await followUpService.createFollowUp({
        leadId: lead.id,
        date,
        time,
        notes,
        title: `WhatsApp Follow-up: ${lead.businessName}`
      });
      showToast(`Follow-up scheduled for ${lead.businessName} on ${date}.`);
      if (onFollowUpCreated) onFollowUpCreated();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to schedule follow-up', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Schedule Follow-up</h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{lead.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
            <input
              type="text"
              placeholder="e.g. 10:00 AM or 03:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Action Points</label>
            <textarea
              rows={3}
              placeholder="e.g. Discuss proposal details, send portfolio pdf..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/30"
            >
              {isSubmitting ? 'Scheduling...' : 'Set Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
