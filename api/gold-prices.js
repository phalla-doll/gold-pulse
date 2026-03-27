export const config = { runtime: 'edge' };

const rangeMap = {
  '1D': { range: '1d', interval: '5m' },
  '7D': { range: '7d', interval: '1h' },
  '1M': { range: '1mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '1M';
  const yahooParams = rangeMap[range] || rangeMap['1M'];

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=${yahooParams.range}&interval=${yahooParams.interval}`;

  try {
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoldPulse/1.0)',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Yahoo Finance API Error: ${response.status}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Yahoo Finance' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch gold prices: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
