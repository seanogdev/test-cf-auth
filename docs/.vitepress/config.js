import { defineConfig } from 'vitepress';

export default defineConfig({
  themeConfig: {
    nav: [
      {
        text: 'Logout',
        link: '/auth/signout/',
        target: '_self',
      },
    ],
  },
});
