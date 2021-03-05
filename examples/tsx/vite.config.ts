import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import convue from '../../src';

export default defineConfig({
  plugins: [
    vueJsx(),
    ...convue({
      styles: ['ant-design-vue/dist/antd.css'],
      modules: ['ant-design-vue'],
      locale: {
        useCookie: {
          cookieKey: 'ant-admin',
          expires: 1
        }
      }
    }),
  ],
});
