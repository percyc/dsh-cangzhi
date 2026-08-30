import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dshSource = process.env.DSH_SOURCE
if (dshSource === undefined || dshSource.length === 0) {
  throw new Error('Set DSH_SOURCE to the local deepseek-harness checkout before building')
}

const presetUrl = pathToFileURL(resolve(dshSource, 'packages/client/tsdown.client.ts')).href
const { clientBundle } = await import(presetUrl)
const packageIdentity = '@deepseek-ai/dsh-client-ui-cordis'
const build = clientBundle(packageIdentity, ['src/index.ts'])

const bundledHostLibraries = new Map([
  ['@deepseek-ai/schemastery', resolve(dshSource, 'vendor/schemastery/lib/index.mjs')],
  ['@deepseek-ai/cosmokit', resolve(dshSource, 'vendor/cosmokit/lib/index.js')],
])

// The current DSH preset discovers dependency policy from its own monorepo
// manifests. Build through a compatible shipped browser package, then the
// deterministic post-step rewrites only the bundle identity to this tree-out
// package. Runtime externals are the same subset used by that package.
export default (options: Parameters<typeof build>[0]) => build(options).map(config => {
  if (config.name !== packageIdentity) return config
  return {
    ...config,
    plugins: [{
      name: 'cangzhi-bundled-host-libraries',
      resolveId: {
        order: 'pre' as const,
        handler(source: string) {
          return bundledHostLibraries.get(source) ?? null
        },
      },
      renderChunk(code: string) {
        return code.replace(/^\/\/#region .*\/vendor\/(cosmokit|schemastery)\/lib\/index\.(?:js|mjs)$/gm, '//#region bundled $1')
      },
    }, ...(config.plugins ?? [])],
  }
})
