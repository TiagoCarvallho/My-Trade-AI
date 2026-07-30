import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for external tools like PWABuilder
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));

// Helper to initialize Gemini client strictly using the Profile API Key
function getGeminiAI(customApiKey?: string) {
  const apiKey = customApiKey ? customApiKey.trim() : '';
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
  });
}

// Fallback list of Gemini models for generateContent
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
];

async function generateWithGeminiFallback(ai: GoogleGenAI, payload: any) {
  let lastError: any = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const res = await ai.models.generateContent({
        ...payload,
        model: modelName,
      });
      if (res && res.text) {
        return res;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} call warning:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('Nenhum modelo Gemini respondeu.');
}

// System prompt for surgical precision chart OCR & Smart Money Concepts analysis:
const TRADING_ANALYSIS_PROMPT = `
Atue como um analista quantitativo sênior e mestre especialista em Price Action, Smart Money Concepts (SMC), ICT (Inner Circle Trader) e leitura cirúrgica de OCR de gráficos financeiros (TradingView, ProfitChart, Tryd, MetaTrader, Binance).

Sua missão é realizar uma ANÁLISE CIRÚRGICA DE ALTÍSSIMA PRECISÃO sobre a imagem do gráfico fornecida, executando as seguintes etapas rigorosas:

1. LEITURA CIRÚRGICA DE OCR E DADOS DO ATIVO:
   - Inspecione a régua vertical de preços (eixo Y) e o topo/cabeçalho da imagem para calibrar a escala real de preço.
   - Identifique com exatidão o TICKER do ativo (ex: WINQ26, WINFUT, WDOP26, WDOFUT, PETR4, VALE3, EURUSD, GBPUSD, XAUUSD, BTCUSDT, US500, NQ1!). Se o ticker não estiver explícito, determine o ticker mais compatível com base no formato e escala do preço.
   - Identifique o TEMPO GRÁFICO (ex: 1Min, 2Min, 5Min, 10Min, 15Min, 30Min, 1h, 4h, Diário).
   - Monte a linha obrigatória de cabeçalho "headerInfo": "Ativo: [TICKER] | [TEMPO_GRÁFICO]".

2. MAPEAMENTO INSTITUCIONAL & ESTRUTURA SMC/ICT:
   - Estrutura de Mercado: Mapeie a tendência atual (Alta, Baixa ou Lateral) com identificação clara de BOS (Break of Structure) e CHoCH (Change of Character).
   - Piscinas de Liquidez (Liquidity Sweeps): Localize varreduras recentes de Sell-Side Liquidity (SSL) ou Buy-Side Liquidity (BSL), bem como topos/fundos duplos (Equal Highs / Equal Lows).
   - Zonas de Reação (Supply & Demand / Order Blocks): Identifique Order Blocks (OB) válidos e não mitigados responsáveis pelo movimento expressivo.
   - Ineficiências de Preço (Fair Value Gap / FVG): Identifique desbalanços de volume (FVGs/Imbalances) pendentes de preenchimento.

3. PLANO OPERACIONAL CIRÚRGICO:
   - Direção: Defina rigorosamente entre "Long (Compra)" ou "Short (Venda)".
   - Preço de Entrada: Especifique o valor exato ou zona cirúrgica de entrada (ex: reteste de OB/FVG ou gatilho em CHoCH).
   - Stop Loss: Fixe o preço de invalidação no nível técnico ideal (atrás da estrutura/OB com folga para spread).
   - Take Profit 1 (TP1): Primeiro alvo técnico na zona de liquidez local mais próxima.
   - Take Profit 2 (TP2): Alvo estendido na principal ineficiência ou piscina de liquidez majoritária.
   - Confiança (%): Atribua uma nota de 50% a 98% baseada no grau de confluência dos fatores técnicos.
   - Risco:Retorno: Calcule a proporção exata R:R (ex: 1:3.5).

4. SÍNTESE DO SNAPSHOT DO MERCADO (marketSnapshot):
   - A PRIMEIRA LINHA do campo "marketSnapshot" DEVE SER OBRIGATORIAMENTE: "Ativo: [TICKER] | [TEMPO_GRÁFICO]".
   - Em seguida, apresente uma explicação clara, técnica e cirúrgica fundamentando a operação.

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:

{
  "detectedAsset": "Ticker do ativo (ex: WINQ26)",
  "detectedTimeframe": "Tempo gráfico (ex: 5Min)",
  "headerInfo": "Ativo: WINQ26 | 5Min",
  "direcao": "Long (Compra)" ou "Short (Venda)",
  "entrada": "Preço exato ou zona de entrada",
  "stopLoss": "Preço de Stop Loss",
  "tp1": "Preço do Alvo 1 (TP1)",
  "tp2": "Preço do Alvo 2 (TP2)",
  "confianca": 88,
  "marketSnapshot": "Ativo: WINQ26 | 5Min\\n\\nParecer cirúrgico detalhado explicando a confluência de Price Action, SMC, estrutura e metas...",
  "smcAnalysis": {
    "liquiditySweep": "Varredura de liquidez identificada",
    "orderBlock": "Localização do Order Block e estado",
    "fairValueGap": "Presença e nível do Fair Value Gap (FVG)",
    "structureShift": "Sinal de BOS ou CHoCH confirmado",
    "riskReward": "Proporção Risco:Retorno (ex: 1:3.5)"
  }
}

Retorne APENAS o JSON válido sem markdown ou textos fora do objeto JSON.
`;

