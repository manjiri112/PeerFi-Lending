const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8545',
      changeOrigin: true,
    })
  );

  // Add CSP headers
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' http://127.0.0.1:8545 ws://127.0.0.1:8545; style-src 'self' 'unsafe-inline';"
    );
    next();
  });
};
