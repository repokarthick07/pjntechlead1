import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Edit,
  Phone,
  MapPin,
  Star,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { outreachService, templateService } from '../services/api';
import { OutreachSessionResponse, Lead, MessageTemplate } from '../types';
import { useToast } from '../context/ToastContext';
import { FollowUpModal } from '../components/FollowUpModal';
import { renderTemplate } from '../utils/whatsapp';

export const OutreachMode: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sessionData, setSessionData] = useState<OutreachSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const fetchSessionAndTemplates = async () => {
    try {
      setLoading(true);
      const [sessionRes, templateRes] = await Promise.all([
        outreachService.getSession(),
        templateService.getTemplates()
      ]);

      setSessionData(sessionRes);
      setTemplates(templateRes);

      if (sessionRes.lead) {
        // Auto-match or pick template
        const leadCat = (sessionRes.lead.category || '').toLowerCase();
        const matched = templateRes.find(
          (t) => t.category.toLowerCase() === leadCat || leadCat.includes(t.category.toLowerCase())
        );

        const templateToUse = matched || templateRes[0];
        if (templateToUse) {
          setSelectedTemplateId(templateToUse.id);
          const rendered = renderTemplate(templateToUse.content, sessionRes.lead);
          setCustomMessage(rendered);
        } else {
          setCustomMessage(sessionRes.messagePreview || '');
        }
      }
    } catch (err: any) {
      showToast('Failed to load outreach session or templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndTemplates();
  }, []);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected && sessionData?.lead) {
      const rendered = renderTemplate(selected.content, sessionData.lead);
      setCustomMessage(rendered);
      showToast(`Switched to template: '${selected.name}'`);
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!sessionData?.lead?.id) return;
    try {
      setActionLoading(true);
      const res = await outreachService.openWhatsApp(sessionData.lead.id, customMessage);

      // Open WhatsApp pre-filled link in new browser tab
      window.open(res.whatsAppUrl, '_blank');

      showToast('WhatsApp opened with pre-filled message! Message is populated in WhatsApp chat.');

      // Update local state to reflect WHATSAPP_OPENED status
      setSessionData((prev) => {
        if (!prev || !prev.lead) return prev;
        return {
          ...prev,
          lead: { ...prev.lead, status: 'WHATSAPP_OPENED' },
          session: {
            ...prev.session,
            whatsappOpenedCount: prev.session.whatsappOpenedCount + 1
          }
        };
      });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to open WhatsApp', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkContacted = async () => {
    if (!sessionData?.lead?.id) return;
    try {
      setActionLoading(true);
      const res = await outreachService.markContacted(sessionData.lead.id);

      showToast(`Marked '${sessionData.lead.businessName}' as Contacted.`);

      fetchSessionAndTemplates();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to mark contacted', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextLead = async () => {
    if (!sessionData?.lead?.id) return;
    try {
      setActionLoading(true);
      await outreachService.nextLead(sessionData.lead.id);
      fetchSessionAndTemplates();
    } catch (err: any) {
      showToast('Failed to advance to next lead', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !sessionData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-whatsapp mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading WhatsApp Outreach Queue...</p>
        </div>
      </div>
    );
  }

  const currentLead = sessionData?.lead;
  const session = sessionData?.session;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Outreach Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-800"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-whatsapp animate-pulse"></span>
              <h1 className="text-base font-extrabold text-white tracking-tight">WHATSAPP OUTREACH MODE</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">Focused Single-Lead Outreach Workspace</p>
          </div>
        </div>

        {/* Progress Tracker Widget */}
        <div className="flex items-center gap-6 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Progress</p>
            <p className="text-sm font-black text-white">{session?.progressText || '0 / 0'}</p>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div>
              <span className="text-slate-400">Remaining: </span>
              <span className="text-amber-400 font-extrabold">{session?.remainingCount || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Contacted: </span>
              <span className="text-emerald-400 font-extrabold">{session?.contactedCount || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">WhatsApp Opened: </span>
              <span className="text-purple-400 font-extrabold">{session?.whatsappOpenedCount || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center gap-6">
        {!currentLead ? (
          <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-xl mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-whatsapp flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-white">All Outreach Complete!</h2>
            <p className="text-sm text-slate-400">
              There are no pending or eligible WhatsApp leads in the queue right now.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('/import')}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs"
              >
                Upload New Lead File
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-xs"
              >
                View Lead Database
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lead Details Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-whatsapp/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-whatsapp uppercase tracking-wider bg-whatsapp/10 px-2.5 py-0.5 rounded-md border border-whatsapp/20">
                      {currentLead.category || 'General Business'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        currentLead.status === 'WHATSAPP_OPENED'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : currentLead.status === 'CONTACTED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {currentLead.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{currentLead.businessName}</h2>
                </div>

                {/* Phone Callout */}
                <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-whatsapp/20 text-whatsapp flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Phone</p>
                    <p className="text-base font-extrabold text-white font-mono">
                      +{currentLead.normalizedPhone || currentLead.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-info metadata */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs font-medium text-slate-400">
                {(currentLead.city || currentLead.country) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{[currentLead.city, currentLead.state, currentLead.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}

                {typeof currentLead.rating === 'number' && currentLead.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>
                      {currentLead.rating.toFixed(1)} ({currentLead.reviews || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Template Menu & Message Preview Box */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              {/* Template Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Select Message Template</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="bg-slate-950 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl focus:ring-2 focus:ring-whatsapp/30 focus:border-whatsapp focus:outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.category}] {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Header & Edit Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-whatsapp" />
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    Personalized Message Preview
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingMessage ? 'Done Editing' : '✏️ Edit Message'}</span>
                </button>
              </div>

              {isEditingMessage ? (
                <textarea
                  rows={8}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-700 font-mono text-xs focus:ring-2 focus:ring-whatsapp/30 focus:border-whatsapp focus:outline-none"
                />
              ) : (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-xs font-medium text-slate-200 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                  {customMessage}
                </div>
              )}
            </div>

            {/* Core Action Control Panel */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <button
                onClick={() => setIsFollowUpModalOpen(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Schedule Follow-up</span>
              </button>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {/* 1. OPEN WHATSAPP BUTTON */}
                <button
                  onClick={handleOpenWhatsApp}
                  disabled={actionLoading || !currentLead.normalizedPhone}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-whatsapp to-emerald-600 hover:from-whatsapp-hover hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-whatsapp/25 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  <span>🟢 OPEN WHATSAPP</span>
                </button>

                {/* 2. MARK CONTACTED BUTTON */}
                <button
                  onClick={handleMarkContacted}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✓ Mark Contacted</span>
                </button>

                {/* 3. NEXT LEAD BUTTON */}
                <button
                  onClick={handleNextLead}
                  disabled={actionLoading}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>NEXT LEAD</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Follow Up Modal */}
      <FollowUpModal
        lead={currentLead}
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onFollowUpCreated={fetchSessionAndTemplates}
      />
    </div>
  );
};

