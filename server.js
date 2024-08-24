// Sentry integration. this should come first
import './instrument.js'

import express from 'express'
import fs from 'fs'
import * as Sentry from '@sentry/node'

import VideoRoutes from './backend/routes/video.routes.js'
import path from 'path'
import { logger } from './backend/utils/logger.js'

var app = express()
const isProd = process.env.NODE_ENV === 'production'
const __dirname = new URL('.', import.meta.url).pathname

const indexPath = 'index.html'
const root = process.cwd()

let vite

if (!isProd) {
  const viteImport = await import('vite')

  vite = await viteImport.createServer({
    root,
    clearScreen: false,
    logLevel: 'info',
    server: {
      host: true,
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: 'custom',
  })

  app.use(vite.middlewares)
}

app.use('/api', VideoRoutes)

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
} else {
  app.use('*', async (req, res) => {
    res.set({ 'Content-Type': 'text/html' })

    try {
      const url = req.originalUrl
      let template = fs.readFileSync(indexPath, 'utf8')
      template = await vite.transformIndexHtml(url, template)

      res.status(200).end(template)
    } catch (e) {
      logger.error(e)
      res.status(500).end(e)
    }
  })
}

Sentry.setupExpressErrorHandler(app)

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
})

process.on('SIGTERM', handleServerShutdown)
process.on('SIGINT', handleServerShutdown)
process.on('uncaughtExceptionMonitor', (err) =>
  handleUncaughtError(err, 'uncaughtExceptionMonitor')
)
process.on('unhandledRejection', (reason) =>
  handleUncaughtError(reason, 'unhandledRejection')
)

function handleServerShutdown() {
  logger.info('Server is closing')

  server.close(() => {
    logger.info('Closed out remaining connections')
    process.exit(0)
  })

  // Force close remaining connections
  setTimeout(() => {
    server.closeAllConnections()
    process.exit(1)
  }, 3000)
}

function handleUncaughtError(error, type) {
  logger.child({ type }).error(error)
  Sentry.captureException(error)

  if (type !== 'uncaughtExceptionMonitor') process.exit(1)
}
