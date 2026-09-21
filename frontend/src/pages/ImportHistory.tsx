import React, { useEffect, useState } from 'react';
import { History, FileText, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { importService } from '../services/api';
import { ImportJob } from '../types';
import { useToast } from '../context/ToastContext';

export const ImportHistory: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    importService
      .getHistory()
      .then((res) => setJobs(Array.isArray(res) ? res : []))
      .catch(() => {
        setJobs([]);
        showToast('Failed to load import history', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Import History Log</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Audit trail of past file ingestion jobs, records detected, and duplicate resolutions
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">File Name</th>
              <th className="py-4 px-6">Type</th>
              <th className="py-4 px-6">Date Uploaded</th>
              <th className="py-4 px-6">Total Detected</th>
              <th className="py-4 px-6">Imported</th>
              <th className="py-4 px-6">Duplicates</th>
              <th className="py-4 px-6">Invalid Phone</th>
              <th className="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Loading import history...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No previous import history records found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>{job.fileName}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      {job.fileType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">{job.recordsDetected.toLocaleString()}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">{job.importedCount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-purple-600 font-bold">{job.duplicateCount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-rose-600 font-bold">{job.invalidCount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300">
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
