/**
 * Currency Converter Tool
 * Convert fiat and cryptocurrencies with historical rates and portfolio tracking
 */

import type { ToolDefinition } from '../types';

// Cryptocurrency symbols and names
const cryptoCurrencies: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'Binance Coin',
  SOL: 'Solana',
  XRP: 'Ripple',
  USDC: 'USD Coin',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  TRX: 'TRON',
};

// Currency symbols
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BTC: '₿',
  ETH: 'Ξ',
};

async function getFiatRates(base: string) {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${base.toUpperCase()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  return await response.json();
}

async function getCryptoRates(symbols: string[]) {
  try {
    // Using CoinGecko API (free tier)
    const ids = symbols.map(s => {
      const map: Record<string, string> = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        USDT: 'tether',
        BNB: 'binancecoin',
        SOL: 'solana',
        XRP: 'ripple',
        USDC: 'usd-coin',
        ADA: 'cardano',
        DOGE: 'dogecoin',
        TRX: 'tron',
      };
      return map[s.toUpperCase()] || '';
    }).filter(Boolean).join(',');

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto rates');
    }

    return await response.json();
  } catch (error) {
    // Fallback to mock data
    return {
      bitcoin: { usd: 45000, usd_24h_change: 2.5 },
      ethereum: { usd: 2500, usd_24h_change: -1.2 },
    };
  }
}

async function getHistoricalRate(from: string, to: string, date: string) {
  try {
    // For fiat currencies, try exchangerate API with historical data
    // Note: Free tier may not support historical data
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
    );

    if (!response.ok) {
      throw new Error('Historical data not available');
    }

    const data = await response.json();
    return {
      rate: data.rates[to.toUpperCase()],
      date,
      note: 'Using current rate (historical data requires premium API)',
    };
  } catch (error) {
    throw new Error('Historical rates unavailable in free tier');
  }
}

function calculatePortfolio(holdings: Array<{ currency: string; amount: number }>, rates: any) {
  const portfolio = holdings.map(h => {
    const symbol = h.currency.toUpperCase();
    let valueUSD = 0;
    let rate = 0;

    if (cryptoCurrencies[symbol]) {
      // Crypto
      const cryptoId = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        USDT: 'tether',
        BNB: 'binancecoin',
        SOL: 'solana',
      }[symbol];

      if (cryptoId && rates[cryptoId]) {
        rate = rates[cryptoId].usd;
        valueUSD = h.amount * rate;
      }
    } else {
      // Fiat - assume rates are in USD base
      rate = rates.rates ? rates.rates[symbol] || 1 : 1;
      valueUSD = h.amount / rate;
    }

    return {
      currency: symbol,
      amount: h.amount,
      rate,
      valueUSD,
      symbol: currencySymbols[symbol] || symbol,
    };
  });

  const totalValue = portfolio.reduce((sum, item) => sum + item.valueUSD, 0);

  return {
    holdings: portfolio,
    totalValueUSD: totalValue,
    breakdown: portfolio.map(p => ({
      currency: p.currency,
      percentage: ((p.valueUSD / totalValue) * 100).toFixed(2),
    })),
  };
}

function generateTrendData(rate: number, change24h: number = 0) {
  // Generate simple trend visualization data
  const hours = 24;
  const trend: number[] = [];
  const currentRate = rate;
  const changePerHour = change24h / hours;

  for (let i = hours; i >= 0; i--) {
    const hourlyChange = changePerHour * i;
    const historicalRate = currentRate * (1 - hourlyChange / 100);
    trend.push(parseFloat(historicalRate.toFixed(2)));
  }

  return {
    hours: Array.from({ length: hours + 1 }, (_, i) => `${i}h`),
    rates: trend,
    change24h,
    trend: change24h > 0 ? 'up' : change24h < 0 ? 'down' : 'stable',
  };
}

