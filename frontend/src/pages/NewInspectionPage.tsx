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
      // Group files by image surface type or upload all through existing upload API
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
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">New Commodity Inspection</h1>
        <p className="text-xs text-slate-400">
          Upload or capture package surfaces for automated Legal Metrology screening
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            1
          </div>
          <span className="text-xs font-semibold">Metadata</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-800"></div>

        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            2
          </div>
          <span className="text-xs font-semibold">Add Images</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-800"></div>

        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            3
          </div>
          <span className="text-xs font-semibold">Screening</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Metadata Form */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span>Commodity Metadata</span>
          </h3>

          <form onSubmit={handleCreateInspection} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Premium Roasted Almonds 500g"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all text-sm mt-2"
            >
              Continue to Package Images →
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Image Input Selection (Dual Mode: Upload OR Camera) */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span>Package Images</span>
              </h3>
              <p className="text-xs text-slate-400">
                Provide surface images via File Upload or Live Camera Capture.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Surface Type:</span>
              <select
                value={currentSurfaceType}
                onChange={(e) => setCurrentSurfaceType(e.target.value as ImageType)}
                className="bg-slate-800 border border-slate-700 rounded-md text-xs text-white px-2.5 py-1 focus:outline-none"
              >
                <option value="FRONT">FRONT</option>
                <option value="BACK">BACK</option>
                <option value="SIDE">SIDE</option>
                <option value="TOP">TOP</option>
                <option value="BOTTOM">BOTTOM</option>
              </select>
            </div>
          </div>

          {/* Dual Action Option Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Upload File */}
            <div className="border border-slate-700/80 rounded-xl p-6 text-center bg-slate-800/40 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-blue-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Upload Image File</p>
                <p className="text-[11px] text-slate-400">Select JPG, PNG or WEBP from disk</p>
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
                className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Image</span>
              </label>
            </div>

            {/* Option 2: Camera Capture */}
            <div className="border border-slate-700/80 rounded-xl p-6 text-center bg-slate-800/40 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Capture with Camera</p>
                <p className="text-[11px] text-slate-400">Use live web camera stream</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Capture with Camera</span>
              </button>
            </div>
          </div>

          {/* Selected Package Images Grid */}
          {packageImages.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Attached Package Surfaces ({packageImages.length})
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {packageImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 group"
                  >
                    <img
                      src={img.previewUrl}
                      alt="Package surface"
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-1.5 bg-slate-900/90 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-blue-400 font-bold">{img.imageType}</span>
                      <span className="text-slate-400 uppercase">{img.source}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all text-sm mt-4"
          >
            {uploading ? 'Processing & Uploading Images...' : `Proceed to Screening (${packageImages.length} images) →`}
          </button>

          {/* Camera Capture Modal */}
          <CameraCaptureModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCaptureConfirm={handleCameraCaptureConfirm}
          />
        </div>
      )}

      {/* Step 3: Run Pipeline */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center mx-auto text-blue-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Execute Compliance Screening</h3>
            <p className="text-xs text-slate-400 mt-1">
              Runs OpenCV deskewing, fallback OCR engines, pattern field matchers, and Legal Metrology Rule Engine.
            </p>
          </div>

          {processing ? (
            <div className="space-y-3 py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs font-mono text-blue-400 font-medium">{processStatus}</p>
            </div>
          ) : (
            <button
              onClick={handleRunPipeline}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-lg shadow-xl shadow-emerald-600/30 transition-all text-base inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Automated Screening</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
