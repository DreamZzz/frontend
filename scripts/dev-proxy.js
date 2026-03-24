const http = require('http');

const targetHost = process.env.DEV_PROXY_TARGET_HOST || '101.37.209.236';
const targetPort = Number(process.env.DEV_PROXY_TARGET_PORT || 80);
const localPort = Number(process.env.DEV_PROXY_LOCAL_PORT || 18080);

const server = http.createServer((req, res) => {
  const proxyReq = http.request(
    {
      hostname: targetHost,
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetHost,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    console.error(`[dev-proxy] ${req.method} ${req.url} -> ${error.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(
      JSON.stringify({
        error: 'proxy_error',
        message: error.message,
        target: `http://${targetHost}:${targetPort}`,
      })
    );
  });

  req.pipe(proxyReq);
});

server.listen(localPort, '127.0.0.1', () => {
  console.log(
    `[dev-proxy] listening on http://127.0.0.1:${localPort} -> http://${targetHost}:${targetPort}`
  );
});
