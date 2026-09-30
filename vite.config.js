import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'client-logger',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/__log' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              console.log(body);
              res.end('ok');
            });
            return;
          }
          next();
        });
      }
    }
  ]
});
