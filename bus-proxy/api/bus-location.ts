export const config = { runtime: 'edge' };

const BASE_URL = 'https://apis.data.go.kr/1613000/BusLcInfoInqireService';

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  searchParams.delete('endpoint');

  if (!endpoint) {
    return new Response(JSON.stringify({ error: 'endpoint required' }), { status: 400 });
  }

  const apiKey = process.env.PUBLIC_API_PRIVATE_KEY;
  searchParams.set('serviceKey', apiKey!);
  searchParams.set('_type', 'json');

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}?${searchParams.toString()}`);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 500 });
  }
}