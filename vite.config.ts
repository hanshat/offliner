import { PluginOption, defineConfig } from 'vite'
import {
  PluginContext,
  NormalizedOutputOptions,
  OutputBundle,
  Plugin,
} from 'rollup'
import path from 'path'
import fs from 'fs'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({ devTarget: 'esnext' }),
    serviceWorkerPlugin({
      filename: 'service-worker.ts',
    }),
    addAssetsToSw(),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})

function addAssetsToSw(): Plugin {
  return {
    name: 'add-assets-to-sw-for-caching',

    writeBundle(
      this: PluginContext,
      options: NormalizedOutputOptions,
      bundle: OutputBundle
    ) {
      const swPath = path.join(options.dir!, 'service-worker.js')
      const assetFilesNames = Object.keys(bundle)
        .filter((key: string) => key.startsWith('assets'))
        .map((asset) => `"/${asset}"`)

      const data = fs.readFileSync(swPath, {
        encoding: 'utf8',
      })

      const nData = data.replace(
        /.__DYNAMIC_ASSETS__./,
        `${assetFilesNames.join(',')}`
      )

      fs.writeFileSync(swPath, nData)
    },
  }
}

// from https://github.com/gautemo/vite-plugin-service-worker/tree/main
function serviceWorkerPlugin(options: { filename: string }): PluginOption {
  const name = 'vite-plugin-service-worker'
  const virtualModuleId = `virtual:${name}`
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  let isBuild = false
  return {
    name,
    config(_, { command }) {
      isBuild = command === 'build'
      return {
        build: {
          rollupOptions: {
            input: {
              main: 'index.html',
              'service-worker': options.filename,
            },
            output: {
              entryFileNames: ({ facadeModuleId }) => {
                if (facadeModuleId?.includes(options.filename)) {
                  return `[name].js`
                }
                return 'assets/[name].[hash].js'
              },
            },
          },
        },
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        let filename = isBuild
          ? options.filename.replace('.ts', '.js')
          : options.filename
        if (!filename.startsWith('/')) filename = `/${filename}`
        return `export const serviceWorkerFile = '${filename}'`
      }
    },
  }
}
