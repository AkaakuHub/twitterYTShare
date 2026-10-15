import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'twitterYTShare',
    description: 'YouTubeでX共有用の文章をコピーするボタンを追加します。',
    action: {
      default_title: 'twitterYTShare',
    },
  },
});
