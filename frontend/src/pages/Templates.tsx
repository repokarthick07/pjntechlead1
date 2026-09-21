import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Copy,
  Tag
} from 'lucide-react';
import { templateService } from '../services/api';
import { MessageTemplate } from '../types';
import { useToast } from '../context/ToastContext';

export const Templates: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'General Business',
    content: '',
    isDefault: false
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateService.getTemplates();
      const list = Array.isArray(res) ? res : [];
      setTemplates(list);
      if (list.length > 0 && !selectedTemplate) {
        setSelectedTemplate(list[0]);
        setFormData({
          name: list[0].name,
          category: list[0].category,
          content: list[0].content,
          isDefault: list[0].isDefault
        });
      }
    } catch (err) {
      setTemplates([]);
      showToast('Failed to load message templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelect = (t: MessageTemplate) => {
    setSelectedTemplate(t);
    setFormData({
      name: t.name,
      category: t.category,
      content: t.content,
      isDefault: t.isDefault
    });
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      category: 'General Business',
      content: '',
      isDefault: false
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        await templateService.updateTemplate(selectedTemplate.id, formData);
        showToast('Template updated successfully');
      } else {
        await templateService.createTemplate(formData);
        showToast('New template created successfully');
      }
      fetchTemplates();
    } catch (err: any) {
      showToast('Failed to save template', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this message template?')) {
      try {
        await templateService.deleteTemplate(id);
        showToast('Template deleted');
        setSelectedTemplate(null);
        fetchTemplates();
      } catch (err) {
        showToast('Failed to delete template', 'error');
      }
    }
  };

  const insertVariable = (varName: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + ` {{${varName}}}`
    }));
  };

  const variables = [
    'business_name',
    'category',
    'city',
    'state',
    'country',
    'phone',
    'company_signature'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Message Templates</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Category-tailored message personalization engine for WhatsApp outreach
          </p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-brand-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List Sidebar */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2 max-h-[75vh] overflow-y-auto">
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTemplate?.id === t.id
                  ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs text-slate-900 truncate">{t.name}</span>
                {t.isDefault && (
                  <span className="text-[10px] font-extrabold bg-brand-600 text-white px-2 py-0.5 rounded-full shrink-0">
                    Default
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/70 px-2 py-0.5 rounded">
                {t.category}
              </span>
            </div>
          ))}
        </div>

        {/* Editor & Variable Panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            {/* Variable Tag Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>Insert Dynamic Variables</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-brand-100 hover:text-brand-700 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-700 transition-colors"
                  >
                    + {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Content *</label>
              <textarea
                rows={10}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 leading-relaxed focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 w-4 h-4"
                />
                <span>Set as Default General Template</span>
              </label>

              <div className="flex items-center gap-2">
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedTemplate.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Delete Template
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/30"
                >
                  {selectedTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
