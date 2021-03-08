import { ResolvedOptions } from './types';

export function generateComponents(filesPath: string[], options: ResolvedOptions) {
  const { componentsDirPath } = options;

  const components: any[] = [];

  for (const filePath of filesPath) {
    const filePaths = filePath.split('/');
    let name = filePaths[0].toLocaleLowerCase();

    for (const path of filePaths.slice(1, -1)) {
      name += `-${path.toLocaleLowerCase()}`;
    }

    if (filePaths.length > 1 && filePaths[filePaths.length - 1].toLocaleLowerCase().split('.')[0] !== 'index') {
      name += `-${filePaths[filePaths.length - 1].toLocaleLowerCase().split('.')[0]}`
    }

    name = name.replace(/-(\w)/g, function (_$0, $1) {
      return $1.toUpperCase();
    });

    console.log(name);

    components.push({
      imports: `import ${name} from '${componentsDirPath}/${filePath}'`,
      name,
    });
  }

  return components;
}

export function generateClientCode(components: any[]) {
  return `
    ${components.map((n) => n.imports).join('\n')}

    const install = (app) => {
      ${components
        .map((n) => n.name)
        .map((component) => {
          return `app.component('${component}', ${component})`;
        })}
    };

    export default {
      install
    };
  `;
}
