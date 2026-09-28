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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-sky-400" />
            Batch Package Inspection
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload multiple package images to execute automated legal metrology inspection sessions in bulk.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-6 backdrop-blur-sm">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Batch Name / Identifier
          </label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. Daily Warehouse Shipment Audit"
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Drag Drop Area */}
        <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-xl p-8 text-center transition-colors bg-slate-900/30">
          <input
            type="file"
            id="batch-files-input"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="batch-files-input" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className="h-12 w-12 text-sky-400 mb-3" />
            <span className="text-base font-medium text-slate-200">
              Click to select multiple package images
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports JPG, PNG, WEBP — up to 20 images per batch
            </span>
          </label>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Selected Package Images ({selectedFiles.length})
              </span>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-700/70 rounded-lg"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="text-xs text-slate-200 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 ml-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartBatch}
              disabled={isUploading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
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
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/60 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Batch: {activeBatch.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">ID: {activeBatch.id}</span>
            </div>
            <button
              onClick={() => fetchBatchDetail(activeBatch.id)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 self-start"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Status
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl text-center">
              <span className="text-xs text-slate-400">Total Items</span>
              <p className="text-2xl font-bold text-slate-100 mt-1">{activeBatch.total_count}</p>
            </div>
            <div className="bg-slate-900/60 border border-emerald-500/30 p-4 rounded-xl text-center">
              <span className="text-xs text-emerald-400">Completed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeBatch.completed_count}</p>
            </div>
            <div className="bg-slate-900/60 border border-amber-500/30 p-4 rounded-xl text-center">
              <span className="text-xs text-amber-400">Processing</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {activeBatch.total_count - (activeBatch.completed_count + activeBatch.failed_count)}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-rose-500/30 p-4 rounded-xl text-center">
              <span className="text-xs text-rose-400">Failed</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{activeBatch.failed_count}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Overall Progress</span>
              <span>
                {Math.round(((activeBatch.completed_count + activeBatch.failed_count) / activeBatch.total_count) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((activeBatch.completed_count + activeBatch.failed_count) / activeBatch.total_count) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Batch Inspections List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300">Package Inspection Items</h3>
            <div className="divide-y divide-slate-700/50 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
              {activeBatch.inspections.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40">
                  <div className="flex items-center space-x-3">
                    {item.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
                    {item.status === 'FAILED' && <XCircle className="h-5 w-5 text-rose-400 shrink-0" />}
                    {item.status !== 'COMPLETED' && item.status !== 'FAILED' && (
                      <Loader2 className="h-5 w-5 text-amber-400 animate-spin shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.product_name || 'Package Item'}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {item.overall_result && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          item.overall_result === 'COMPLIANT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.overall_result === 'REVIEW_REQUIRED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.overall_result}
                      </span>
                    )}

                    <Link
                      to={`/inspections/${item.id}`}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Batches History */}
      {recentBatches.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-4 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-slate-100">Recent Batch Inspections</h2>
          <div className="divide-y divide-slate-700/50 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
            {recentBatches.map((b) => (
              <div
                key={b.id}
                onClick={() => fetchBatchDetail(b.id)}
                className="p-4 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{b.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(b.created_at).toLocaleString()} • {b.total_count} Packages
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-300">
                    {b.completed_count}/{b.total_count} Done
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
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
