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
  const NAMESPACE = "loading";  // 定义模块名
  const SHOW = "loading/SHOW" // 显示mutation 同步type
  const HIDE = "loading/HIDE"

  const createLoadingPlugin = ({
    namespace = NAMESPACE,
    includes = [],
    excludes = []
  } = {}) => {
    return store => {
      if (store.state[namespace]) {
        throw new Error(
          'createLoadingPlugin: loading namespace exited in current store'
        );
      }

      // new vuex的时候注册一个模块进去
      store.registerModule(namespace, {
        namespaced: true,
        state: {
          global: false, // 定义全局loading
          effects: {}
        },
        // 同步方法
        mutations: {
          SHOW(state, { payload }) {
            state.global = true;
            state.effects = {
              ...state.effects,
              [payload]: true // 将当前的action 置为true
            };
          },
          HIDE(state, { payload }) {
            state.global = false;
            state.effects = {
              ...state.effects,
              [payload]: false // 将当前的action 置为false
            };
          }
        }
      });

      store.subscribeAction({
        // 发起一个action 之前会走这里
        before: action => {
          if (onEffect(action, includes, excludes)) {
            store.commit(SHOW, { payload: action.type });
          }
        },
        // 发起一个action 之后会走这里
        after: action => {
          if (onEffect(action, includes, excludes)) {
            store.commit(HIDE, { payload: action.type });
          }
        }
      });
    };
  };

  // 判断是否要执行
  function onEffect({ type }, includes, excludes) {
    if (includes.length === 0 && excludes.length === 0) {
      return true;
    }

    if (includes.length > 0) {
      return includes.indexOf(type) > -1;
    }

    return excludes.length > 0 && excludes.indexOf(type) === -1;
  }

  const loadingPlugin = createLoadingPlugin();
`;

export function generateClientCode(stores: any[]) {
  const names = stores.map((n) => n.name);

  let combineStores: any = {
    plugins: ['loadingPlugin'],
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
