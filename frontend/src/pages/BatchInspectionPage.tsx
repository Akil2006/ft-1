import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Tag,
} from 'lucide-react';
import { batchApi } from '../services/batch';
import { BatchDetailResponse, BatchResponse } from '../types/batch';
import { BatchPackageConveyorGraphic } from '../components/BrandingAssets';

export const BatchInspectionPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [batchName, setBatchName] = useState<string>('Batch Inspection');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeBatch, setActiveBatch] = useState<BatchDetailResponse | null>(null);
  const [recentBatches, setRecentBatches] = useState<BatchResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentBatches();
  }, []);

  const loadRecentBatches = async () => {
    try {
      const data = await batchApi.listBatches();
      setRecentBatches(data);
    } catch (err: any) {
      console.error('Failed to load recent batches', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartBatch = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one package image file to start batch inspection.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await batchApi.createBatch(selectedFiles, batchName);
      setActiveBatch(result);
      setSelectedFiles([]);
      loadRecentBatches();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process batch inspection.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchBatchDetail = async (batchId: string) => {
    try {
      const result = await batchApi.getBatch(batchId);
      setActiveBatch(result);
    } catch (err: any) {
      console.error('Failed to fetch batch detail', err);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Editorial Header Banner */}
      <div className="bg-[#FAF7EE] rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#14532D]" />
            <span>Batch Package Inspection</span>
          </h1>
          <p className="text-xs text-slate-700 font-sans">
            Upload multiple package images to execute automated legal metrology inspection sessions in bulk.
          </p>
          <div className="pt-1 flex items-center space-x-2">
            <p className="font-handwriting text-xl text-slate-800 font-bold">
              "Multiple products. Faster screening. Fairer markets."
            </p>
            <svg className="w-12 h-5 text-slate-600" viewBox="0 0 60 20" fill="none">
              <path d="M5 5 C 25 18, 45 5, 55 15 M 55 15 L 48 11 M 55 15 L 52 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="hidden md:block">
          <BatchPackageConveyorGraphic className="w-72 h-32" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Step 1: Batch Identifier Name */}
      <div className="bg-white border border-sand-300 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-[#14532D] text-white font-bold text-xs flex items-center justify-center font-sans">
            1
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900">Batch Name / Identifier</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Batch Inspection"
              className="w-full bg-white border border-sand-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
            />
          </div>

          <div className="md:col-span-4 bg-[#E6F4EA] border border-[#B7E1CD] p-3 rounded-xl flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-[#108548] text-white flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-700 leading-tight">
              Use a meaningful name to easily identify this batch later.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Package Images Drag & Drop */}
      <div className="bg-white border border-sand-300 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-[#14532D] text-white font-bold text-xs flex items-center justify-center font-sans">
              2
            </div>
            <h2 className="text-base font-bold font-serif text-slate-900">Package Images</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
            UPLOAD UP TO 20 IMAGES PER BATCH
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 border-2 border-dashed border-slate-300 hover:border-[#14532D] rounded-2xl p-8 text-center transition-all bg-sand-50/40">
            <input
              type="file"
              id="batch-files-input"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="batch-files-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-sand-100 text-[#14532D] flex items-center justify-center mb-3 shadow-2xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-slate-900 font-sans">
                Drag and drop multiple package images here
              </span>
              <span className="text-xs text-slate-500 mt-1 font-sans">
                or click to select files
              </span>
              <span className="text-[11px] text-slate-400 mt-1 font-mono">
                Supports JPG, PNG, WEBP — up to 20 images per batch
              </span>
            </label>
          </div>

          {/* Right Side Visual Cards & Handwritten Annotation */}
          <div className="lg:col-span-4 bg-[#FAF7EE] p-4 rounded-2xl border border-sand-300 flex items-center justify-between relative">
            <div className="flex -space-x-4">
              <div className="w-16 h-20 bg-amber-100 border border-amber-300 rounded-lg shadow-sm flex items-center justify-center text-xl transform -rotate-6">🍟</div>
              <div className="w-16 h-20 bg-emerald-100 border border-emerald-300 rounded-lg shadow-sm flex items-center justify-center text-xl transform rotate-3">🧴</div>
              <div className="w-16 h-20 bg-amber-50 border border-amber-200 rounded-lg shadow-sm flex items-center justify-center text-xl transform -rotate-3">📦</div>
            </div>

            <div className="text-right pl-2">
              <svg className="w-8 h-6 text-slate-600 mb-1 ml-auto" viewBox="0 0 30 20" fill="none">
                <path d="M25 5 C 10 2, 5 15, 2 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="font-handwriting text-xs text-slate-800 font-bold leading-tight">
                • JPG<br />• PNG<br />• WEBP<br />• Max 20 images
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                Selected Package Images ({selectedFiles.length})
              </span>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sand-50/60 border border-sand-300 rounded-xl shadow-2xs"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="h-4 w-4 text-[#14532D] shrink-0" />
                    <span className="text-xs font-medium text-slate-800 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 ml-2 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartBatch}
              disabled={isUploading}
              className="w-full py-3.5 bg-[#14532D] hover:bg-forest-900 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Batch Inspections...
                </>
              ) : (
                <>
                  <Layers className="h-4 w-4" />
                  Start Batch Inspection ({selectedFiles.length} Packages)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Recent Batches History */}
      <div className="bg-white border border-sand-300 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-[#14532D] text-white font-bold text-xs flex items-center justify-center font-sans">
              3
            </div>
            <h2 className="text-base font-bold font-serif text-slate-900">Recent Batch Inspections</h2>
          </div>
          <Link to="/inspections" className="text-xs text-slate-700 font-bold hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-sand-200 bg-sand-50/40 rounded-xl overflow-hidden border border-sand-200">
          <div className="p-4 flex items-center justify-between hover:bg-sand-100/50 cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white border border-sand-300 text-slate-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 font-sans">Batch Inspection</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  30/9/2026, 9:07:03 am • 1 Packages
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-600">
                1/1 Done
              </span>
              <span className="px-3 py-1 bg-[#108548] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                COMPLETED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchInspectionPage;

