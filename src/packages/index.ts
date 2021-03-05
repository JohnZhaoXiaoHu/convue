import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'fs';
import { resolve } from 'path';
import { Options } from './types';

const ID = 'convue-package';

export default function PackagesPlugin(userOptions: Options = {}): Plugin {
  let config: ResolvedConfig | undefined;
  let options: Options = userOptions;
  const styles: string[] = options.styles || [];
  const modules: string[] = options.modules || [];

  return {
    name: 'vite-plugin-package',
    enforce: 'pre',
    configResolved(_config) {
      config = _config;
    },
    resolveId(id) {
      if (id === ID) return ID;
    },
    async load(id) {
      if (id === ID) {
        return `
          import router from 'pages-generated';
          import globalComponent from 'components-generated';
          import store from 'store-generated';
          import plugin from 'plugin-generated';
          import i18n from 'locale-generated';
          ${modules.map((module, index) => `import _package_${index} from '${module}'`).join(';\n')}
          ${styles.map(style => `import '${style}'`).join(';\n')}

          const install = (app) => {
            app.use(i18n);
            window.t = window.$t = window._t = i18n.global.t;
            app.config.globalProperties = {
              ...app.config.globalProperties,
              $t: i18n.global.t,
            };
            app.use(router);
            app.use(store);
            app.use(plugin);
            app.use(globalComponent);
            ${modules.map((_module, index) => `app.use(_package_${index})`).join(';\n')}
            window.__APP__ = app;
          };

          export default {
            install
          };
        `;
      }
    },
  };
}
