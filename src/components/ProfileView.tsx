import React, { useState, useRef, useEffect } from 'react';
import { User, Star, Camera, Trash2, Key, Eye, EyeOff, Save, Check, ShieldCheck, Zap, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ProfileViewProps {
  userName: string;
  setUserName: (name: string) => void;
  stats: { today: number; week: number; total: number };
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userName, setUserName, stats }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<string>('Pro Trader');
  const [apiKey, setApiKey] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isApiKeyMinimized, setIsApiKeyMinimized] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STATUS_OPTIONS = [
    { id: 'Iniciante', label: 'Trader Iniciante', badgeClass: 'bg-slate-900 border-slate-700 text-slate-300', textClass: 'text-slate-300' },
    { id: 'Pro Trader', label: 'Pro Trader', badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-400', textClass: 'text-amber-400' },
    { id: 'Master Trader', label: 'Master Trader', badgeClass: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400', textClass: 'text-cyan-400' },
    { id: 'VIP Trader', label: 'VIP / Elite', badgeClass: 'bg-purple-950/80 border-purple-500/50 text-purple-400', textClass: 'text-purple-400' },
    { id: 'Institucional', label: 'Institucional', badgeClass: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400', textClass: 'text-emerald-400' },
  ];

  useEffect(() => {
    const savedImg = localStorage.getItem('user_profile_image');
    if (savedImg) {
      setProfileImage(savedImg);
    }

    const savedStatus = localStorage.getItem('user_account_status');
    if (savedStatus) {
      setAccountStatus(savedStatus);
    }

    const key = localStorage.getItem('user_api_key') || '';
    setApiKey(key);
    setSavedApiKey(key);

    const savedMinimized = localStorage.getItem('api_key_card_minimized');
    if (savedMinimized !== null) {
      setIsApiKeyMinimized(savedMinimized === 'true');
    }
  }, []);

  const handleAccountStatusChange = (newStatus: string) => {
    setAccountStatus(newStatus);
    localStorage.setItem('user_account_status', newStatus);
  };

  const toggleApiKeyMinimized = () => {
    setIsApiKeyMinimized((prev) => {
      const next = !prev;
      localStorage.setItem('api_key_card_minimized', String(next));
      return next;
    });
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim();
    localStorage.setItem('user_api_key', trimmed);
    setSavedApiKey(trimmed);
    setSaveSuccess(true);
    setTestResult(null);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) return;

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({
          type: 'success',
          message: data.message || 'Chave API válida e operacional!',
        });
        // Auto save if valid
        localStorage.setItem('user_api_key', keyToTest);
        setSavedApiKey(keyToTest);
      } else {
        setTestResult({
          type: 'error',
          message: data.error || 'Não foi possível validar a chave API.',
        });
      }
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: 'Falha de rede ao tentar conectar à API.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('user_api_key');
    setApiKey('');
    setSavedApiKey('');
    setSaveSuccess(false);
    setTestResult(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        localStorage.setItem('user_profile_image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage(null);
    localStorage.removeItem('user_profile_image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentStatusObj = STATUS_OPTIONS.find((s) => s.id === accountStatus) || STATUS_OPTIONS[1];

  return (
    <div className="px-4 py-4 space-y-4 pb-28 animate-in fade-in duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        id="profile-image-input"
      />

      {/* Profile Header Card */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-[#1e2330] flex items-center space-x-4 relative overflow-hidden">
        {/* Avatar Box with Photo Upload */}
        <div className="relative group shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px] shadow-lg shadow-cyan-950/50 cursor-pointer overflow-hidden transition-transform active:scale-95"
            title="Clique para alterar foto de perfil"
          >
            <div className="w-full h-full bg-[#0d1117] rounded-2xl flex items-center justify-center text-cyan-400 font-black text-2xl overflow-hidden relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                userName ? userName.charAt(0).toUpperCase() : 'T'
              )}

              {/* Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black text-white tracking-tight">
              {userName || 'Trader'}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 mt-1">
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-1 ${currentStatusObj.badgeClass}`}>
              <Star className="w-3 h-3 fill-current" />
              {currentStatusObj.label}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              {profileImage ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
            </button>

            {profileImage && (
              <button
                onClick={handleRemoveImage}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Remover foto de perfil"
              >
                <Trash2 className="w-3 h-3" />
                Remover foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings (2 Columns) */}
      <div className="p-4 rounded-2xl bg-[#131722] border border-[#1e2330] space-y-3.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-cyan-400" />
          Dados do Perfil
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Column 1: Nome do Trader */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Nome do Trader:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full bg-[#0d1117] border border-[#1e2330] focus:border-cyan-500 text-slate-100 rounded-xl p-2.5 outline-none font-semibold transition-colors"
            />
          </div>

          {/* Column 2: Status da Conta Dropdown */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Status da Conta:</label>
            <div className="relative">
              <select
                value={accountStatus}
                onChange={(e) => handleAccountStatusChange(e.target.value)}
                className={`w-full bg-[#0d1117] border border-[#1e2330] focus:border-cyan-500 ${currentStatusObj.textClass} font-extrabold rounded-xl p-2.5 pr-8 outline-none cursor-pointer text-xs appearance-none transition-colors`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#0d1117] text-slate-200 font-semibold">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* API Key Configuration Card */}
      <div className="p-4 rounded-2xl bg-[#131722] border border-[#1e2330] space-y-3 transition-all">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggleApiKeyMinimized}
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-cyan-400" />
              Chave API
            </h3>

            {savedApiKey ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Configurada
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                Não informada
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleApiKeyMinimized();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors"
            title={isApiKeyMinimized ? "Expandir balão da Chave API" : "Minimizar balão da Chave API"}
          >
            {isApiKeyMinimized ? (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {!isApiKeyMinimized && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-[11px] text-slate-400 leading-normal">
              Insira sua Chave API do Gemini. Esta chave salva no seu perfil é utilizada obrigatoriamente na inicialização direta da biblioteca do Gemini (<code className="text-cyan-400 font-mono text-[10px]">new GoogleGenAI({`{ apiKey }`})</code>) para todas as análises e conversas no chat.
            </p>

            <div className="space-y-2 text-xs">
              <div className="relative flex items-center">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Cole sua Chave API aqui (ex: AIzaSy...)"
                  className="w-full bg-[#0d1117] border border-[#1e2330] focus:border-cyan-500 text-slate-100 rounded-xl py-2.5 pl-3 pr-10 outline-none font-mono text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  title={showApiKey ? 'Ocultar Chave API' : 'Mostrar Chave API'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Buttons: Save, Test & Clear */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Chave API
                </button>

                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={!apiKey.trim() || isTestingKey}
                  className="py-2.5 px-3 rounded-xl bg-[#1e2330] hover:bg-[#282e3f] border border-[#2e364a] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Testar Conexão com Gemini API"
                >
                  {isTestingKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Testar Conexão
                    </>
                  )}
                </button>

                {savedApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Remover Chave API"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Feedback Messages */}
              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chave API salva e ativada com sucesso!</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200 ${
                    testResult.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-800/60 text-rose-300'
                  }`}
                >
                  {testResult.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* App Version & Permissions Info */}
      <div className="p-4 rounded-2xl bg-[#131722] border border-[#1e2330] space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            Permissão de Câmera:
          </span>
          <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ativada
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-[#1e2330]/60">
          <span>Versão do Engine:</span>
          <span className="font-mono text-cyan-400 font-bold">Quant & SMC v3.6</span>
        </div>
      </div>
    </div>
  );
};
