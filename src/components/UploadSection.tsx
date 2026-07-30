import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ChevronRight, Sparkles, Image as ImageIcon, RefreshCw, X, AlertTriangle, RotateCw } from 'lucide-react';

interface UploadSectionProps {
  onOpenCamera: () => void;
  onAnalyze: (imageData: string, asset: string, timeframe: string, userNote?: string) => void;
  isLoading: boolean;
  selectedImage: string | null;
  setSelectedImage: (img: string | null) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onOpenCamera,
  onAnalyze,
  isLoading,
  selectedImage,
  setSelectedImage,
}) => {
  const [asset, setAsset] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImagePortrait, setIsImagePortrait] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        setIsImagePortrait(img.height > img.width);
      };
      img.src = selectedImage;

      // Automatically scroll page so image preview and "Analisar Mercado Agora" button are prominently centered in view
      const timer = setTimeout(() => {
        analyzeBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

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

  const handleRotateImage = () => {
    if (!selectedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const rotated = canvas.toDataURL('image/jpeg', 0.82);
        setSelectedImage(rotated);
      }
    };
    img.src = selectedImage;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImageForAI(event.target.result as string);
          setSelectedImage(compressed);
          setImageError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImageForAI(event.target.result as string);
          setSelectedImage(compressed);
          setImageError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerAnalysis = () => {
    if (!selectedImage) {
      setImageError('Por favor, tire uma foto ou selecione uma imagem do gráfico da galeria antes de analisar!');
      return;
    }
    setImageError(null);
    onAnalyze(selectedImage, asset, timeframe);
  };

  return (
    <div className="px-4 space-y-3.5 pb-24">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="file-input-gallery"
      />

      {/* Card 1: Tirar Foto do Gráfico */}
      <button
        type="button"
        onClick={() => {
          setImageError(null);
          onOpenCamera();
        }}
        className="w-full p-4 rounded-2xl bg-[#131722] hover:bg-[#181e2b] border border-[#1e2330] hover:border-cyan-500/30 transition-all flex items-center justify-between group active:scale-[0.99] text-left"
        id="card-take-photo"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a2130] border border-[#263045] flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
              Tirar Foto do Gráfico
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Usar câmera do celular</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </button>

      {/* Card 2: Carregar da Galeria */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full p-4 rounded-2xl bg-[#131722] hover:bg-[#181e2b] border border-[#1e2330] hover:border-cyan-500/30 transition-all flex items-center justify-between group active:scale-[0.99] text-left"
        id="card-upload-gallery"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a2130] border border-[#263045] flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
              Carregar da Galeria
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Selecione uma imagem ou solte aqui
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </button>

      {/* Selected Image Preview Box if any */}
      {selectedImage && (
        <div className="p-3.5 rounded-2xl bg-[#131722] border border-cyan-500/40 relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                Gráfico Carregado
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1e2330] text-slate-300 border border-[#2a3245]">
                {isImagePortrait ? 'Vertical (Retrato)' : 'Horizontal (Paisagem)'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRotateImage}
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-[#1e2330] transition-colors flex items-center gap-1 text-xs"
                title="Girar Imagem 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                }}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1e2330] transition-colors"
                title="Remover Imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className={`relative rounded-xl overflow-hidden border border-[#21262d] bg-[#0b0e14] flex items-center justify-center p-2 transition-all ${
            isImagePortrait ? 'h-64 sm:h-72' : 'h-48 sm:h-56'
          }`}>
            <img
              src={selectedImage}
              alt="Gráfico para análise"
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-md mx-auto"
            />
          </div>
        </div>
      )}

      {/* Image Error Alert Banner */}
      {imageError && (
        <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{imageError}</span>
          </div>
          <button
            type="button"
            onClick={() => setImageError(null)}
            className="text-amber-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Action Gradient Button: Analisar Mercado Agora */}
      <div className="pt-2">
        <button
          ref={analyzeBtnRef}
          type="button"
          onClick={handleTriggerAnalysis}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2.5 border border-cyan-300/30 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
          id="btn-analyze-now"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
              <span>Processando Quant & SMC AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide text-slate-950">Analisar Mercado Agora</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
