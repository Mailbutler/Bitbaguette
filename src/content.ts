import './style.scss';
import { enrichComments } from './comments';
import '@webcomponents/webcomponentsjs';
import { addImageComparisonButtons, addImageComparisonModal } from './image-comparison';
import { CSS_CLASSES } from './constants';

// const apiToken = JSON.parse(document.querySelector('meta[name="apitoken"]')?.getAttribute('content') || '{}').token;

addImageComparisonModal();

function inject() {
  if (!document.location.pathname.includes('/pull-requests/')) return;

  // enrich comments
  enrichComments();

  // enrich image diffs
  addImageComparisonButtons();
}

// watch for changes in URL and comment count
let lastUrl = location.href;
let numComments = document.querySelectorAll("[id^='comment-']").length;
let numImageDiffs = document.querySelectorAll(CSS_CLASSES.IMAGE_DIFF).length;
new MutationObserver(() => {
  const url = location.href;
  const updatedNumComments = document.querySelectorAll("[id^='comment-']").length;
  const updatedNumImageDiffs = document.querySelectorAll(CSS_CLASSES.IMAGE_DIFF).length;
  if (url !== lastUrl || updatedNumComments !== numComments || updatedNumImageDiffs !== numImageDiffs) {
    lastUrl = url;
    numComments = updatedNumComments;
    numImageDiffs = updatedNumImageDiffs;

    inject();
  }
}).observe(document, { subtree: true, childList: true });

// initial injection
inject();
