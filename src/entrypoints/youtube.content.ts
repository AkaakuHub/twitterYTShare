import '../youtube.css';
import copyIcon from '@material-design-icons/svg/filled/content_copy.svg?raw';
import { createShareText } from '../share-text';

const PANEL_SELECTOR = 'yt-unified-share-panel-renderer';
const TARGET_SELECTOR = 'yt-share-target-renderer';
const BUTTON_CLASS = 'twitter-yt-share-button';

export default defineContentScript({
  matches: ['https://www.youtube.com/*'],
  main(ctx) {
    let popupContainer = document.querySelector('ytd-popup-container');

    function addButton() {
      const panel = popupContainer?.querySelector(PANEL_SELECTOR);
      const target = panel?.querySelector(TARGET_SELECTOR);
      if (!panel || !target || panel.querySelector(`.${BUTTON_CLASS}`)) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = BUTTON_CLASS;
      button.innerHTML = `<span class="twitter-yt-share-icon" aria-hidden="true">${copyIcon}</span><span class="twitter-yt-share-label">コピー</span>`;
      button.title = 'X共有用の文章をコピー';
      button.addEventListener('click', async () => {
        const title = document.querySelector('ytd-watch-metadata h1')?.textContent ?? '';
        const shareText = createShareText(title, location.href);
        if (!shareText) return;

        try {
          await navigator.clipboard.writeText(shareText);
          panel.querySelector<HTMLButtonElement>('#close-button button')?.click();
        } catch (error) {
          console.error('twitterYTShare: コピーに失敗しました', error);
        }
      });
      target.before(button);
    }

    addButton();
    const observer = new MutationObserver(() => {
      if (!popupContainer) {
        popupContainer = document.querySelector('ytd-popup-container');
        if (!popupContainer) return;
        observer.disconnect();
        observer.observe(popupContainer, { childList: true, subtree: true });
      }
      addButton();
    });
    observer.observe(popupContainer ?? document.documentElement, { childList: true, subtree: true });
    ctx.onInvalidated(() => observer.disconnect());
  },
});
