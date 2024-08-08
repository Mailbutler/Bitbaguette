import './styles/style.scss';
import { addGlobalCommentControls, enrichComments, highlightComment } from './comments';
import '@webcomponents/webcomponentsjs';
import { addImageComparisonButtons, addImageComparisonModal } from './image-comparison';
import { CSS_CLASSES } from './constants';
import './darkmode';
import { addThemeSelector } from './darkmode';

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
let numDiffViews = document.querySelectorAll("[data-testid^='file-content']").length;
let numActivities = document.querySelectorAll('.activity-entry-items > div').length;
new MutationObserver(() => {
  const url = location.href;
  const updatedNumComments = document.querySelectorAll("[id^='comment-']").length;
  const updatedNumDiffViews = document.querySelectorAll("[data-testid^='file-content']").length;
  const updatedNumActivities = document.querySelectorAll('.activity-entry-items > div').length;
  if (
    url !== lastUrl ||
    updatedNumComments !== numComments ||
    updatedNumDiffViews !== numDiffViews ||
    updatedNumActivities !== numActivities
  ) {
    const newUrlHash = new URL(url).hash;
    if (newUrlHash.includes('comment-') && url !== lastUrl) {
      highlightComment(newUrlHash);
    }

    lastUrl = url;
    numComments = updatedNumComments;
    numDiffViews = updatedNumDiffViews;
    numActivities = updatedNumActivities;

    inject();
  }

  const accountGroupElement = document.querySelector<HTMLDivElement>(
    `${CSS_CLASSES.DROPDOWN_MENU} [aria-label="Account"]`
  );
  if (accountGroupElement) {
    const dropdownElement = accountGroupElement.closest(CSS_CLASSES.DROPDOWN_MENU);
    console.debug(dropdownElement);
    addThemeSelector(dropdownElement!);
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
