import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  Play,
  AlertCircle,
  Package,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  BarChart2,
  ShieldCheck,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import { inspectionApi } from '../services/inspection';
import { ocrApi } from '../services/ocr';
import { extractionApi } from '../services/extraction';
import { rulesApi } from '../services/rules';
import { ImageType } from '../types/inspection';
import { CameraCaptureModal } from '../components/CameraCaptureModal';

interface PackageImageFile {
  id: string;
  file: File;
  imageType: ImageType;
  source: 'upload' | 'camera';
  previewUrl: string;
}

export const NewInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [inspectionId, setInspectionId] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Food & Beverage');

  // Files state (supports both Upload and Camera capture)
  const [packageImages, setPackageImages] = useState<PackageImageFile[]>([]);
  const [currentSurfaceType, setCurrentSurfaceType] = useState<ImageType>('FRONT');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await inspectionApi.createInspection({
        product_name: productName,
        category,
      });
      setInspectionId(created.id);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create inspection record');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: PackageImageFile[] = Array.from(e.target.files).map((f) => ({
        id: `file_${Math.random().toString(36).substring(2, 9)}`,
        file: f,
        imageType: currentSurfaceType,
        source: 'upload',
        previewUrl: URL.createObjectURL(f),
      }));
      setPackageImages((prev) => [...prev, ...newFiles]);
    }
  };

  const handleCameraCaptureConfirm = (capturedFile: File) => {
    const newImage: PackageImageFile = {
      id: `cam_${Math.random().toString(36).substring(2, 9)}`,
      file: capturedFile,
      imageType: currentSurfaceType,
      source: 'camera',
      previewUrl: URL.createObjectURL(capturedFile),
    };
    setPackageImages((prev) => [...prev, newImage]);
  };

  const handleRemoveImage = (idToRemove: string) => {
    setPackageImages((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleUploadImages = async () => {
    if (!inspectionId || packageImages.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const filesToUpload = packageImages.map((pi) => pi.file);
      await inspectionApi.uploadImages(inspectionId, filesToUpload, 'FRONT');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload packaging images');
    } finally {
      setUploading(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!inspectionId) return;
    setProcessing(true);
    setError(null);

    try {
      setProcessStatus('Step 1/3: Running Multi-Engine OCR...');
      await ocrApi.triggerOCR(inspectionId);

      setProcessStatus('Step 2/3: Extracting Statutory Declarations...');
      await extractionApi.triggerExtraction(inspectionId);

      setProcessStatus('Step 3/3: Evaluating Legal Metrology Compliance Rules...');
      await rulesApi.triggerCompliance(inspectionId);

      navigate(`/inspections/${inspectionId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Pipeline execution failed');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
          New <span className="text-[#14532D]">Commodity</span> Inspection
        </h1>
        <p className="text-xs text-slate-600 font-sans">
          Upload or capture package images to run automated legal Metrology screening.
        </p>
      </div>

      {/* 3 Step Process Bar */}
      <div className="max-w-2xl mx-auto flex items-center justify-between bg-sand-100/60 p-2.5 rounded-full border border-sand-300">
        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-xs ${step === 1 ? 'bg-[#14532D] text-white' : 'text-slate-600'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
          <FileText className="w-3.5 h-3.5" />
          <span>Metadata</span>
        </div>

        <span className="text-slate-400 text-xs">⟶</span>

        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-xs ${step === 2 ? 'bg-[#14532D] text-white' : 'text-slate-600'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">2</span>
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Add Images</span>
        </div>

        <span className="text-slate-400 text-xs">⟶</span>

        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-bold text-xs ${step === 3 ? 'bg-[#14532D] text-white' : 'text-slate-600'}`}>
          <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">3</span>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Screening</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-xs max-w-2xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side Packaging Scene */}
        <div className="lg:col-span-4 relative flex flex-col items-center justify-center p-4">
          <div className="text-center mb-3">
            <p className="font-handwriting text-xl text-slate-800 font-bold leading-tight">
              Scan<br />Compliant Packs<br />Ensure Fair Markets
            </p>
            <svg className="w-16 h-6 text-amber-500 mx-auto mt-1" viewBox="0 0 60 20" fill="none">
              <path d="M5 5 C 25 18, 45 5, 55 15" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="relative bg-[#FAF7EE] p-3 rounded-2xl border border-sand-300 shadow-md w-full max-w-xs">
            <div className="bg-amber-100 rounded-xl p-4 border border-amber-300 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#14532D] text-white mx-auto flex items-center justify-center font-bold text-sm">
                🌱
              </div>
              <p className="font-serif font-bold text-slate-900 text-sm">FarmBite</p>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">ROASTED ALMONDS</p>
              <div className="w-24 h-16 bg-amber-200/80 rounded-full mx-auto flex items-center justify-center text-2xl">
                🌰
              </div>
              <p className="text-[10px] text-slate-600 font-mono">Net Quantity: 500 g</p>
            </div>

            {/* Float Tags */}
            <div className="absolute -left-4 top-6 bg-white px-2.5 py-1 rounded-xl shadow-md border border-sand-300 text-[10px] font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Scan Labels with AI OCR</span>
            </div>

            <div className="absolute -left-2 top-24 bg-white px-2.5 py-1 rounded-xl shadow-md border border-sand-300 text-[10px] font-bold text-slate-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#14532D]" />
              <span>Verify Declarations</span>
            </div>

            <div className="absolute -left-4 top-40 bg-white px-2.5 py-1 rounded-xl shadow-md border border-sand-300 text-[10px] font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="text-xs">⚖️</span>
              <span>Ensure Compliance</span>
            </div>
          </div>
        </div>

        {/* Center Main Form Card */}
        <div className="lg:col-span-5 bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {step === 1 && (
            <>
              <div className="flex items-center space-x-3 pb-3 border-b border-sand-200">
                <div className="w-8 h-8 rounded-xl bg-sage-100 text-[#14532D] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold font-serif text-slate-900">Commodity Metadata</h3>
              </div>

              <form onSubmit={handleCreateInspection} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 font-sans">
                    PRODUCT NAME *
                  </label>
                  <div className="relative">
                    <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Premium Roasted Almonds 500g"
                      className="w-full pl-10 pr-4 py-2.5 bg-sand-50/50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 font-sans">
                    CATEGORY
                  </label>
                  <div className="relative">
                    <Utensils className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-sand-50/50 border border-sand-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all font-sans appearance-none"
                    >
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Cosmetics">Cosmetics & Personal Care</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Electronics">Electronics & Appliances</option>
                      <option value="General Package">General Packaged Goods</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#14532D] hover:bg-forest-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs tracking-wide flex items-center justify-center gap-2 mt-4"
                >
                  <span>Continue to Package Images</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                <h3 className="text-base font-bold font-serif text-slate-900">Package Images</h3>
                <select
                  value={currentSurfaceType}
                  onChange={(e) => setCurrentSurfaceType(e.target.value as ImageType)}
                  className="bg-sand-50 border border-sand-300 rounded-lg text-xs font-bold text-slate-800 px-3 py-1.5"
                >
                  <option value="FRONT">FRONT</option>
                  <option value="BACK">BACK</option>
                  <option value="SIDE">SIDE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="border border-sand-300 rounded-xl p-4 text-center bg-sand-50/40 hover:bg-sand-100/40 cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-6 h-6 text-[#14532D] mb-1" />
                  <span className="text-xs font-bold text-slate-800">Browse File</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="border border-sand-300 rounded-xl p-4 text-center bg-sand-50/40 hover:bg-sand-100/40 flex flex-col items-center"
                >
                  <Camera className="w-6 h-6 text-[#14532D] mb-1" />
                  <span className="text-xs font-bold text-slate-800">Camera</span>
                </button>
              </div>

              <button
                onClick={handleUploadImages}
                disabled={uploading || packageImages.length === 0}
                className="w-full bg-[#14532D] hover:bg-forest-900 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs tracking-wide"
              >
                {uploading ? 'Uploading...' : `Proceed to Screening (${packageImages.length})`}
              </button>

              <CameraCaptureModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCaptureConfirm={handleCameraCaptureConfirm}
              />
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <ShieldCheck className="w-12 h-12 text-[#14532D] mx-auto" />
              <h3 className="text-xl font-bold font-serif text-slate-900">Run Automated Screening</h3>
              {processing ? (
                <p className="text-xs font-mono font-bold text-[#14532D]">{processStatus}</p>
              ) : (
                <button
                  onClick={handleRunPipeline}
                  className="bg-[#14532D] hover:bg-forest-900 text-white font-bold px-8 py-3 rounded-full shadow-md text-xs"
                >
                  Start Screening
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side Feature Pills & Annotation */}
        <div className="lg:col-span-3 space-y-4 text-left">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-2xl border border-sand-300 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-sage-100 text-[#14532D] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Automated</p>
                <p className="text-[10px] text-slate-500">Legal Metrology Screening</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-2xl border border-sand-300 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-sage-100 text-[#14532D] flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Data-Driven</p>
                <p className="text-[10px] text-slate-500">Compliance</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-2xl border border-sand-300 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-sage-100 text-[#14532D] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Support</p>
                <p className="text-[10px] text-slate-500">Fair Markets</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="font-handwriting text-sm text-slate-800 font-bold leading-tight">
              'Accurate Labels<br />Informed Consumers<br />Stronger Markets'
            </p>
            <svg className="w-16 h-4 text-amber-500 mt-1" viewBox="0 0 60 16" fill="none">
              <path d="M5 5 Q 30 15 55 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewInspectionPage;

