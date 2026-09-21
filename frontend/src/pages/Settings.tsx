import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Building2, Globe, ShieldCheck } from 'lucide-react';
import { settingsService } from '../services/api';
import { Settings as SettingsType } from '../types';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<SettingsType>>({
    companyName: 'PJN Technologies',
    companySignature: '— PJN Technologies',
    defaultCountry: 'IN (+91)',
    autoMarkContacted: false,
    whatsappBehavior: 'web'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((res) => setFormData(res))
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings(formData);
      showToast('Settings saved successfully.');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Application Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure PJN LeadFlow branding, signature defaults, and WhatsApp click behaviors
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Company & Branding</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Country Code</label>
              <select
                value={formData.defaultCountry}
                onChange={(e) => setFormData({ ...formData, defaultCountry: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="IN (+91)">India (+91)</option>
                <option value="AE (+971)">UAE (+971)</option>
                <option value="US (+1)">United States (+1)</option>
                <option value="GB (+44)">United Kingdom (+44)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Message Signature</label>
            <input
              type="text"
              value={formData.companySignature}
              onChange={(e) => setFormData({ ...formData, companySignature: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">Appended to templates via {'{{company_signature}}'}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-whatsapp" />
            <span>WhatsApp Behavior</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="whatsappBehavior"
                value="web"
                checked={formData.whatsappBehavior === 'web'}
                onChange={() => setFormData({ ...formData, whatsappBehavior: 'web' })}
                className="text-whatsapp"
              />
              <span>Open WhatsApp Web / Desktop Application</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoMarkContacted}
                onChange={(e) => setFormData({ ...formData, autoMarkContacted: e.target.checked })}
                className="rounded text-brand-600"
              />
              <span>Automatically mark lead as Contacted after clicking Open WhatsApp</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
