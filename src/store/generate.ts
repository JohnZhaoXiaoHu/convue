import { ResolvedOptions } from './types';

export function generateStores(filesPath: string[], options: ResolvedOptions) {
  const { storeDirPath } = options;

  const stores: any[] = [];

  for (const filePath of filesPath) {
    const filePaths = filePath.split('/');
    let name = filePaths[0].toLocaleLowerCase();

    for (const path of filePaths.slice(1)) {
      name += `-${path.toLocaleLowerCase()}`;
    }

    name = name.split('.')[0].replace(/-(\w)/g, function (_$0, $1) {
      return $1.toUpperCase();
    });

    stores.push({
      imports: `import ${name} from '${storeDirPath}/${filePath}'`,
      name,
    });
  }

  return stores;
}

const LoadingPlugin = `
const NAMESPACE = '@@loading'

const createLoadingPlugin = ({
  namespace = NAMESPACE,
  includes = [],
  excludes = []
} = {}) => {
  return store => {
    if (store.state[namespace]) {
      throw new Error(
        'createLoadingPlugin: namespace exited in current store'
      )
    }

    store.registerModule(namespace, {
      namespaced: true,
      state: {
        global: false,
        effects: {

        }
      },
      mutations: {
        SHOW(state, { payload }) {
          state.global = true
          state.effects = {
            ...state.effects,
            [payload]: true
          }
        },
        HIDE(state, { payload }) {
          state.global = false
          state.effects = {
            ...state.effects,
            [payload]: false
          }
        }
      }
    })

    store.subscribeAction({
      before: action => {
        if (shouldEffect(action, includes, excludes)) {
          store.commit({ type: namespace + '/SHOW', payload: action.type })
        }
      },
      after: action => {
        if (shouldEffect(action, includes, excludes)) {
          store.commit({ type: namespace + '/HIDE', payload: action.type })
        }
      },
      error: action => {
        if (shouldEffect(action, includes, excludes)) {
          store.commit({ type: namespace + '/HIDE', payload: action.type })
        }
      }
    })
  }
}

function shouldEffect({ type }, includes, excludes) {
  if (includes.length === 0 && excludes.length === 0) {
    return true
  }

  if (includes.length > 0) {
    return includes.indexOf(type) > -1
  }

  return excludes.length > 0 && excludes.indexOf(type) === -1
}
`;

export function generateClientCode(stores: any[]) {
  const names = stores.map((n) => n.name);

  let combineStores: any = {
    plugins: ['createLoadingPlugin()'],
  };

  names.forEach((name) => {
    if (name === 'index') {
      combineStores.name = name;
    } else {
      combineStores.modules = {
        ...combineStores.modules,
        [name]: name,
      };
    }
  });

  if (!stores.length) return '';

  return `
    import { createStore } from 'vuex';
    ${LoadingPlugin}
    ${stores.map((n) => n.imports).join('\n')}

    const store = createStore(${JSON.stringify(combineStores, null, 2)
      .replace(/\"/g, '')
      .replace(/name\: /g, '...')})

    export default store;
  `;
}
