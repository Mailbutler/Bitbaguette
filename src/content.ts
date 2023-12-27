import './style.scss';
import { enrichComments } from './comments';

// const apiToken = JSON.parse(document.querySelector('meta[name="apitoken"]')?.getAttribute('content') || '{}').token;

window.addEventListener('load', () => {
  const globalCommentNode = document.querySelector('section[data-qa="conversations-global-style"]');
  if (!globalCommentNode) throw new Error('Global comments section not present!');

  let numComments = globalCommentNode.querySelectorAll("[id^='comment-']").length;
  const commentMutationObserver = new MutationObserver(() => {
    const updatedNumComments = globalCommentNode.querySelectorAll("[id^='comment-']").length;
    if (updatedNumComments !== numComments) {
      console.debug('Number of comments changed…');
      numComments = updatedNumComments;

      // enrich comments
      enrichComments();
    }
  });
  commentMutationObserver.observe(globalCommentNode, { attributes: false, childList: true, subtree: true });

  // enrich comments
  enrichComments();
});