// Endpoint: Test User API Key
app.post('/api/test-key', async (req, res) => {
  try {
    const { apiKey: bodyApiKey } = req.body;
    const headerApiKey = req.headers['x-api-key'] as string;
    const userApiKey = (bodyApiKey || headerApiKey || '').trim();

    if (!userApiKey) {
      return res.status(400).json({ success: false, error: 'Por favor, informe uma chave API para testar.' });
    }

    const ai = getGeminiAI(userApiKey);
    if (!ai) {
      return res.status(400).json({ success: false, error: 'Chave API em formato inválido.' });
    }

    const response = await generateWithGeminiFallback(ai, {
      contents: 'Responda apenas: OK',
    });

    if (response.text) {
      return res.json({ success: true, message: 'Chave API do Gemini validada com sucesso! O sistema usará essa chave em todas as análises e no chat.' });
    }

    return res.status(400).json({ success: false, error: 'Não foi possível validar a resposta da API.' });
  } catch (error: any) {
    console.warn('API key test error:', error);
    return res.status(400).json({
      success: false,
      error: `Falha na validação da Chave API do Gemini: ${error.message || 'Chave inválida ou sem permissões'}`,
    });
  }
});

// Endpoint: Analyze Chart Image
app.post('/api/analyze-chart', async (req, res) => {
  try {
    const { image, asset, timeframe, userNote, apiKey: bodyApiKey } = req.body;
    const headerApiKey = req.headers['x-api-key'] as string;
    const userApiKey = (bodyApiKey || headerApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!userApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Chave API do Gemini não configurada. Por favor, acesse a aba Perfil e salve sua Chave API do Gemini.',
      });
    }

    if (!image) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada para análise.' });
    }

    const ai = getGeminiAI(userApiKey);
    if (!ai) {
      return res.status(400).json({ error: 'Chave API do perfil inválida ou vazia.' });
    }

    // Execute real Gemini AI analysis with the profile key
    try {
      let mimeType = 'image/png';
      let base64Data = image;

      if (image.includes(';base64,')) {
        const parts = image.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = parts[1];
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const textPart = {
        text: `${TRADING_ANALYSIS_PROMPT}\n\nAtivo: ${asset || 'Não especificado'}\nTimeframe: ${timeframe || 'Não especificado'}\nObservação Adicional: ${userNote || 'Nenhuma'}`,
      };

      const response = await generateWithGeminiFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [imagePart, textPart],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText) {
        let cleanJson = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const parsedJSON = JSON.parse(cleanJson);
        return res.json({
          success: true,
          analysis: parsedJSON,
          source: 'gemini-ai',
        });
      }

      return res.status(500).json({ error: 'A API do Gemini não retornou resposta.' });
    } catch (geminiErr: any) {
      console.error('Gemini API call error:', geminiErr);
      return res.status(400).json({
        error: `Falha na chamada do Gemini: ${geminiErr.message || 'Verifique sua Chave API do perfil.'}`,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/analyze-chart:', error);
    res.status(500).json({ error: 'Falha ao processar análise do gráfico.', details: error.message });
  }
});

