import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Upload,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { dashboardService, outreachService } from '../services/api';
import { DashboardMetricsResponse, OutreachSessionResponse } from '../types';
import { MetricsCard } from '../components/MetricsCard';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [session, setSession] = useState<OutreachSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, sessionRes] = await Promise.all([
          dashboardService.getStats(),
          outreachService.getSession()
        ]);
        setData(statsRes);
        setSession(sessionRes);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = data?.metrics;
  const sessionInfo = session?.session;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero WhatsApp Outreach Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-whatsapp font-bold text-xs uppercase tracking-wider bg-whatsapp/10 px-3 py-1 rounded-full border border-whatsapp/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Primary Outreach Workflow</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Lead Data → Personalized WhatsApp Outreach
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Upload lead files, normalize phone numbers, and launch zero-friction WhatsApp conversations with 1 click.
          </p>

          {/* Quick Counter Summary */}
          {sessionInfo && (
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-slate-300">
              <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Total Leads: </span>
                <span className="text-white font-extrabold">{sessionInfo.totalEligible.toLocaleString()}</span>
              </div>
              <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Contacted: </span>
                <span className="text-emerald-400 font-extrabold">{sessionInfo.contactedCount.toLocaleString()}</span>
              </div>
              <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">WhatsApp Opened: </span>
                <span className="text-purple-400 font-extrabold">{sessionInfo.whatsappOpenedCount.toLocaleString()}</span>
              </div>
              <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Remaining: </span>
                <span className="text-amber-400 font-extrabold">{sessionInfo.remainingCount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/outreach')}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-whatsapp to-emerald-600 hover:from-whatsapp-hover hover:to-emerald-500 text-white font-black text-base rounded-2xl shadow-xl shadow-whatsapp/25 flex items-center justify-center gap-3 transition-all hover:scale-105 group"
          >
            <MessageSquare className="w-6 h-6 fill-white" />
            <span>
              {sessionInfo && sessionInfo.processedCount > 0 ? 'CONTINUE OUTREACH' : 'START WHATSAPP OUTREACH'}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Leads"
          value={metrics?.totalLeads || 0}
          subtitle={`${metrics?.totalWithPhone || 0} valid phones`}
          icon={Users}
          color="blue"
          onClick={() => navigate('/leads')}
        />
        <MetricsCard
          title="Pending Outreach"
          value={metrics?.pendingLeads || 0}
          subtitle="Ready for initial message"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/leads?status=PENDING')}
        />
        <MetricsCard
          title="WhatsApp Contacted"
          value={metrics?.contactedLeads || 0}
          subtitle={`${metrics?.whatsappOpened || 0} link clicks`}
          icon={PhoneCall}
          color="emerald"
          onClick={() => navigate('/leads?status=CONTACTED')}
        />
        <MetricsCard
          title="Remaining Queue"
          value={metrics?.remainingToContact || 0}
          subtitle="Eligible phone leads"
          icon={Sparkles}
          color="purple"
          onClick={() => navigate('/outreach')}
        />
      </div>

      {/* Charts & Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Status Breakdown Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Lead Status Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Distribution across sales pipeline</p>
          </div>

          <div className="h-56 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data?.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
            {(data?.statusBreakdown || []).map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-600 truncate">{s.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Top Lead Categories</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Businesses grouped by industry</p>
          </div>

          <div className="h-56 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 text-center">
            Automatic category message matching active
          </div>
        </div>

        {/* Today's Follow-ups Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Today's Follow-ups</h3>
              <p className="text-xs text-slate-500 font-medium">Scheduled WhatsApp check-ins</p>
            </div>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-64">
            {!data?.todayFollowUps || data.todayFollowUps.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No follow-ups scheduled for today.
              </div>
            ) : (
              data.todayFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.lead?.businessName || item.title}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                      ⏰ {item.time || '10:00 AM'} — {item.notes || 'WhatsApp follow-up'}
                    </p>
                  </div>
                  {item.lead?.normalizedPhone && (
                    <button
                      onClick={() => navigate('/outreach')}
                      className="px-3 py-1.5 bg-whatsapp hover:bg-whatsapp-hover text-white text-[11px] font-bold rounded-xl shrink-0"
                    >
                      Open Chat
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
