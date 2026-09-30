import React, { useState } from 'react';
import { Evidence } from '../types/evidence';
import { ExtractedField } from '../types/extraction';
import { Eye, Crop, Sparkles } from 'lucide-react';

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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) return 'bg-sage-100 text-forest-800 border-sage-300';
    if (confidence >= 0.70) return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-rose-100 text-rose-900 border-rose-300';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm">
      {/* Main Image with Bounding Box Overlay */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-forest-700" />
            <span>Packaging Evidence & Statutory OCR Bounding Boxes</span>
          </h3>
          <span className="text-xs text-slate-500 font-sans">Click card to highlight region</span>
        </div>

        <div className="relative border border-sand-300 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[360px] shadow-inner">
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
                    fill={isSelected ? 'rgba(20, 83, 45, 0.35)' : 'rgba(217, 119, 6, 0.2)'}
                    stroke={isSelected ? '#14532D' : '#D97706'}
                    strokeWidth={isSelected ? '3' : '2'}
                    rx="4"
                  />
                  <text
                    x={`${x}%`}
                    y={`${Math.max(y - 2, 4)}%`}
                    fill={isSelected ? '#4ADE80' : '#FDE047'}
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono"
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
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <Crop className="w-5 h-5 text-forest-700" />
            <span>Extracted ROI Crops</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">OCR Engine</span>
        </div>

        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {extractedFields.map((field) => {
            const ev = evidenceList.find((e) => e.field_id === field.id || e.field_name === field.field_name);
            const isSelected = selectedFieldId === field.id;

            return (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(isSelected ? null : field.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sage-50 border-forest-600 shadow-sm'
                    : 'bg-sand-50/70 border-sand-300 hover:bg-sand-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 font-sans">
                    {field.field_name.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getConfidenceBadge(
                      field.confidence
                    )}`}
                  >
                    {(field.confidence * 100).toFixed(0)}% OCR
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-900 mb-2 font-mono bg-white px-2 py-1 rounded border border-sand-200">
                  {field.raw_value || <span className="text-slate-400 italic font-sans text-xs">Not Detected</span>}
                </div>

                {ev && (ev.crop_url || ev.crop_path) && (
                  <div className="mt-2 pt-2 border-t border-sand-200">
                    <p className="text-[10px] text-slate-500 mb-1 font-mono uppercase">Extracted Crop ROI Snippet:</p>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-sand-300">
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

