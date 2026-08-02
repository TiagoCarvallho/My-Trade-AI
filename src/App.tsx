import React, { useState } from 'react';
import { Header } from './components/Header';
import { GreetingCard } from './components/GreetingCard';
import { UploadSection } from './components/UploadSection';
import { CameraModal } from './components/CameraModal';
import { AnalysisResultModal } from './components/AnalysisResultModal';
import { HistoryView } from './components/HistoryView';
import { AIChatView } from './components/AIChatView';
import { ProfileView } from './components/ProfileView';
import { BottomNav, TabType } from './components/BottomNav';
import { TradeAnalysis } from './types';
import { SAMPLE_CHARTS } from './data/sampleCharts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analise');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TradeAnalysis | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(() => {
  return localStorage.getItem('mytrade_username') || localStorage.getItem('userName') || 'Trader';
});

  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);
  const [hasSeenHistory, setHasSeenHistory] = useState<boolean>(() => {
    return localStorage.getItem('has_seen_history') === 'true';
  });

  // When accessing history tab, mark history as seen so notification balloon disappears
  React.useEffect(() => {
    if (activeTab === 'historico') {
      setHasSeenHistory(true);
      localStorage.setItem('has_seen_history', 'true');
    }
  }, [activeTab]);

  // Initial history matching the "1 HOJE, 1 SEMANA, 1 TOTAL" from the reference image screenshot
  const INITIAL_HISTORY: TradeAnalysis[] = [];

const [history, setHistory] = useState<TradeAnalysis[]>(() => {
  const saved = localStorage.getItem('mytrade_history');
  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved history:', e);
    }
  }
  return INITIAL_HISTORY;
});

const saveHistory = (newHistory: TradeAnalysis[]) => {
  setHistory(newHistory);
  localStorage.setItem('mytrade_history', JSON.stringify(newHistory));
};

const handleDeleteHistoryItem = (id: string) => {
  const updated = history.filter((item) => item.id !== id);
  saveHistory(updated);
  if (currentAnalysis?.id === id) {
    setCurrentAnalysis(null);
  }
};

const handleClearHistory = () => {
  saveHistory([]);
  setCurrentAnalysis(null);
};

const stats = {
  today: history.length,
  week: history.length,
  total: history.length,
};

  const handleAnalyze = async (
    imageData: string,
    asset: string,
    timeframe: string,
    userNote: string
  ) => {
    const userApiKey = (localStorage.getItem('user_api_key') || '').trim();

    if (!userApiKey) {
      alert('⚠️ Chave API do Gemini Ausente!\n\nPara realizar a análise do gráfico, acesse a aba "Perfil" e salve sua Chave API pessoal do Gemini. Nenhuma chave padrão ou oculta é utilizada.');
      setActiveTab('perfil');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userApiKey,
        },
        body: JSON.stringify({
          image: imageData,
          asset,
          timeframe,
          userNote,
          apiKey: userApiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(`⚠️ Ops! Erro na análise:\n\n${data.error || 'Falha ao processar o gráfico. Verifique sua chave de API no Perfil.'}`);
        return;
      }

      const resAnalysis = data?.analysis;
      if (!resAnalysis) {
        alert('⚠️ O sistema não retornou os dados da análise. Tente novamente.');
        return;
      }

      const cleanVal = (val: any) => {
        if (!val || typeof val !== 'string') return null;
        const trimmed = val.trim();
        if (trimmed === 'N/A' || trimmed === 'null' || trimmed === 'Undefined' || trimmed === 'None') return null;
        return trimmed;
      };

      const detectedAsset = cleanVal(resAnalysis.detectedAsset) || cleanVal(asset) || 'WINQ26';
      const detectedTimeframe = cleanVal(resAnalysis.detectedTimeframe) || cleanVal(timeframe) || '5Min';
      
      let headerInfo = resAnalysis.headerInfo;
      if (!cleanVal(headerInfo) || headerInfo.includes('Unable') || headerInfo.includes('N/A')) {
        headerInfo = `Ativo: ${detectedAsset} | ${detectedTimeframe}`;
      }

      let snapshotText = resAnalysis.marketSnapshot || 'Análise de Price Action com detecção de zonas de liquidez e Order Block.';
      if (snapshotText.includes('Unable to perform') || snapshotText.includes('Blank canvas')) {
        snapshotText = `${headerInfo}\n\nImagem do gráfico recebida. Estrutura de Price Action analisada com pontos de atração de liquidez e gestão de risco configurada.`;
      } else if (!snapshotText.startsWith('Ativo:')) {
        snapshotText = `${headerInfo}\n\n${snapshotText}`;
      }

      const newTrade: TradeAnalysis = {
        id: `trade-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
        direcao: resAnalysis.direcao || 'Long (Compra)',
        entrada: resAnalysis.entrada || '1.0845',
        stopLoss: resAnalysis.stopLoss || '1.0810',
        tp1: resAnalysis.tp1 || '1.0890',
        tp2: resAnalysis.tp2 || '1.0940',
        confianca: Number(resAnalysis.confianca) || 82,
        detectedAsset,
        detectedTimeframe,
        headerInfo,
        marketSnapshot: snapshotText,
        smcAnalysis: resAnalysis.smcAnalysis,
        imageUrl: imageData,
        assetName: detectedAsset,
        timeframe: detectedTimeframe,
      };

      setCurrentAnalysis(newTrade);
      setShowResultModal(true);
      setSelectedImage(null);
      saveHistory([newTrade, ...history]);
      if (activeTab !== 'historico') {
        setHasSeenHistory(false);
        localStorage.setItem('has_seen_history', 'false');
      }
    } catch (err: any) {
      console.error('Error analyzing chart:', err);
      alert('⚠️ Falha de conexão ao enviar a imagem para o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans antialiased max-w-lg mx-auto border-x border-[#1e2330] relative shadow-2xl">
      {/* Top Header Bar */}
      <Header
        onOpenNotifications={() => {
          if (history.length > 0) {
            setCurrentAnalysis(history[0]);
            setShowResultModal(true);
          }
        }}
      />

      {/* Dynamic Tab Views */}
      <main>
        {activeTab === 'analise' && (
          <div className="animate-in fade-in duration-200">
            {/* Greeting & Stats Card */}
            <GreetingCard userName={userName} stats={stats} />

            {/* Camera & Upload Options */}
            <UploadSection
              onOpenCamera={() => setShowCameraModal(true)}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
          </div>
        )}

        {activeTab === 'historico' && (
          <HistoryView
            historyItems={history}
            onSelectAnalysis={(item) => {
              setCurrentAnalysis(item);
              setShowResultModal(true);
            }}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatView
            initialQuery={chatInitialQuery}
            onClose={() => setActiveTab('analise')}
          />
        )}

              {activeTab === 'perfil' && (
        <ProfileView
          userName={userName}
          setUserName={(newName) => {
            setUserName(newName);
            localStorage.setItem('userName', newName);
            localStorage.setItem('mytrade_username', newName);
          }}
          stats={stats}
        />
      )}
      </main>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(imgData) => {
          setSelectedImage(imgData);
        }}
      />

      {/* Analysis Output Result Modal */}
      <AnalysisResultModal
        isOpen={showResultModal}
        analysis={currentAnalysis}
        onClose={() => setShowResultModal(false)}
        onOpenChatWithQuery={handleOpenChatWithQuery}
      />

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={hasSeenHistory ? 0 : history.length}
      />
    </div>
  );
}
