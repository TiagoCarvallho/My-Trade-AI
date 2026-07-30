import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Paperclip, X, ArrowDown } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatViewProps {
  initialQuery?: string | null;
  onClose?: () => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ initialQuery, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Olá, Tiago! Sou o seu assistente quantitativo especializado em Smart Money Concepts (SMC) e Price Action. Como posso ajudar nas suas operações hoje? Você também pode enviar fotos de gráficos diretamente aqui!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isUp);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    const currentImage = attachedImage;

    if ((!queryText.trim() && !currentImage) || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText || (currentImage ? 'Enviou uma imagem do gráfico para análise:' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: currentImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setAttachedImage(null);
    setIsSending(true);

    try {
      const userApiKey = (localStorage.getItem('user_api_key') || '').trim();

      if (!userApiKey) {
        const warningMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ **Chave API Ausente**: Nenhuma Chave de API do Gemini foi encontrada no seu perfil. Por favor, acesse a aba **Perfil** e salve sua Chave API do Gemini para conversar com o assistente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, warningMsg]);
        setIsSending(false);
        return;
      }

      const response = await fetch('/api/chat-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userApiKey,
        },
        body: JSON.stringify({
          message: queryText,
          image: currentImage,
          apiKey: userApiKey,
        }),
      });

      const data = await response.json();
      const aiMsgText = data.text || 'Ocorreu um problema ao consultar o assistente SMC. Tente novamente.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Desculpe, falha na conexão com o motor de AI. Verifique sua rede e tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const presetQuestions = [
    'Como identificar um Order Block de alta confiabilidade?',
    'Qual o gerenciamento de risco ideal para operantes em SMC?',
    'Como calcular o tamanho da posição com stop loss ajustado?',
    'Qual a diferença entre BOS e CHoCH no tempo gráfico de 15m?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] relative animate-in fade-in duration-200 pb-[120px]">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2330] mb-2 px-4 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              AI Chat Trader Quant & SMC
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">Gemini 3.1 Flash • Leitura Multimodal de Gráficos</p>
          </div>
        </div>

        {/* Scroll to Bottom Header Button */}
        <button
          onClick={scrollToBottom}
          className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-[#131722] border border-transparent hover:border-[#1e2330] transition-colors"
          title="Rolar para o fim das mensagens"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3.5 px-4 pr-3 pb-8 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mt-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                  : 'bg-[#131722] border border-[#1e2330] text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                  <img src={msg.imageUrl} alt="Gráfico enviado" className="w-full max-h-48 object-cover" />
                </div>
              )}
              <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
              <span
                className={`text-[9px] block text-right mt-1.5 font-mono ${
                  msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mt-1 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs p-2 bg-[#131722] rounded-xl border border-[#1e2330] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analisando mensagem e tese técnica...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-[145px] right-6 p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg border border-cyan-300 flex items-center gap-1.5 text-xs font-bold transition-all animate-bounce z-40"
          title="Rolar até o final"
        >
          <ArrowDown className="w-4 h-4" />
          <span className="text-[10px] pr-1">Fim</span>
        </button>
      )}

      {/* Search & Input Form Fixed strictly at the bottom of the page above BottomNav */}
      <div className="fixed bottom-[58px] left-0 right-0 max-w-lg mx-auto bg-[#0d1117] border-t border-[#1e2330] px-4 py-2.5 z-30 shadow-2xl">
        {/* Preset Suggestions */}
        {messages.length < 3 && !attachedImage && (
          <div className="mb-2 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1.5 bg-[#131722] hover:bg-[#181e2b] border border-[#1e2330] text-slate-300 text-[10px] font-medium rounded-xl shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="mb-2 p-2 rounded-xl bg-[#131722] border border-cyan-500/50 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img src={attachedImage} alt="Gráfico anexo" className="w-12 h-10 object-cover rounded-lg border border-[#21262d]" />
              <span className="text-[11px] font-bold text-cyan-300 truncate">Gráfico anexado para o Chat</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2330]"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 bg-[#131722] border border-[#1e2330] rounded-2xl p-2 focus-within:border-cyan-500 transition-colors relative"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-[#1a2130] transition-colors shrink-0"
            title="Anexar foto ou screenshot do gráfico"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachedImage ? 'Adicione uma dúvida sobre o gráfico...' : 'Pesquisar ou perguntar ao AI Chat...'}
              className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none px-1 pr-8"
            />

            {/* Clear typed text 'X' button */}
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-1 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors flex items-center justify-center bg-[#1a2130]"
                title="Apagar texto digitado"
              >
                <X className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && !attachedImage) || isSending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 disabled:opacity-50 hover:opacity-90 transition-opacity active:scale-95 shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