// Endpoint: Trading AI Chat
app.post('/api/chat-trade', async (req, res) => {
  try {
    const { message, image, history, apiKey: bodyApiKey } = req.body;
    const headerApiKey = req.headers['x-api-key'] as string;
    const userApiKey = (bodyApiKey || headerApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!userApiKey) {
      return res.json({
        success: false,
        text: '⚠️ **Chave API Ausente**: Para utilizar o Chat de Inteligência Artificial, insira sua Chave API do Gemini na aba **Perfil** e clique em **Salvar Chave API**.',
      });
    }

    const ai = getGeminiAI(userApiKey);
    if (!ai) {
      return res.json({
        success: false,
        text: '⚠️ **Chave API Inválida**: Verifique a chave de API cadastrada na aba Perfil e tente novamente.',
      });
    }

    try {
      if (image) {
        let mimeType = 'image/png';
        let base64Data = image;
        if (image.includes(';base64,')) {
          const parts = image.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?);/);
          if (mimeMatch) mimeType = mimeMatch[1];
          base64Data = parts[1];
        }

        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };

        const textPart = {
          text: `Atue como um analista quantitativo sênior e especialista em Price Action, Smart Money Concepts (SMC) e leitura OCR de gráficos.
Examine atentamente a imagem do gráfico fornecido.
Faça a leitura exata do Ativo e Tempo Gráfico visíveis no cabeçalho.
Responda diretamente ao usuário fornecendo o Ativo, Tempo Gráfico, Análise de Direção (Long/Short), Entrada, Stop Loss, Alvos (TP1, TP2) e Leitura da Estrutura de Mercado.

Pergunta/Observação do Usuário: ${message || 'Analise este gráfico em detalhes identificando o ativo, tempo gráfico e plano operacional SMC.'}`,
        };

        const response = await generateWithGeminiFallback(ai, {
          contents: [
            {
              role: 'user',
              parts: [imagePart, textPart],
            },
          ],
        });

        if (response.text) {
          return res.json({ success: true, text: response.text });
        }
      } else {
        const systemPrompt = `Você é um analista quantitativo sênior de trading em mercados financeiros (Crypto, Forex, B3, Ações).
Especialista em Smart Money Concepts (SMC), Price Action, Gerenciamento de Risco (R:R, Position Sizing) e Psicologia de Trading.
Responda em português, de forma direta, técnica, educacional e precisa.
Sempre enfatize gerenciamento de risco rigoroso e invalidação técnica.`;

        const response = await generateWithGeminiFallback(ai, {
          contents: `${systemPrompt}\n\nPergunta do Usuário: ${message || 'Como posso operar SMC?'}`,
        });

        if (response.text) {
          return res.json({ success: true, text: response.text });
        }
      }

      return res.json({
        success: false,
        text: 'Não foi possível obter resposta da API do Gemini. Verifique sua chave no Perfil.',
      });
    } catch (err: any) {
      console.warn('Gemini chat error:', err);
      return res.json({
        success: false,
        text: `⚠️ **Erro no Gemini**: ${err.message || 'Falha ao comunicar com a API do Gemini. Verifique sua chave de perfil.'}`,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no assistente de chat.', details: error.message });
  }
});

// PWA Manifest and Service Worker explicit endpoints for PWABuilder
app.get(['/manifest.json', '/site.webmanifest', '/manifest.webmanifest'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  
  const pubPath = path.join(process.cwd(), 'public', 'manifest.json');
  const distPath = path.join(process.cwd(), 'dist', 'manifest.json');
  const targetPath = fs.existsSync(pubPath) ? pubPath : (fs.existsSync(distPath) ? distPath : null);
  
  if (targetPath) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      return res.type('application/manifest+json').send(content);
    } catch (e) {
      return res.sendFile(targetPath);
    }
  }
  return res.status(404).json({ error: 'Manifest file not found' });
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const pubPath = path.join(process.cwd(), 'public', 'sw.js');
  const distPath = path.join(process.cwd(), 'dist', 'sw.js');
  if (fs.existsSync(pubPath)) {
    return res.sendFile(pubPath);
  } else if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  return res.status(404).send('// Service worker not found');
});

// Express static middleware with CORS enabled for all assets
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Vite / Static setup
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath, {
        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
      }));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server My Trade AI - Pro running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
