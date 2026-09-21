import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { leadsService, exportService } from '../services/api';
import { Lead } from '../types';
import { buildWhatsAppUrl, renderTemplate } from '../utils/whatsapp';
import { LeadCard } from '../components/LeadCard';
import { LeadTable } from '../components/LeadTable';
import { ManualLeadModal } from '../components/ManualLeadModal';
import { EditLeadModal } from '../components/EditLeadModal';
import { FollowUpModal } from '../components/FollowUpModal';
import { ContactHistoryModal } from '../components/ContactHistoryModal';
import { useToast } from '../context/ToastContext';

export const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filterOptions, setFilterOptions] = useState<{ categories: any[]; cities: any[] }>({
    categories: [],
    cities: []
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await leadsService.getLeads({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        page,
        limit: 24
      });
      setLeads(res.leads);
      setTotalPages(res.pagination.totalPages);
      setTotalLeads(res.pagination.total);
      setFilterOptions(res.filterOptions);
    } catch (err) {
      showToast('Failed to load lead database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, categoryFilter, statusFilter, page]);

  const handleOpenWhatsApp = (lead: Lead) => {
    if (!lead.normalizedPhone) return;
    const defaultTemplate = `Hi {{business_name}} 👋\n\nWe came across your business and loved what you’re offering! 🌟\n\nWe help businesses grow online with:\n🌐 Professional Website Development\n📱 Social Media Marketing\n🎬 Reels & Creative Content\n📈 Digital Marketing & Lead Generation\n🎨 Posters & Branding\n\nWould you be open to a quick chat about how we can help your business grow? 🚀\n\n{{company_signature}}`;
    const message = renderTemplate(defaultTemplate, lead);
    const url = buildWhatsAppUrl(lead.normalizedPhone, message);
    window.open(url, '_blank');
    showToast(`WhatsApp opened with pre-filled message for ${lead.businessName}.`);
  };


  const handlePreviewMessage = (lead: Lead) => {
    navigate(`/outreach`);
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete lead '${lead.businessName}'?`)) {
      try {
        await leadsService.deleteLead(lead.id);
        showToast(`Lead '${lead.businessName}' deleted.`);
        fetchLeads();
      } catch (err) {
        showToast('Failed to delete lead', 'error');
      }
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await leadsService.bulkUpdateStatus(selectedIds, newStatus);
      showToast(`Updated status to ${newStatus} for ${selectedIds.length} leads.`);
      setSelectedIds([]);
      fetchLeads();
    } catch (err) {
      showToast('Bulk status update failed', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected leads?`)) {
      try {
        await leadsService.bulkDeleteLeads(selectedIds);
        showToast(`Deleted ${selectedIds.length} leads.`);
        setSelectedIds([]);
        fetchLeads();
      } catch (err) {
        showToast('Bulk delete failed', 'error');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search business, phone, city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="WHATSAPP_OPENED">WhatsApp Opened</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP">Follow-Up</option>
            <option value="INTERESTED">Interested</option>
            <option value="CONVERTED">Converted</option>
            <option value="NOT_INTERESTED">Not Interested</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'table' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-950 text-white px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-lg border border-brand-800 animate-slide-down">
          <span className="text-xs font-extrabold">{selectedIds.length} Leads Selected</span>
          <div className="flex items-center gap-3 text-xs font-bold">
            <button
              onClick={() => handleBulkStatus('CONTACTED')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl"
            >
              Mark Contacted
            </button>
            <button
              onClick={() => exportService.downloadCSV(selectedIds)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400 mt-2">Loading lead database...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOpenWhatsApp={handleOpenWhatsApp}
              onPreviewMessage={handlePreviewMessage}
              onEditLead={(l) => setEditingLead(l)}
              onDeleteLead={handleDeleteLead}
              onScheduleFollowUp={(l) => setFollowUpLead(l)}
              onViewHistory={(l) => setHistoryLead(l)}
            />
          ))}
        </div>
      ) : (
        <LeadTable
          leads={leads}
          selectedIds={selectedIds}
          onToggleSelectAll={() =>
            setSelectedIds(selectedIds.length === leads.length ? [] : leads.map((l) => l.id))
          }
          onToggleSelectLead={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
          }
          onOpenWhatsApp={handleOpenWhatsApp}
          onPreviewMessage={handlePreviewMessage}
          onEditLead={(l) => setEditingLead(l)}
          onDeleteLead={handleDeleteLead}
          onScheduleFollowUp={(l) => setFollowUpLead(l)}
        />
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
          <span>
            Page {page} of {totalPages} ({totalLeads.toLocaleString()} Total Leads)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ManualLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={fetchLeads}
      />
      <EditLeadModal
        lead={editingLead}
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        onLeadUpdated={fetchLeads}
      />
      <FollowUpModal
        lead={followUpLead}
        isOpen={!!followUpLead}
        onClose={() => setFollowUpLead(null)}
        onFollowUpCreated={fetchLeads}
      />
      <ContactHistoryModal
        lead={historyLead}
        isOpen={!!historyLead}
        onClose={() => setHistoryLead(null)}
      />
    </div>
  );
};
