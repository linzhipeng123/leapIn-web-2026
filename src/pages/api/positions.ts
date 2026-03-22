import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const API_CONFIG = {
    baseUrl: 'https://app.unfolds.ai/company/api/v1/company/client',
    token: 'AHIJRH',
    perPage: 5,
    currentPage: 1
  };

  try {
    const url = `${API_CONFIG.baseUrl}/getJobList?token=${API_CONFIG.token}&perPage=${API_CONFIG.perPage}&currentPage=${API_CONFIG.currentPage}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 缓存5分钟
      }
    });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    
    return new Response(JSON.stringify({ 
      code: 500, 
      message: 'Failed to fetch positions',
      data: { list: [] }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
