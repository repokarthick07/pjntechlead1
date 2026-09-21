import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  FileType,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { importService } from '../services/api';
import { ImportPreviewData } from '../types';
import { ImportPreviewModal } from '../components/ImportPreviewModal';
import { useToast } from '../context/ToastContext';

export const FileImport: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setProgressPercent(20);
      setProgressStatus('Uploading file...');

      setTimeout(() => {
        setProgressPercent(50);
        setProgressStatus('Parsing file structure...');
      }, 500);

      setTimeout(() => {
        setProgressPercent(80);
        setProgressStatus('Extracting business names & phone numbers...');
      }, 1000);

      const previewRes = await importService.uploadFile(selectedFile);

      setProgressPercent(100);
      setProgressStatus('Preview ready');
      setPreviewData(previewRes);
      setIsPreviewOpen(true);
      showToast(`Analysis complete: ${previewRes.totalRecordsDetected} records detected.`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to parse lead file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async (duplicateStrategy: 'skip' | 'update' | 'import_as_new') => {
    if (!previewData) return;

    try {
      setIsProcessingImport(true);
      const res = await importService.processImport({
        items: previewData.items,
        fileName: previewData.fileName,
        fileType: previewData.fileType,
        fileSize: previewData.fileSize,
        duplicateStrategy
      });

      showToast(`Success! ${res.importedCount} leads imported.`);
      setIsPreviewOpen(false);

      // Instantly launch Outreach Mode for the user!
      navigate('/outreach');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Import processing failed', 'error');
    } finally {
      setIsProcessingImport(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200/50">
            Multi-Format Ingestion Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Upload Lead Data File</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Supports PDF, XML, JSON, CSV, XLS, XLSX, and TXT files. Intelligent auto-mapping extracts business names, phone numbers, ratings, and locations.
          </p>
        </div>

        {/* Format Badges */}
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            <FileType className="w-4 h-4" /> PDF Documents
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
            <FileSpreadsheet className="w-4 h-4" /> Excel (XLS / XLSX)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl">
            <FileSpreadsheet className="w-4 h-4" /> CSV Files
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl">
            <FileCode className="w-4 h-4" /> JSON & XML
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl">
            <FileText className="w-4 h-4" /> TXT Lists
          </span>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-10 text-center bg-slate-50 hover:bg-brand-50/20 transition-all cursor-pointer relative group">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.json,.xml,.pdf,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-base font-extrabold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB — Ready to extract
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-base font-extrabold text-slate-900">Drag & drop your lead file here</p>
              <p className="text-xs text-slate-500 font-medium">or click to browse from computer</p>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{progressStatus}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isUploading}
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Preview Lead Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {previewData && (
        <ImportPreviewModal
          previewData={previewData}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirmImport={handleConfirmImport}
          isProcessing={isProcessingImport}
        />
      )}
    </div>
  );
};
