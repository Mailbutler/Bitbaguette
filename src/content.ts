import './styles/style.scss';
import { addGlobalCommentControls, enrichComments, highlightComment } from './comments';
import '@webcomponents/webcomponentsjs';
import { addImageComparisonButtons, addImageComparisonModal } from './image-comparison';
import { CSS_CLASSES } from './constants';
import './darkmode';

// const apiToken = JSON.parse(document.querySelector('meta[name="apitoken"]')?.getAttribute('content') || '{}').token;

addImageComparisonModal();

function inject() {
  if (!document.location.pathname.includes('/pull-requests/')) return;

  addGlobalCommentControls();

  // enrich comments
  enrichComments();

  // enrich image diffs
  addImageComparisonButtons();
}

// watch for changes in URL and comment count
let lastUrl = location.href;
let numComments = document.querySelectorAll("[id^='comment-']").length;
let numImageDiffs = document.querySelectorAll(CSS_CLASSES.IMAGE_DIFF).length;
let numActivities = document.querySelectorAll('.activity-entry-items > div').length;
new MutationObserver(() => {
  const url = location.href;
  const updatedNumComments = document.querySelectorAll("[id^='comment-']").length;
  const updatedNumImageDiffs = document.querySelectorAll(CSS_CLASSES.IMAGE_DIFF).length;
  const updatedNumActivities = document.querySelectorAll('.activity-entry-items > div').length;
  if (
    url !== lastUrl ||
    updatedNumComments !== numComments ||
    updatedNumImageDiffs !== numImageDiffs ||
    updatedNumActivities !== numActivities
  ) {
    const newUrlHash = new URL(url).hash;
    if (newUrlHash.includes('comment-') && url !== lastUrl) {
      highlightComment(newUrlHash);
    }

    lastUrl = url;
    numComments = updatedNumComments;
    numImageDiffs = updatedNumImageDiffs;
    numActivities = updatedNumActivities;

    inject();
  }
}).observe(document, { subtree: true, childList: true });

// initial injection
inject();

// initial highlighting
setTimeout(() => {
  const initialHash = new URL(location.href).hash;
  if (initialHash.includes('comment-')) {
    highlightComment(initialHash);
  }
}, 2000);
