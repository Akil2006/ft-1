import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  Play,
  AlertCircle,
  Package,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { inspectionApi } from '../services/inspection';
import { ocrApi } from '../services/ocr';
import { extractionApi } from '../services/extraction';
import { rulesApi } from '../services/rules';
import { ImageType } from '../types/inspection';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { PackageInspectionIllustration } from '../components/BrandingAssets';

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
  const [category, setCategory] = useState('FOOD');

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
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold font-serif text-slate-900">New Commodity Inspection</h1>
        <p className="text-xs text-slate-600 font-sans">
          Upload or capture package images to run automated Legal Metrology screening.
        </p>
        <p className="font-handwriting text-lg text-forest-700 font-bold pt-1">
          Scan Compliant Packs. Ensure Fair Markets.
        </p>
      </div>

      {/* Workflow Step Bar */}
      <div className="flex items-center justify-between bg-white border border-sand-300 rounded-2xl p-4 shadow-xs">
        <div className={`flex items-center space-x-2.5 ${step >= 1 ? 'text-forest-800' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-forest-700 text-white shadow-xs' : 'bg-sand-200 text-slate-500'}`}>
            1
          </div>
          <span className="text-xs font-bold font-sans">Metadata</span>
        </div>
        <div className="h-0.5 flex-1 bg-sand-200 mx-4" />

        <div className={`flex items-center space-x-2.5 ${step >= 2 ? 'text-forest-800' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-forest-700 text-white shadow-xs' : 'bg-sand-200 text-slate-500'}`}>
            2
          </div>
          <span className="text-xs font-bold font-sans">Add Images</span>
        </div>
        <div className="h-0.5 flex-1 bg-sand-200 mx-4" />

        <div className={`flex items-center space-x-2.5 ${step >= 3 ? 'text-forest-800' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-forest-700 text-white shadow-xs' : 'bg-sand-200 text-slate-500'}`}>
            3
          </div>
          <span className="text-xs font-bold font-sans">Screening</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Step 1: Commodity Metadata Form */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 hidden md:block">
            <PackageInspectionIllustration className="w-full shadow-sm" />
          </div>

          <div className="md:col-span-8 bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-sand-200">
              <Package className="w-5 h-5 text-forest-700" />
              <h3 className="text-base font-bold font-serif text-slate-900">Commodity Metadata</h3>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Premium Roasted Almonds 500g"
                  className="w-full px-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all font-sans"
                >
                  <option value="FOOD">Food & Beverage</option>
                  <option value="COSMETICS">Cosmetics & Personal Care</option>
                  <option value="PHARMA">Pharmaceuticals</option>
                  <option value="ELECTRONICS">Electronics & Appliances</option>
                  <option value="GENERAL">General Packaged Goods</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-forest-700 hover:bg-forest-600 text-white font-bold py-3 rounded-xl shadow-md shadow-forest-900/20 transition-all text-xs tracking-wide uppercase mt-4"
              >
                Continue to Package Images →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Image Selection (Dual Mode: Upload OR Live Camera) */}
      {step === 2 && (
        <div className="bg-white border border-sand-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-forest-700" />
                <span>Package Images & Label Surfaces</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Provide package surface images via File Upload or Live Camera Stream.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Surface Type:</span>
              <select
                value={currentSurfaceType}
                onChange={(e) => setCurrentSurfaceType(e.target.value as ImageType)}
                className="bg-ivory-100 border border-sand-300 rounded-lg text-xs font-bold text-slate-800 px-3 py-1.5 focus:outline-none"
              >
                <option value="FRONT">FRONT</option>
                <option value="BACK">BACK</option>
                <option value="SIDE">SIDE</option>
                <option value="TOP">TOP</option>
                <option value="BOTTOM">BOTTOM</option>
              </select>
            </div>
          </div>

          {/* Action Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-sand-300 rounded-2xl p-6 text-center bg-ivory-50/80 hover:bg-ivory-100 transition-all flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 border border-forest-200 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upload Image File</p>
                <p className="text-[11px] text-slate-500">Select JPG, PNG, or WEBP package files</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="package-file-input"
              />
              <label
                htmlFor="package-file-input"
                className="cursor-pointer bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs transition-all inline-flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Browse Files</span>
              </label>
            </div>

            <div className="border border-sand-300 rounded-2xl p-6 text-center bg-ivory-50/80 hover:bg-ivory-100 transition-all flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 border border-forest-200 flex items-center justify-center shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Capture with Camera</p>
                <p className="text-[11px] text-slate-500">Use live web camera feed</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs transition-all inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>
            </div>
          </div>

          {/* Uploaded Package Images Grid */}
          {packageImages.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-sand-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                Attached Package Surfaces ({packageImages.length})
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {packageImages.map((img) => (
                  <div key={img.id} className="relative bg-ivory-50 rounded-xl overflow-hidden border border-sand-300 shadow-xs group">
                    <img src={img.previewUrl} alt="Package surface" className="w-full h-28 object-cover" />
                    <div className="p-1.5 bg-white flex items-center justify-between text-[10px] border-t border-sand-200">
                      <span className="font-bold text-forest-700 font-mono">{img.imageType}</span>
                      <span className="text-slate-500 uppercase">{img.source}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUploadImages}
            disabled={uploading || packageImages.length === 0}
            className="w-full bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide mt-4"
          >
            {uploading ? 'Processing & Uploading Images...' : `Proceed to Screening (${packageImages.length} images) →`}
          </button>

          <CameraCaptureModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCaptureConfirm={handleCameraCaptureConfirm}
          />
        </div>
      )}

      {/* Step 3: Run Pipeline */}
      {step === 3 && (
        <div className="bg-white border border-sand-300 rounded-3xl p-8 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 border border-forest-200 flex items-center justify-center mx-auto text-forest-700 shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-serif text-slate-900">Execute Compliance Screening</h3>
            <p className="text-xs text-slate-600 font-sans max-w-md mx-auto">
              Runs OpenCV deskewing, fallback OCR engines, statutory field extraction matchers, and Legal Metrology Rule Engine.
            </p>
          </div>

          {processing ? (
            <div className="space-y-3 py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700 mx-auto" />
              <p className="text-xs font-mono font-bold text-forest-700">{processStatus}</p>
            </div>
          ) : (
            <button
              onClick={handleRunPipeline}
              className="bg-forest-700 hover:bg-forest-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-forest-900/20 transition-all text-xs uppercase tracking-wide inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Automated Screening</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
