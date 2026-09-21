import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareShare,
  Users,
  UploadCloud,
  FileText,
  CalendarCheck,
  History,
  Settings as SettingsIcon,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'WhatsApp Outreach', path: '/outreach', icon: MessageSquareShare, highlight: true },
    { label: 'Lead Database', path: '/leads', icon: Users },
    { label: 'Import Leads', path: '/import', icon: UploadCloud },
    { label: 'Message Templates', path: '/templates', icon: FileText },
    { label: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck },
    { label: 'Import History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-whatsapp flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-bold text-xl">
          P
        </div>
        <div>
          <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">PJN LEADFLOW</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Personalized Outreach</p>
        </div>
      </div>

      {/* Primary WhatsApp Outreach CTA */}
      <div className="p-4">
        <NavLink
          to="/outreach"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-whatsapp to-emerald-600 hover:from-whatsapp-hover hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-whatsapp/20 transition-all duration-200 group"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>OUTREACH MODE</span>
        </NavLink>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? item.highlight
                    ? 'bg-whatsapp/15 text-whatsapp border border-whatsapp/30'
                    : 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? (item.highlight ? 'text-whatsapp' : 'text-white') : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-brand-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {user?.name?.[0] || 'P'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'PJN Admin'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@pjntechnologies.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
