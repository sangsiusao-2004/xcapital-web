export function analyzeMarket(
  goldPrice,
  timeframe
) {

  // GIÁ HIỆN TẠI
  const price =
    parseFloat(goldPrice);

  // ĐIỂM BUY / SELL
  let buyScore = 0;
  let sellScore = 0;

// =========================
// EMA ENGINE
// =========================

// EMA giả lập theo giá

const emaBullish =
  price >= 4520;

if (emaBullish) {

  buyScore += 20;

} else {

  sellScore += 20;
}

// =========================
// RSI ENGINE
// =========================

// RSI giả lập theo giá

const rsi =
  35 + Math.floor(price % 30);

if (rsi > 55) {

  buyScore += 15;
}

if (rsi < 45) {

  sellScore += 15;
}

// =========================
// TREND ENGINE
// =========================

// Trend giả lập theo giá

const bullishTrend =
  price > 4525;

if (bullishTrend) {

  buyScore += 25;

} else {

  sellScore += 25;
}

// =========================
// BREAKOUT ENGINE
// =========================

// breakout giả lập

const breakout =
  price % 5 === 0;

if (breakout) {

  if (
    trendDirection(
      buyScore,
      sellScore
    ) === "BUY"
  ) {

    buyScore += 10;

  } else {

    sellScore += 10;
  }
}

  // =========================
  // FINAL TREND
  // =========================

  const trend =
    buyScore > sellScore
      ? "BUY"
      : "SELL";

  // =========================
  // CONFIDENCE
  // =========================

  const confidence =
    Math.min(
        trend === "BUY"
        ? buyScore
        : sellScore,
        95
    );

  // =========================
  // ENTRY
  // =========================

  const entry1 =
    trend === "BUY"
        ? price - 2
        : price + 2;

  const entry2 =
    trend === "BUY"
        ? price + 1
        : price - 1;

  // =========================
  // STOP LOSS
  // =========================

  const sl =
    trend === "BUY"
      ? price - 8
      : price + 8;

  // =========================
  // TAKE PROFIT
  // =========================

  const tp1 =
    trend === "BUY"
      ? price + 8
      : price - 8;

  const tp2 =
    trend === "BUY"
      ? price + 15
      : price - 15;

  const tp3 =
    trend === "BUY"
      ? price + 25
      : price - 25;

  // =========================
  // RESPONSE
  // =========================

return `
╔════════════════════════╗
        XAUUSD • ${timeframe}
╚════════════════════════╝
${trend === "BUY"
? "🟢 XU HƯỚNG: BUY"
: "🔴 XU HƯỚNG: SELL"}
━━━━━━━━━━━━━━━━━━
🎯 ĐỘ TIN CẬY  [ ${confidence}% ]
━━━━━━━━━━━━━━━━━━
📍 VÙNG ENTRY: [ ${entry2.toFixed(1)} → ${entry1.toFixed(1)} ]
🛑 STOP LOSS: [ ${sl.toFixed(1)} ]
━━━━━━━━━━━━━━━━━━
🎯 TAKE PROFIT
TP1: [ ${tp1.toFixed(1)} ]
TP2: [ ${tp2.toFixed(1)} ]
TP3: [ ${tp3.toFixed(1)} ]
`;
}

// HELPER
function trendDirection(
  buyScore,
  sellScore
) {

  return buyScore > sellScore
    ? "BUY"
    : "SELL";
}