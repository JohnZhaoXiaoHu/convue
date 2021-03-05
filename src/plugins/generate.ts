import { ResolvedOptions } from './types';

export function generatePlugins(filesPath: string[], options: ResolvedOptions) {
  const { pluginsDirPath } = options;

  const plugins: any[] = [];

  for (const filePath of filesPath) {
    const filePaths = filePath.split('/');
    let name = filePaths[0].toLocaleLowerCase();

    for (const path of filePaths.slice(1)) {
      name += `-${path.toLocaleLowerCase()}`;
    }

    name = name.split('.')[0].replace(/-(\w)/g, function (_$0, $1) {
      return $1.toUpperCase();
    });

    plugins.push({
      imports: `import ${name} from '${pluginsDirPath}/${filePath}'`,
      name,
    });
  }

  return plugins;
}

export function generateClientCode(plugins: any[]) {
  return `
    ${plugins.map((n) => n.imports).join('\n')}

    const install = (app) => {
      const { $store, $router, $route, $t } = app.config.globalProperties;

      const inject = (name, callback) => {
        app.config.globalProperties = {
          ...app.config.globalProperties,
          ['$' + name]: callback
        };
        $store['$' + name] = callback;
      };

      $store['$router'] = $router;
      $store['$route'] = $route;
      $store['$t'] = $t;

      ${plugins
        .map((n) => n.name)
        .map((plugin) => {
          return `
            ${plugin}({ app, store: $store, router: $router, route: $route, t: $t,  env: import.meta.env  }, inject)
          `;
        }).join(';\n')}
    };

    export default {
      install,
    };
  `;
}
