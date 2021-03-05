import { ResolvedOptions } from './types';

function getClientCode(importCode: string, options: ResolvedOptions) {
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

      const head = to.meta.head;
      if (head && head.title) {
        document.title = /^t\(.+\)$/.test(head.title) ? window.__APP__.__VUE_I18N__.global.t(head.title.slice(3, -2)) : head.title;
      }

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
          document.title = /^t\(.+\)$/.test(head.title) ? window.__APP__.__VUE_I18N__.global.t(head.title.slice(3, -2)) : head.title;
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
