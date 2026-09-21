import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  ArrowRight,
  X,
  UploadCloud,
  HelpCircle
} from 'lucide-react';
import { ImportPreviewData } from '../types';

interface ImportPreviewModalProps {
  previewData: ImportPreviewData;
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (strategy: 'skip' | 'update' | 'import_as_new') => void;
  isProcessing: boolean;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  previewData,
  isOpen,
  onClose,
  onConfirmImport,
  isProcessing
}) => {
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'import_as_new'>('skip');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">IMPORT PREVIEW</h2>
              <p className="text-xs text-slate-500 font-medium">{previewData.fileName} ({previewData.fileType})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {previewData.parseMessage && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{previewData.parseMessage}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Records Detected</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{previewData.totalRecordsDetected.toLocaleString()}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Valid Phone Numbers</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{previewData.validPhonesCount.toLocaleString()}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Missing Phone</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{previewData.missingPhonesCount.toLocaleString()}</p>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Invalid Phone</p>
              <p className="text-2xl font-black text-rose-900 mt-1">{previewData.invalidPhonesCount.toLocaleString()}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 sm:col-span-2">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Potential Duplicates</p>
              <p className="text-2xl font-black text-purple-900 mt-1">{previewData.duplicatesCount.toLocaleString()}</p>
            </div>
          </div>

          {/* Duplicate Resolution Policy */}
          {previewData.duplicatesCount > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Copy className="w-4 h-4 text-brand-600" />
                <span>Duplicate Resolution Strategy</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    duplicateStrategy === 'skip'
                      ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateStrategy"
                    value="skip"
                    checked={duplicateStrategy === 'skip'}
                    onChange={() => setDuplicateStrategy('skip')}
                    className="text-brand-600"
                  />
                  <span>Skip Duplicates (Default)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    duplicateStrategy === 'update'
                      ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateStrategy"
                    value="update"
                    checked={duplicateStrategy === 'update'}
                    onChange={() => setDuplicateStrategy('update')}
                    className="text-brand-600"
                  />
                  <span>Update Existing Leads</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    duplicateStrategy === 'import_as_new'
                      ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateStrategy"
                    value="import_as_new"
                    checked={duplicateStrategy === 'import_as_new'}
                    onChange={() => setDuplicateStrategy('import_as_new')}
                    className="text-brand-600"
                  />
                  <span>Import All as New</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmImport(duplicateStrategy)}
            disabled={isProcessing || previewData.totalRecordsDetected === 0}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Importing Leads...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Import {previewData.totalRecordsDetected.toLocaleString()} Leads</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
