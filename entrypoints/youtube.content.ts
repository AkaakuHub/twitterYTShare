import '../youtube.css';
import { createShareText } from '../share-text';

const PANEL_SELECTOR = 'yt-unified-share-panel-renderer';
const TARGET_SELECTOR = 'yt-share-target-renderer';
const BUTTON_CLASS = 'twitter-yt-share-button';

export default defineContentScript({
  matches: ['https://www.youtube.com/*'],
  main(ctx) {
    const popupContainer = document.querySelector('ytd-popup-container');
    if (!popupContainer) return;

    function addButton() {
      const panel = popupContainer?.querySelector(PANEL_SELECTOR);
      const target = panel?.querySelector(TARGET_SELECTOR);
      if (!panel || !target || panel.querySelector(`.${BUTTON_CLASS}`)) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = BUTTON_CLASS;
      button.textContent = 'コピー';
      button.title = 'X共有用の文章をコピー';
      button.addEventListener('click', async () => {
        const title = document.querySelector('ytd-watch-metadata h1')?.textContent ?? '';
        const shareText = createShareText(title, location.href);
        if (!shareText) return;

        try {
          await navigator.clipboard.writeText(shareText);
          panel.querySelector<HTMLElement>('tp-yt-paper-icon-button')?.click();
        } catch (error) {
          console.error('twitterYTShare: コピーに失敗しました', error);
        }
      });
      target.before(button);
    }

    addButton();
    const observer = new MutationObserver(addButton);
    observer.observe(popupContainer, { childList: true, subtree: true });
    ctx.onInvalidated(() => observer.disconnect());
  },
});
