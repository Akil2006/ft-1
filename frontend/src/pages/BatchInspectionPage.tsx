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
  Sparkles,
} from 'lucide-react';
import { batchApi } from '../services/batch';
import { BatchDetailResponse, BatchResponse } from '../types/batch';

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
    <div className="space-y-8 py-2">
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-r from-ivory-100 via-sand-100 to-sage-50 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-3">
              <Layers className="h-7 w-7 text-forest-700" />
              <span>Batch Package Inspection</span>
            </h1>
            <p className="text-xs text-slate-600 font-sans">
              Upload multiple package images to execute automated legal metrology inspection sessions in bulk.
            </p>
            <p className="font-handwriting text-lg text-forest-700 font-bold pt-1">
              Multiple products. Faster screening. Fairer markets.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Step 1: Batch Identifier Name */}
      <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs">
            1
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900">Batch Name / Identifier</h2>
        </div>

        <div>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. Daily Warehouse Shipment Audit"
            className="w-full bg-ivory-50 border border-sand-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all"
          />
        </div>
      </div>

      {/* Step 2: Package Images Drag & Drop */}
      <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs">
              2
            </div>
            <h2 className="text-base font-bold font-serif text-slate-900">Package Images</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            UPLOAD UP TO 20 IMAGES PER BATCH
          </span>
        </div>

        <div className="border-2 border-dashed border-sand-300 hover:border-forest-600/60 rounded-2xl p-8 text-center transition-all bg-ivory-50/60">
          <input
            type="file"
            id="batch-files-input"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="batch-files-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mb-3 shadow-xs">
              <UploadCloud className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-slate-900 font-sans">
              Drag and drop multiple package images here
            </span>
            <span className="text-xs text-slate-500 mt-1">
              or click to select files — Supports JPG, PNG, WEBP (up to 20 per batch)
            </span>
          </label>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
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
                  className="flex items-center justify-between p-3 bg-ivory-50 border border-sand-300 rounded-xl shadow-2xs"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="h-4 w-4 text-forest-700 shrink-0" />
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
              className="w-full py-3.5 bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
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

      {/* Active Batch Progress Summary */}
      {activeBatch && (
        <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-sand-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                Batch: {activeBatch.name}
              </h2>
              <span className="text-xs text-slate-500 font-mono">ID: {activeBatch.id}</span>
            </div>
            <button
              onClick={() => fetchBatchDetail(activeBatch.id)}
              className="px-3.5 py-1.5 bg-ivory-100 hover:bg-sand-100 rounded-full border border-sand-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 self-start shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-forest-700" />
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-ivory-50 border border-sand-300 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-slate-600 uppercase">Total Items</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">{activeBatch.total_count}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-sans">{activeBatch.completed_count}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-800 uppercase">Processing</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1 font-sans">
                {activeBatch.total_count - (activeBatch.completed_count + activeBatch.failed_count)}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-rose-800 uppercase">Failed</span>
              <p className="text-2xl font-extrabold text-rose-700 mt-1 font-sans">{activeBatch.failed_count}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 font-sans">
              <span>Overall Progress</span>
              <span>
                {Math.round(((activeBatch.completed_count + activeBatch.failed_count) / activeBatch.total_count) * 100)}%
              </span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-forest-700 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((activeBatch.completed_count + activeBatch.failed_count) / activeBatch.total_count) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">Package Inspection Items</h3>
            <div className="divide-y divide-sand-200 bg-ivory-50 rounded-2xl overflow-hidden border border-sand-300">
              {activeBatch.inspections.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-ivory-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {item.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />}
                    {item.status === 'FAILED' && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
                    {item.status !== 'COMPLETED' && item.status !== 'FAILED' && (
                      <Loader2 className="h-5 w-5 text-amber-600 animate-spin shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 font-sans">{item.product_name || 'Package Item'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {item.overall_result && (
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          item.overall_result === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.overall_result === 'REVIEW_REQUIRED'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {item.overall_result}
                      </span>
                    )}

                    <Link
                      to={`/inspections/${item.id}`}
                      className="text-xs text-forest-700 hover:text-forest-800 font-bold flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Recent Batches History */}
      {recentBatches.length > 0 && (
        <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs">
              3
            </div>
            <h2 className="text-base font-bold font-serif text-slate-900">Recent Batch Inspections</h2>
          </div>

          <div className="divide-y divide-sand-200 bg-ivory-50 rounded-2xl overflow-hidden border border-sand-300">
            {recentBatches.map((b) => (
              <div
                key={b.id}
                onClick={() => fetchBatchDetail(b.id)}
                className="p-4 flex items-center justify-between hover:bg-ivory-100 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 font-sans">{b.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(b.created_at).toLocaleString()} • {b.total_count} Packages
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold font-mono text-slate-700">
                    {b.completed_count}/{b.total_count} Done
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default BatchInspectionPage;
