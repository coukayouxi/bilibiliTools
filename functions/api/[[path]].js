// 处理所有OPTIONS请求，添加CORS头
export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

// 处理所有其他请求，添加CORS头
export const onRequest = async (context) => {
  // 获取请求路径
  const url = new URL(context.request.url);
  const path = url.pathname;
  
  // 如果路径以 /api/user-, /api/video-, /api/live- 等开头，重定向到主页并添加hash
  if (path.startsWith('/api/user-')) {
    const uid = path.substring(10); // 提取 uid
    return Response.redirect(url.origin + '/#user-' + uid, 301);
  } else if (path.startsWith('/api/video-')) {
    const bvid = path.substring(11); // 提取 bvid
    return Response.redirect(url.origin + '/#video-' + bvid, 301);
  } else if (path.startsWith('/api/live-')) {
    const room = path.substring(10); // 提取 room
    return Response.redirect(url.origin + '/#live-' + room, 301);
  } else if (path.startsWith('/api/rank-')) {
    const rid = path.substring(10); // 提取 rid
    return Response.redirect(url.origin + '/#rank-' + rid, 301);
  }
  
  const response = await context.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
};