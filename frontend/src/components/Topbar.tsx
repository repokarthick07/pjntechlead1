import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Upload, MessageSquare } from 'lucide-react';

interface TopbarProps {
  onSearchChange?: (term: string) => void;
  onOpenAddModal?: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onSearchChange,
  onOpenAddModal,
  title = 'PJN LeadFlow',
  subtitle = 'Personalized WhatsApp Outreach Engine'
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange && (
          <div className="relative min-w-[240px] md:min-w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, phone, category..."
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        )}

        <button
          onClick={() => navigate('/outreach')}
          className="flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Outreach Mode</span>
        </button>

        <button
          onClick={() => navigate('/import')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl border border-slate-200 transition-colors"
        >
          <Upload className="w-4 h-4 text-slate-600" />
          <span>Upload Lead File</span>
        </button>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        )}
      </div>
    </header>
  );
};
