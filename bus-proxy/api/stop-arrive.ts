export const config = { runtime: 'edge' };

const BASE_URL = 'https://apis.data.go.kr/1613000/ArvlInfoInqireService';

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  searchParams.delete('endpoint');

  if (!endpoint) {
    return new Response(JSON.stringify({ error: 'endpoint required' }), { status: 400 });
  }

  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  try {
    const url = `${BASE_URL}/${endpoint}?serviceKey=${encodeURIComponent(apiKey)}&_type=json&${searchParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Fetch failed', message: String(error) }), { status: 500 });
  }
}