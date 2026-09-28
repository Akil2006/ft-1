import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  RotateCw,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { inspectionApi } from '../services/inspection';
import { extractionApi } from '../services/extraction';
import { rulesApi } from '../services/rules';
import { evidenceApi } from '../services/evidence';
import { reportsApi } from '../services/reports';
import { Inspection, InspectionImage } from '../types/inspection';
import { ExtractedField } from '../types/extraction';
import { InspectionComplianceResult, ComplianceCheck } from '../types/compliance';
import { Evidence } from '../types/evidence';
import { EvidenceViewer } from '../components/EvidenceViewer';

export const InspectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [images, setImages] = useState<InspectionImage[]>([]);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [compliance, setCompliance] = useState<InspectionComplianceResult | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [insp, imgs, extRes, comp, evRes] = await Promise.all([
        inspectionApi.getInspection(id),
        inspectionApi.getInspectionImages(id),
        extractionApi.getExtractedFields(id),
        rulesApi.getComplianceResults(id),
        evidenceApi.getInspectionEvidence(id),
      ]);
      setInspection(insp);
      setImages(imgs);
      setFields(extRes.fields || []);
      setCompliance(comp);
      setEvidenceList(evRes.evidence || []);
    } catch (err) {
      console.error('Failed to load inspection details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    setDownloadingReport(true);
    try {
      const blob = await reportsApi.downloadReport(id);
      reportsApi.triggerBlobDownload(blob, `SmartPack_Report_${id.substring(0, 8)}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF report', err);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!inspection || !id) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400">Inspection record not found.</p>
        <Link to="/inspections" className="text-blue-400 font-semibold hover:underline">
          Return to Inspection History
        </Link>
      </div>
    );
  }

  const getResultBadge = (res?: string) => {
    switch (res) {
      case 'COMPLIANT':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'MISSING_INFORMATION':
        return 'bg-rose-900/60 text-rose-300 border-rose-700/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const primaryImage = images.length > 0 ? images[0].storage_path || images[0].filename : '';

  return (
    <div className="space-y-8">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/inspections"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspection History</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-600/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingReport ? 'Generating PDF...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Commodity Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{inspection.product_name || 'Unnamed Product'}</h1>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getResultBadge(
                inspection.overall_result
              )}`}
            >
              {inspection.overall_result || 'PENDING'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
            <span>Category: <strong className="text-slate-200">{inspection.category || 'General'}</strong></span>
            <span>•</span>
            <span>Created: <strong className="text-slate-200">{new Date(inspection.created_at).toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Screening ID</p>
          <p className="text-xs font-mono text-blue-400 font-bold">{inspection.id}</p>
        </div>
      </div>

      {/* FEATURE 2: Declaration Completeness Score Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-mono">📊</span>
              Declaration Completeness Score
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Measures detected applicable declarations; it is not a legal compliance score.
            </p>
          </div>
          {compliance?.completeness_score !== undefined && compliance?.completeness_score !== null && (
            <div className="flex items-baseline gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80">
              <span className="text-3xl font-extrabold text-sky-400">
                {compliance.completeness_score.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({compliance.detected_fields_count} / {compliance.expected_fields_count} detected)
              </span>
            </div>
          )}
        </div>

        {/* Detected vs Missing List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              ✓ Detected Declarations
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {fields.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="font-semibold capitalize">{f.field_name.replace('_', ' ')}</span>
                  <span className="text-slate-500 font-mono text-[10px]">({f.raw_value})</span>
                </li>
              ))}
              {fields.length === 0 && <li className="text-slate-500 italic">No declarations detected.</li>}
            </ul>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-4 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              ⚠ Missing / Unverified Declarations
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {compliance?.missing_fields?.map((mf, idx) => (
                <li key={idx} className="flex items-center gap-2 text-rose-300">
                  <span>⚠</span>
                  <span className="font-semibold capitalize">{mf.replace('_', ' ')}</span>
                </li>
              ))}
              {(!compliance?.missing_fields || compliance.missing_fields.length === 0) && (
                <li className="text-emerald-400 text-xs">All expected declarations successfully detected!</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* FEATURE 4: Tamper-Evident Inspection Hash Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">🔒</span>
              Tamper-Evident Inspection Record Integrity
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              SHA-256 digital fingerprint ensuring finalized inspection record data has not been altered.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!id) return;
              try {
                const ver = await inspectionApi.verifyIntegrity(id);
                alert(`${ver.valid ? '✓' : '⚠'} ${ver.message}\nAlgorithm: ${ver.algorithm}`);
              } catch (e) {
                alert('Failed to verify record integrity.');
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-2 self-start"
          >
            <span>Verify Integrity</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Algorithm:</span>
            <span className="text-emerald-400 font-bold">{compliance?.hash_algorithm || 'SHA-256'}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-400 shrink-0">SHA-256 Hash:</span>
            <span className="text-slate-200 truncate ml-4 font-bold text-[11px]">
              {compliance?.integrity_hash || 'Unfinalized / Pending Hash'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Evidence ROI Viewer */}
      {primaryImage && (
        <EvidenceViewer
          imageUrl={primaryImage}
          evidenceList={evidenceList}
          extractedFields={fields}
        />
      )}

      {/* Compliance Checks Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <span>Legal Metrology Statutory Rules Trace</span>
        </h3>

        {compliance && compliance.checks && compliance.checks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Rule ID</th>
                  <th className="py-3 px-4">Target Field</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {compliance.checks.map((chk: ComplianceCheck) => (
                  <tr key={chk.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{chk.rule_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200 uppercase">{chk.field_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {chk.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getResultBadge(
                          chk.result
                        )}`}
                      >
                        {chk.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs leading-relaxed">{chk.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4">No compliance checks generated yet.</p>
        )}
      </div>
    </div>
  );
};
