import React, { useState } from 'react';
import { Evidence } from '../types/evidence';
import { ExtractedField } from '../types/extraction';
import { Eye, Crop } from 'lucide-react';

interface EvidenceViewerProps {
  imageUrl: string;
  evidenceList: Evidence[];
  extractedFields: ExtractedField[];
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  imageUrl,
  evidenceList,
  extractedFields,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (confidence >= 0.70) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const serverHost = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

  const formatImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${serverHost}${cleanPath}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Main Image with Bounding Box Overlay */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span>Packaging Evidence & OCR Bounding Boxes</span>
          </h3>
          <span className="text-xs text-slate-400">Click field card to highlight region</span>
        </div>

        <div className="relative border border-slate-700/60 rounded-lg overflow-hidden bg-black flex items-center justify-center min-h-[350px]">
          <img
            src={formatImageUrl(imageUrl)}
            alt="Package Surface"
            className="w-full max-h-[550px] object-contain"
          />

          {/* Render Bounding Box Overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {evidenceList.map((ev) => {
              if (ev.bbox_x === undefined || ev.bbox_y === undefined) return null;
              const x = ev.bbox_x;
              const y = ev.bbox_y;
              const w = ev.bbox_width || 10;
              const h = ev.bbox_height || 10;
              const isSelected = selectedFieldId === ev.field_id;

              return (
                <g key={ev.id}>
                  <rect
                    x={`${x}%`}
                    y={`${y}%`}
                    width={`${w}%`}
                    height={`${h}%`}
                    fill={isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(234, 179, 8, 0.15)'}
                    stroke={isSelected ? '#3b82f6' : '#eab308'}
                    strokeWidth={isSelected ? '3' : '2'}
                    rx="4"
                  />
                  <text
                    x={`${x}%`}
                    y={`${Math.max(y - 2, 4)}%`}
                    fill={isSelected ? '#60a5fa' : '#fde047'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {ev.field_name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Field Cards & Snippets List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Crop className="w-5 h-5 text-emerald-400" />
          <span>Extracted ROI Crops</span>
        </h3>

        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {extractedFields.map((field) => {
            const ev = evidenceList.find((e) => e.field_id === field.id || e.field_name === field.field_name);
            const isSelected = selectedFieldId === field.id;

            return (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(isSelected ? null : field.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {field.field_name.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getConfidenceColor(
                      field.confidence
                    )}`}
                  >
                    {(field.confidence * 100).toFixed(0)}% OCR
                  </span>
                </div>

                <div className="text-sm font-medium text-white mb-2">
                  {field.raw_value || <span className="text-slate-500 italic">Not Detected</span>}
                </div>

                {ev && (ev.crop_url || ev.crop_path) && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-400 mb-1">Extracted Crop ROI Snippet:</p>
                    <div className="bg-black p-1 rounded border border-slate-700">
                      <img
                        src={formatImageUrl(ev.crop_url || ev.crop_path)}
                        alt={`Crop ${field.field_name}`}
                        className="h-16 w-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
