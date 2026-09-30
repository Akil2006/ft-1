import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  RotateCw,
  ArrowLeft,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Fingerprint,
  BarChart3,
  FileText,
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700"></div>
      </div>
    );
  }

  if (!inspection || !id) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500">Inspection record not found.</p>
        <Link to="/inspections" className="text-forest-700 font-bold hover:underline">
          Return to Inspection Register
        </Link>
      </div>
    );
  }

  const getResultBadgeClass = (res?: string) => {
    switch (res) {
      case 'COMPLIANT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'MISSING_INFORMATION':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const primaryImage = images.length > 0 ? images[0].storage_path || images[0].filename : '';

  return (
    <div className="space-y-8 py-2">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/inspections"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspection Register</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 bg-white hover:bg-ivory-100 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-full border border-sand-300 shadow-2xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-forest-700" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            className="flex items-center space-x-2 bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-full shadow-md shadow-forest-900/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingReport ? 'Generating PDF...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Commodity Summary Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">{inspection.product_name || 'Unnamed Commodity'}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getResultBadgeClass(inspection.overall_result)}`}>
              {inspection.overall_result || 'PENDING'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-sans">
            <span>Category: <strong className="text-slate-900">{inspection.category || 'General'}</strong></span>
            <span>•</span>
            <span>Created: <strong className="text-slate-900">{new Date(inspection.created_at).toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="bg-ivory-50 p-3.5 rounded-2xl border border-sand-300 text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Screening Session ID</p>
          <p className="text-xs font-mono text-forest-800 font-bold mt-0.5">{inspection.id}</p>
        </div>
      </div>

      {/* FEATURE 2: Declaration Completeness Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-forest-700" />
              <span>Declaration Completeness Score</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Measures how many applicable expected statutory declarations were detected; it does not by itself determine final legal compliance.
            </p>
          </div>
          {compliance?.completeness_score !== undefined && compliance?.completeness_score !== null && (
            <div className="flex items-baseline gap-2 bg-ivory-100 px-5 py-2.5 rounded-2xl border border-sand-300">
              <span className="text-3xl font-extrabold text-forest-800 font-sans">
                {compliance.completeness_score.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-600 font-mono font-bold">
                ({compliance.detected_fields_count} / {compliance.expected_fields_count} detected)
              </span>
            </div>
          )}
        </div>

        {/* Detected vs Missing Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block font-sans">
              ✓ Detected Statutory Declarations
            </span>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {fields.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span className="font-bold capitalize">{f.field_name.replace('_', ' ')}:</span>
                  <span className="text-slate-600 font-mono">{f.raw_value}</span>
                </li>
              ))}
              {fields.length === 0 && <li className="text-slate-500 italic">No declarations detected.</li>}
            </ul>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block font-sans">
              ⚠ Missing / Unverified Declarations
            </span>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {compliance?.missing_fields?.map((mf, idx) => (
                <li key={idx} className="flex items-center gap-2 text-rose-800">
                  <span className="font-bold">⚠</span>
                  <span className="font-bold capitalize">{mf.replace('_', ' ')}</span>
                </li>
              ))}
              {(!compliance?.missing_fields || compliance.missing_fields.length === 0) && (
                <li className="text-emerald-700 text-xs font-bold">All expected declarations successfully detected!</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* FEATURE 4: SHA-256 Tamper-Evident Record Integrity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-forest-700" />
              <span>Tamper-Evident Record Integrity</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              SHA-256 digital fingerprint ensuring finalized inspection record data has not been modified.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!id) return;
              try {
                const ver = await inspectionApi.verifyIntegrity(id);
                alert(`${ver.valid ? '✓ Verified Integrity:' : '⚠ Warning:'} ${ver.message}\nAlgorithm: ${ver.algorithm}`);
              } catch (e) {
                alert('Failed to verify record integrity.');
              }
            }}
            className="px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold rounded-full shadow-xs transition-colors flex items-center gap-2 self-start"
          >
            <span>Verify Fingerprint</span>
          </button>
        </div>

        <div className="bg-ivory-50 border border-sand-300 rounded-2xl p-4 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-sand-200 pb-2">
            <span className="text-slate-500">Algorithm:</span>
            <span className="text-forest-800 font-bold">{compliance?.hash_algorithm || 'SHA-256'}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500 shrink-0">SHA-256 Fingerprint:</span>
            <span className="text-slate-800 truncate ml-4 font-bold text-[11px]">
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

      {/* Statutory Rules Verification Trace Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-4">
        <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-forest-700" />
          <span>Legal Metrology Statutory Rules Trace</span>
        </h3>

        {compliance && compliance.checks && compliance.checks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                  <th className="py-3 px-4">Rule ID</th>
                  <th className="py-3 px-4">Target Field</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-xs font-sans">
                {compliance.checks.map((chk: ComplianceCheck) => (
                  <tr key={chk.id} className="hover:bg-ivory-50">
                    <td className="py-3 px-4 font-mono font-bold text-forest-800">{chk.rule_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 uppercase">{chk.field_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-ivory-100 text-slate-700 border border-sand-300">
                        {chk.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] border ${getResultBadgeClass(chk.result)}`}>
                        {chk.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs leading-relaxed">{chk.reason}</td>
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
