import './style.scss';
import { enrichComments } from './comments';

// const apiToken = JSON.parse(document.querySelector('meta[name="apitoken"]')?.getAttribute('content') || '{}').token;

function init() {
  if (!document.location.pathname.includes('/pull-requests/')) return;

  // enrich comments
  enrichComments();
}

window.addEventListener('load', () => {
  init();

  // watch for changes in URL and comment count
  let lastUrl = location.href;
  let numComments = document.querySelectorAll("[id^='comment-']").length;
  new MutationObserver(() => {
    const url = location.href;
    const updatedNumComments = document.querySelectorAll("[id^='comment-']").length;
    if (url !== lastUrl || updatedNumComments !== numComments) {
      lastUrl = url;
      numComments = updatedNumComments;

      init();
    }
  }).observe(document, { subtree: true, childList: true });
});
