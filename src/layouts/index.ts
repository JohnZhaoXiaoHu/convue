import { resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import { ResolvedOptions, UserOptions } from './types'
import { getFilesFromPath } from './files'
import { debug, normalizePath } from './utils'
import getClientCode from './RouteLayout'
import { getImportCode } from './importCode'

const ID = 'layouts-generated'

function resolveOptions(userOptions: UserOptions): ResolvedOptions {
  const {
    dir = 'src/layouts',
    extensions = ['vue', 'js', 'jsx', 'ts', 'tsx'],
    exclude = [],
    useCookie = true,
  } = userOptions

  const root = process.cwd()

  return Object.assign(
    {},
    {
      root,
      dir,
      extensions,
      exclude,
    },
    userOptions,
  )
}

function layoutPlugin(userOptions: UserOptions = {}): Plugin {
  let config: ResolvedConfig | undefined

  const options: ResolvedOptions = resolveOptions(userOptions)

  if (options.useCookie === true) {
    options.useCookie = {
      cookieKey: 'i18n',
      expires: 365,
    }
  }

  return {
    name: 'vite-plugin-layouts',
    enforce: 'pre',
    configResolved(_config) {
      config = _config
      options.root = config.root
    },
    resolveId(id) {
      if (id === ID)
        return ID
    },
    async load(id) {
      if (id === ID) {
        const layoutsDirPath = normalizePath(resolve(options.root, options.dir))
        debug('Loading Layout Dir: %O', layoutsDirPath)

        const files = await getFilesFromPath(layoutsDirPath, options)

        const importCode = getImportCode(files, options)

        const clientCode = getClientCode(importCode, options)

        debug('Client code: %O', clientCode)

        return clientCode
      }
    },
  }
}

export * from './types'
export default layoutPlugin
