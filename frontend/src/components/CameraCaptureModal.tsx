import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, VideoOff } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureConfirm: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureConfirm,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    setError(null);
    setCameraLoading(true);
    setCapturedBlob(null);
    setPreviewUrl(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API is not supported by your browser.');
      setCameraLoading(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found on your system.');
      } else {
        setError(`Unable to access camera: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
          stopCamera(); // Pause stream once captured
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;
    const fileName = `camera_capture_${Date.now()}.jpg`;
    const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
    onCaptureConfirm(file);
    handleClose();
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-sand-300 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand-200 pb-4">
          <div className="flex items-center space-x-2 text-slate-900">
            <Camera className="w-5 h-5 text-forest-700" />
            <h3 className="font-serif text-lg font-bold">Capture Package Image</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main View Area */}
        <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video border border-sand-300 flex items-center justify-center shadow-inner">
          {error ? (
            <div className="p-6 text-center space-y-3">
              <VideoOff className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-300 font-medium font-sans">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-slate-800 text-xs font-semibold rounded-lg border border-sand-300"
              >
                Retry Camera Connection
              </button>
            </div>
          ) : previewUrl ? (
            /* Captured Frame Preview */
            <img src={previewUrl} alt="Captured Package" className="w-full h-full object-contain" />
          ) : (
            /* Live Camera Stream */
            <>
              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-slate-300 text-xs font-sans">
                  Connecting to camera stream...
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-slate-700 text-xs font-semibold rounded-lg border border-sand-300 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {previewUrl ? (
              <>
                <button
                  onClick={handleRetake}
                  className="flex items-center space-x-2 px-4 py-2 bg-sand-200 hover:bg-sand-300 text-slate-800 text-xs font-semibold rounded-lg border border-sand-300 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center space-x-2 px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Captured Photo</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleCapture}
                disabled={!!error || cameraLoading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Frame</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

