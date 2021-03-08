import fs from 'fs';
import { resolve } from 'path';
import { ResolvedOptions } from './types';
import { normalizePath } from './utils';

function getClientCode(importCode: string, options: ResolvedOptions) {
  let title: string;
  if (options.head && options.head.title) {
    title = options.head.title;
  } else {
    const packageJson = JSON.parse(
      fs.readFileSync(normalizePath(resolve(options.root, 'package.json')), 'utf-8')
    );
    title = packageJson.name;
  }
  const code = `
import {
  h,
  defineComponent,
  shallowReactive,
  watch,
} from 'vue'
import Cookies from 'js-cookie';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

${importCode}

export function setupLayouts(routes) {
  const RouterLayout = createRouterLayout((layout) => {
    return Promise.resolve(layouts[\`/${options.dir}/\${layout}\`]())
  })

  return [
    {
      path: '/',
      component: RouterLayout,
      children: routes,
    },
  ]
}

export function createRouterLayout(
  resolve,
) {
  return defineComponent({
    name: 'RouterLayout',

    async beforeRouteEnter(to, _from, next) {
      const name = to.meta.layout || 'default'
      const layoutComp = name
        ? (await resolve(name)).default
        : undefined

      next((vm) => {
        vm.layoutName = name
        if (name && layoutComp)
          vm.layouts[name] = layoutComp
      })
    },

    async beforeRouteUpdate(to, _from, next) {
      try {
        const name = to.meta.layout || 'default'
        if (name && !this.layouts[name])
          this.layouts[name] = (await resolve(name)).default

        this.layoutName = name
        next()
      }
      catch (error) {
        next(error)
      }
    },

    data() {
      return {
        layoutName: undefined,
        layouts: shallowReactive(
          Object.create(null),
        ),
      }
    },

    setup() {
      const { locale } = useI18n();
      const route = useRoute();

      watch(locale, (val) => {
        ${
          typeof options.useCookie !== 'boolean' && options.useCookie
            ? `Cookies.set('${options.useCookie.cookieKey}', val, {
            expires: ${options.useCookie.expires},
          });`
            : ''
        }
        const head = route.meta.head;
        if (head && head.title) {
          document.title = /^t\(.+\)$/.test(head.title) ? window.__APP__.config.globalProperties.$t(head.title.slice(3, -2)) : head.title;
        } else {
          document.title = /^t\(.+\)$/.test('${title}') ? window.__APP__.config.globalProperties.$t('${title.slice(3, -2)}') : '${title}';
        }
      });
    },

    render() {
      const layout = this.layoutName && this.layouts[this.layoutName]
      if (!layout)
        return h('span')

      return h(layout, {
        key: this.layoutName,
      })
    },
  })
}
`;
  return code;
}

export default getClientCode;
