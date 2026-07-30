import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const initCamera = async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmera não é suportado neste navegador.');
      }

      let mediaStream: MediaStream;
      try {
        // Optimized camera constraints (1080p ideal for fast capture & high sharpness)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false,
        });
      } catch (hdErr) {
        console.log('Fallback to standard camera constraints:', hdErr);
        // Fallback to basic facingMode constraint if HD request fails
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
      }

      // Try applying continuous auto-focus and auto-exposure if supported by device
      const track = mediaStream.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          await track.applyConstraints({
            advanced: [
              { focusMode: 'continuous' } as any,
              { exposureMode: 'continuous' } as any,
              { whiteBalanceMode: 'continuous' } as any
            ]
          });
        } catch (cErr) {
          // ignore if specific advanced constraints aren't supported
        }
      }

      setStream(mediaStream);
      localStorage.setItem('camera_permission_always_allowed', 'true');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permissão da câmera foi negada no navegador. Habilite a permissão nas configurações ou selecione uma imagem da galeria.');
      } else {
        setError('Não foi possível inicializar a câmera. Escolha um arquivo de imagem abaixo ou use o gráfico de demonstração.');
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const compressImageForAI = (dataUrl: string, maxDim = 1280, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (Math.max(img.width, img.height) <= maxDim) {
          resolve(dataUrl);
          return;
        }
        const scale = maxDim / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleTakeSnap = async () => {
    if (videoRef.current) {
      const video = videoRef.current;

      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;

      // Always guarantee Landscape orientation (width > height) for captured photos
      const isPortraitStream = videoHeight > videoWidth;

      let rawWidth = videoWidth;
      let rawHeight = videoHeight;
      let shouldRotate = false;

      if (isPortraitStream) {
        shouldRotate = true;
        rawWidth = videoHeight;
        rawHeight = videoWidth;
      }

      // Max 1280px dimension to ensure high speed transmission and AI vision response
      const MAX_DIM = 1280;
      let targetWidth = rawWidth;
      let targetHeight = rawHeight;
      if (Math.max(rawWidth, rawHeight) > MAX_DIM) {
        const scale = MAX_DIM / Math.max(rawWidth, rawHeight);
        targetWidth = Math.round(rawWidth * scale);
        targetHeight = Math.round(rawHeight * scale);
      }

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (shouldRotate) {
          ctx.translate(targetWidth / 2, targetHeight / 2);
          ctx.rotate((-90 * Math.PI) / 180);
          ctx.drawImage(video, -targetHeight / 2, -targetWidth / 2, targetHeight, targetWidth);
        } else {
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        }

        // 0.82 quality provides fast base64 encoding/transmission and crisp chart text
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        onCapture(dataUrl);
        onClose();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImageForAI(event.target.result as string);
          onCapture(compressed);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoChart = () => {
    // Generate a clean trading chart canvas sample image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark background
      ctx.fillStyle = '#131722';
      ctx.fillRect(0, 0, 800, 500);

      // Grid lines
      ctx.strokeStyle = '#1e2330';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 500);
        ctx.stroke();
      }
      for (let y = 0; y < 500; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Title header
      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('EUR/USD - H1 (Simulação de Câmera)', 30, 40);

      // Draw Candlesticks
      const prices = [300, 310, 290, 320, 340, 330, 360, 380, 370, 400, 390, 420];
      prices.forEach((p, i) => {
        const x = 80 + i * 55;
        const open = p;
        const close = p + (i % 2 === 0 ? 25 : -15);
        const high = Math.max(open, close) + 15;
        const low = Math.min(open, close) - 15;
        const isBullish = close >= open;

        // Wick
        ctx.strokeStyle = isBullish ? '#089981' : '#f23645';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, 500 - high);
        ctx.lineTo(x + 10, 500 - low);
        ctx.stroke();

        // Candle body
        ctx.fillStyle = isBullish ? '#089981' : '#f23645';
        ctx.fillRect(x, 500 - Math.max(open, close), 20, Math.abs(close - open) || 4);
      });

      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Fotografar Gráfico
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            error
              ? 'text-amber-400 bg-amber-950/80 border-amber-800/60'
              : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
          }`}>
            <Check className="w-3 h-3" /> {error ? 'Modo Alternativo' : 'Câmera Pronta'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder or Error/Fallback */}
      <div className="relative flex-1 my-4 bg-black rounded-2xl overflow-hidden border border-[#21262d] flex items-center justify-center">
        {error ? (
          <div className="p-6 text-center max-w-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Permissão de Câmera AVISO</h4>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">{error}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Carregar Imagem da Galeria
              </button>

              <button
                onClick={handleUseDemoChart}
                className="w-full py-2.5 px-4 bg-[#161b22] border border-[#21262d] text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Gerar Gráfico de Demonstração
              </button>

              <button
                onClick={initCamera}
                className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Câmera Novamente
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-cyan-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-bold text-cyan-300 bg-slate-950/70 px-3 py-1 rounded-full border border-cyan-500/30">
                Alinhe o gráfico dentro da área
              </span>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Bottom Controls */}
      {!error && (
        <div className="flex items-center justify-around py-4 z-10">
          <button
            onClick={toggleFacingMode}
            className="p-3 rounded-full bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white"
            title="Alternar Câmera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTakeSnap}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-1 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full border-2 border-slate-950 bg-white/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white"></div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white"
            title="Carregar de arquivo"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

