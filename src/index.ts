import vue from '@vitejs/plugin-vue';
import Pages from './pages';
import Layouts from './layouts';
import Components from './components';
import Store from './store';
import Html from './html';
import Plugin from './plugins';
import Locale from './locales';
import Package from './packages';
import { Options } from './types';

const convue = (options: Options) => {
  return [
    vue({
      ssr: options.ssr,
    }),
    Pages({
      ...options.page,
      head: options.head,
      progress: options.progress || options.progress === false ? options.progress : true,
    }),
    Layouts({
      ...options.layout,
      head: options.head,
      useCookie: options.locale && options.locale.useCookie ? options.locale.useCookie : true,
    }),
    Components(options.component),
    Store(options.store),
    Html({
      head: options.head,
      loading: options.loading,
      progress: options.progress || options.progress === false ? options.progress : true,
    }),
    Plugin(options.plugin),
    Locale(options.locale),
    Package({
      styles: options.styles,
      modules: options.modules,
    }),
  ];
};

export default convue;
