import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves the Vercel functions in /api during local dev, so `npm run dev`
// exposes the same /api/* routes as the deployed app.
function apiRoutes() {
  const routes = {
    '/api/salesforce/connection': () => import('./api/salesforce/connection.js'),
    '/api/salesforce/query': () => import('./api/salesforce/query.js'),
  }
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url.split('?')[0]
        const loader = routes[pathname]
        if (!loader) return next()
        try {
          const { default: handler } = await loader()
          await handler(req, res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (no VITE_ prefix filter) into process.env for the
  // server-side API handlers. Vite still only exposes VITE_* to the client.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (key.startsWith('SF_') && process.env[key] === undefined) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [react(), apiRoutes()],
    server: {
      port: Number(process.env.PORT) || 5173,
    },
  }
})
