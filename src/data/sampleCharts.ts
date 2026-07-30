import { SampleChart } from '../types';

// Helper to create synthetic candlestick chart SVG data URLs for instant testing
function createSvgChartUrl(title: string, type: 'bullish' | 'bearish' | 'sweep'): string {
  const candles = type === 'bullish' ? [
    { o: 100, h: 104, l: 98, c: 102, green: true },
    { o: 102, h: 103, l: 97, c: 98, green: false },
    { o: 98, h: 99, l: 92, c: 93, green: false }, // Sweep liquidity low
    { o: 93, h: 105, l: 91, c: 104, green: true }, // Big rejection pin bar / sweep
    { o: 104, h: 110, l: 103, c: 109, green: true },
    { o: 109, h: 115, l: 108, c: 114, green: true },
  ] : type === 'bearish' ? [
    { o: 150, h: 152, l: 148, c: 151, green: true },
    { o: 151, h: 160, l: 150, c: 159, green: true }, // Sweep top high
    { o: 159, h: 160, l: 145, c: 146, green: false }, // Bearish engulfing BOS
    { o: 146, h: 147, l: 140, c: 141, green: false },
    { o: 141, h: 144, l: 138, c: 139, green: false },
  ] : [
    { o: 200, h: 205, l: 198, c: 204, green: true },
    { o: 204, h: 208, l: 201, c: 202, green: false },
    { o: 202, h: 203, l: 188, c: 189, green: false }, // Equal lows liquidity run
    { o: 189, h: 210, l: 185, c: 208, green: true }, // Violent spring / CHoCH
    { o: 208, h: 215, l: 206, c: 214, green: true },
  ];

  const width = 600;
  const height = 350;
  const candleWidth = 40;
  const spacing = 70;
  const startX = 80;

  // Find min/max for scaling
  const allPrices = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allPrices) - 5;
  const maxP = Math.max(...allPrices) + 5;
  const range = maxP - minP;

  const scaleY = (p: number) => height - 50 - ((p - minP) / range) * (height - 100);

  let svgCandles = '';
  candles.forEach((c, i) => {
    const x = startX + i * spacing;
    const yOpen = scaleY(c.o);
    const yClose = scaleY(c.c);
    const yHigh = scaleY(c.h);
    const yLow = scaleY(c.l);

    const bodyY = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
    const color = c.green ? '#22c55e' : '#ef4444';

    svgCandles += `
      <!-- Wick -->
      <line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="2" />
      <!-- Body -->
      <rect x="${x - candleWidth / 2}" y="${bodyY}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" rx="2" />
    `;
  });

  // Grid lines and labels
  const priceStep = (maxP - minP) / 4;
  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const priceVal = (minP + i * priceStep).toFixed(1);
    const y = scaleY(minP + i * priceStep);
    gridLines += `
      <line x1="40" y1="${y}" x2="${width - 60}" y2="${y}" stroke="#1f2937" stroke-width="1" stroke-dasharray="4,4" />
      <text x="${width - 50}" y="${y + 4}" fill="#6b7280" font-size="11" font-family="sans-serif">${priceVal}</text>
    `;
  }

  // SMC Annotations
  let smcOverlay = '';
  if (type === 'bullish' || type === 'sweep') {
    const sweepY = scaleY(minP + 2);
    smcOverlay = `
      <line x1="60" y1="${sweepY}" x2="${width - 80}" y2="${sweepY}" stroke="#eab308" stroke-width="1.5" stroke-dasharray="6,3" />
      <text x="70" y="${sweepY - 8}" fill="#eab308" font-size="12" font-weight="bold" font-family="sans-serif">⚡ BUY-SIDE / SELL-SIDE LIQUIDITY SWEEP</text>
      <rect x="260" y="${scaleY(105)}" width="110" height="35" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" stroke-width="1.5" rx="4" />
      <text x="270" y="${scaleY(105) + 20}" fill="#4ade80" font-size="11" font-weight="bold" font-family="sans-serif">BULLISH OB + FVG</text>
    `;
  } else {
    const obY = scaleY(158);
    smcOverlay = `
      <rect x="120" y="${obY}" width="120" height="40" fill="rgba(239, 68, 68, 0.18)" stroke="#ef4444" stroke-width="1.5" rx="4" />
      <text x="130" y="${obY + 24}" fill="#f87171" font-size="11" font-weight="bold" font-family="sans-serif">BEARISH OB (1h)</text>
      <line x1="180" y1="${scaleY(146)}" x2="${width - 80}" y2="${scaleY(146)}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="${width - 150}" y="${scaleY(146) - 6}" fill="#f87171" font-size="11" font-family="sans-serif">BOS (Break of Structure)</text>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #0b0e14;">
      <defs>
        <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#0b0e14" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGlow)" />
      ${gridLines}
      ${svgCandles}
      ${smcOverlay}
      <!-- Watermark Header -->
      <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif">${title}</text>
      <text x="${width - 140}" y="30" fill="#9ca3af" font-size="11" font-family="sans-serif">My Trade AI SMC v3.6</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_CHARTS: SampleChart[] = [
  {
    id: 'btc-15m-sweep',
    title: 'BTC/USDT 15m - Sweep de Liquidez & Rejeição',
    asset: 'BTC/USDT',
    timeframe: '15m',
    description: 'Varredura da liquidez dos fundos com rejeição forte em V-shape e Order Block comprador.',
    dataUrl: createSvgChartUrl('BTC/USDT - 15m SMC Liquidity Sweep', 'sweep'),
  },
  {
    id: 'eurusd-1h-ob',
    title: 'EUR/USD 1h - Bearish Order Block & CHoCH',
    asset: 'EUR/USD',
    timeframe: '1h',
    description: 'Mitigação em Order Block institucional de venda com quebra de estrutura (CHoCH).',
    dataUrl: createSvgChartUrl('EUR/USD - 1h Bearish OB & CHoCH', 'bearish'),
  },
  {
    id: 'win-5m-fvg',
    title: 'WIN (Mini Índice B3) 5m - FVG & Expansion',
    asset: 'WIN1!',
    timeframe: '5m',
    description: 'Preenchimento de Fair Value Gap (Imbalance) com continuação da tendência compradora.',
    dataUrl: createSvgChartUrl('WIN1! Mini Índice - 5m Bullish FVG', 'bullish'),
  },
  {
    id: 'xauusd-15m-grab',
    title: 'XAU/USD (Ouro) 15m - Premium Zone Rejection',
    asset: 'XAU/USD',
    timeframe: '15m',
    description: 'Toque na zona de suprimento institucional (Premium Zone) com acumulação prévia.',
    dataUrl: createSvgChartUrl('XAU/USD Ouro - 15m Supply Zone', 'bearish'),
  },
];