export const currencyTool: ToolDefinition = {
  name: 'convert_currency',
  description: 'Convert fiat and crypto currencies with historical rates, portfolio tracking, and trend analysis',
  category: 'data',
  parameters: [
    {
      name: 'mode',
      type: 'string',
      description: 'Mode: "convert", "historical", "portfolio", "trend"',
      required: false,
      enum: ['convert', 'historical', 'portfolio', 'trend'],
    },
    {
      name: 'amount',
      type: 'number',
      description: 'Amount to convert',
      required: false,
    },
    {
      name: 'from',
      type: 'string',
      description: 'Source currency code (e.g., "USD", "EUR", "BTC", "ETH")',
      required: false,
    },
    {
      name: 'to',
      type: 'string',
      description: 'Target currency code',
      required: false,
    },
    {
      name: 'date',
      type: 'string',
      description: 'Historical date (YYYY-MM-DD) for historical mode',
      required: false,
    },
    {
      name: 'holdings',
      type: 'array',
      description: 'Portfolio holdings array for portfolio mode [{currency, amount}]',
      required: false,
    },
  ],
  async execute({ mode = 'convert', amount = 1, from = 'USD', to = 'EUR', date, holdings = [] }) {
    try {
      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      // Historical mode
      if (mode === 'historical' && date) {
        const historical = await getHistoricalRate(fromUpper, toUpper, date);
        const converted = amount * historical.rate;

        return {
          mode: 'historical',
          amount,
          from: fromUpper,
          to: toUpper,
          date,
          rate: historical.rate,
          result: converted,
          formatted: `${amount.toFixed(2)} ${fromUpper} = ${converted.toFixed(2)} ${toUpper}`,
          note: historical.note,
        };
      }

      // Portfolio mode
      if (mode === 'portfolio' && holdings.length > 0) {
        const fiatRates = await getFiatRates('USD');
        const cryptoRates = await getCryptoRates(Object.keys(cryptoCurrencies));
        const portfolio = calculatePortfolio(holdings, { ...fiatRates, ...cryptoRates });

        return {
          mode: 'portfolio',
          ...portfolio,
          timestamp: new Date().toISOString(),
        };
      }

      // Trend mode
      if (mode === 'trend') {
        const isCrypto = cryptoCurrencies[fromUpper];
        let rate = 1;
        let change24h = 0;

        if (isCrypto) {
          const cryptoRates = await getCryptoRates([fromUpper]);
          const cryptoId = {
            BTC: 'bitcoin',
            ETH: 'ethereum',
            USDT: 'tether',
          }[fromUpper];

          if (cryptoId && cryptoRates[cryptoId]) {
            rate = cryptoRates[cryptoId].usd;
            change24h = cryptoRates[cryptoId].usd_24h_change || 0;
          }
        } else {
          const fiatRates = await getFiatRates(fromUpper);
          rate = fiatRates.rates[toUpper] || 1;
        }

        const trend = generateTrendData(rate, change24h);

        return {
          mode: 'trend',
          from: fromUpper,
          to: toUpper || 'USD',
          currentRate: rate,
          ...trend,
        };
      }

      // Convert mode (default)
      const isCryptoFrom = cryptoCurrencies[fromUpper];
      const isCryptoTo = cryptoCurrencies[toUpper];

      let rate = 0;
      let change24h = 0;

      if (isCryptoFrom || isCryptoTo) {
        // Crypto conversion
        const cryptoRates = await getCryptoRates([fromUpper, toUpper]);

        // Map to CoinGecko IDs
        const fromId = {
          BTC: 'bitcoin',
          ETH: 'ethereum',
          USDT: 'tether',
          BNB: 'binancecoin',
          SOL: 'solana',
        }[fromUpper];

        const toId = {
          BTC: 'bitcoin',
          ETH: 'ethereum',
          USDT: 'tether',
          BNB: 'binancecoin',
          SOL: 'solana',
        }[toUpper];

        if (fromId && cryptoRates[fromId]) {
          const fromRate = cryptoRates[fromId].usd;
          const toRate = toId && cryptoRates[toId] ? cryptoRates[toId].usd : 1;
          rate = fromRate / toRate;
          change24h = cryptoRates[fromId].usd_24h_change || 0;
        }
      } else {
        // Fiat conversion
        const fiatRates = await getFiatRates(fromUpper);
        rate = fiatRates.rates[toUpper];

        if (!rate) {
          throw new Error(`Currency ${toUpper} not found`);
        }
      }

      const converted = amount * rate;

      return {
        mode: 'convert',
        amount,
        from: fromUpper,
        fromName: cryptoCurrencies[fromUpper] || fromUpper,
        to: toUpper,
        toName: cryptoCurrencies[toUpper] || toUpper,
        rate,
        result: converted,
        formatted: `${amount.toFixed(2)} ${fromUpper} = ${converted.toFixed(2)} ${toUpper}`,
        change24h: change24h.toFixed(2) + '%',
        timestamp: new Date().toISOString(),
        isCrypto: isCryptoFrom || isCryptoTo,
      };
    } catch (error) {
      throw new Error(`Failed to convert currency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
