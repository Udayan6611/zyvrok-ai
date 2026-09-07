import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      host: true
    },
    // Server middleware to handle /api/create-order locally during npm run dev
    plugins: [
      {
        name: 'local-razorpay-orders-api',
        configureServer(server) {
          server.middlewares.use('/api/create-order', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : {};
                const keyId = env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
                const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

                if (!keyId || !keySecret) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    error: 'Razorpay Key ID or Secret missing in .env. Please set VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' 
                  }));
                  return;
                }

                const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
                const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                  },
                  body: JSON.stringify({
                    amount: parsed.amount || 19900,
                    currency: parsed.currency || 'INR',
                    receipt: parsed.receipt || `rcpt_${Date.now()}`
                  })
                });

                const data = await razorpayRes.json();
                res.statusCode = razorpayRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          });
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          landing: resolve(__dirname, 'landing_page_responsive/code.html'),
          studio: resolve(__dirname, 'repurpose_studio_responsive/code.html'),
          upgrade: resolve(__dirname, 'upgrade_to_pro_responsive/code.html'),
          login: resolve(__dirname, 'login_sign_up_responsive/code.html'),
          history: resolve(__dirname, 'dashboard_history_responsive/code.html'),
          legal: resolve(__dirname, 'legal.html'),
        }
      }
    }
  };
});
