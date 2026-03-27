export const config = {
  runtime: 'edge',
};

const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const GOLD_SYMBOL = 'GC=F';

const rangeMap: Record<string, { range: string; interval: string }> = {
  '1D':  { range: '1d',  interval: '5m' },
  '7D':  { range: '7d',  interval: '1h' },
  '1M':  { range: '1mo', interval: '1d' },
  '6M':  { range: '6mo', interval: '1d' },
  '1Y':  { range: '1y',  interval: '1d' },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '1M';
  const yahooParams = rangeMap[range] || rangeMap['1M'];

  const yahooUrl = `${YAHOO_FINANCE_BASE_URL}/${GOLD_SYMBOL}?range=${yahooParams.range}&interval=${yahooParams.interval}`;

  try {
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoldPulse/1.0)',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Yahoo Finance API Error: ${response.status}` }),
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Yahoo Finance' }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Failed to fetch gold prices:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch gold prices' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
