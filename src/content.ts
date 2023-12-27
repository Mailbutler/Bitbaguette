import './style.scss';
import browser from 'webextension-polyfill';
import dayjs from 'dayjs';
import { CSS_CLASSES } from './constants';
import { numReplies, numOpenTasks, lastReplyDate } from './comments';

// const apiToken = JSON.parse(document.querySelector('meta[name="apitoken"]')?.getAttribute('content') || '{}').token;

window.addEventListener('load', () => {
  // enrich comments
  const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");
  commentElements.forEach((commentElement) => {
    const headerElement = commentElement.querySelector(CSS_CLASSES.COMMENT_HEADER);
    if (!headerElement) throw new Error('Header element not found!');

    const commentId = commentElement.getAttribute('id');
    if (!commentId) throw new Error('Comment Id not found!');

    const replyCount = numReplies(commentElement);
    if (replyCount > 0) {
      const replyCountElement = document.createElement('div');
      replyCountElement.classList.add('baguette-reply-count');
      replyCountElement.innerHTML = `<span aria-hidden="true" class="css-1afrefi" style="--icon-primary-color: var(--ds-icon, #42526E); --icon-secondary-color: var(--ds-surface, #FFFFFF);"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><g fill="currentColor" fill-rule="evenodd"><path d="M4.998 11.513c0-3.038 3.141-5.51 7.002-5.51 3.861 0 7.002 2.472 7.002 5.51 0 3.039-3.141 5.51-7.002 5.51-3.861 0-7.002-2.471-7.002-5.51zm14.84 7.771v-.002s-1.564-2.26-.767-3.116l-.037.02C20.261 14.902 21 13.279 21 11.513 21 7.371 16.963 4 12 4s-9 3.37-9 7.513 4.037 7.514 9 7.514c1.42 0 2.76-.285 3.957-.776 1.003 1.022 2.287 1.572 3.24 1.719l.002-.003a.524.524 0 00.164.033.515.515 0 00.474-.716z"></path><rect x="7" y="9" width="10" height="2" rx="1"></rect><rect x="7" y="12" width="5" height="2" rx="1"></rect></g></svg></span></span><span aria-hidden="true">${replyCount}</span>`;
      headerElement.appendChild(replyCountElement);

      const openTaskCount = numOpenTasks(commentElement);
      if (openTaskCount > 0) {
        const taskCountElement = document.createElement('div');
        taskCountElement.classList.add('baguette-task-count');
        taskCountElement.innerHTML = `<span aria-hidden="true" class="css-1afrefi" style="--icon-primary-color: var(--ds-icon, #42526E); --icon-secondary-color: var(--ds-surface, #FFFFFF);"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><g fill="currentColor" fill-rule="evenodd"><path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 01-.993.993H3.993A.994.994 0 013 20.007V3.993zM5 5v14h14V5H5z"></path><path d="M9.707 11.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 10-1.414-1.414L11 12.586l-1.293-1.293z" fill-rule="nonzero"></path></g></svg></span></span><span aria-hidden="true">${openTaskCount}</span>`;
        headerElement.appendChild(taskCountElement);
      }
    }

    const toggleElement = document.createElement('span');
    toggleElement.classList.add(CSS_CLASSES.TOGGLE_BUTTON, 'baguette-collapse-toggle');
    toggleElement.innerHTML = `<span class="${CSS_CLASSES.TOGGLE_ICON}"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path d="M10.294 9.698a.988.988 0 010-1.407 1.01 1.01 0 011.419 0l2.965 2.94a1.09 1.09 0 010 1.548l-2.955 2.93a1.01 1.01 0 01-1.42 0 .988.988 0 010-1.407l2.318-2.297-2.327-2.307z" fill="currentColor" fill-rule="evenodd"></path></svg></span>`;
    headerElement.appendChild(toggleElement);

    headerElement.addEventListener('click', () => {
      const isCollapsed = commentElement.classList.toggle('baguette-collapsed');

      browser.storage.sync.set({ [commentId]: { isCollapsed } });
    });

    // load initial config for this comment
    browser.storage.sync.get([commentId]).then((result) => {
      const isCollapsed = !!result[commentId]?.isCollapsed;
      commentElement.classList.toggle('baguette-collapsed', isCollapsed);
    });
  });

  const pullRequestId = window.location.pathname;
  browser.storage.sync.get([pullRequestId]).then((result) => {
    const lastViewDate = result[pullRequestId]?.lastViewDate ? dayjs(result[pullRequestId]?.lastViewDate) : dayjs();

    const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");
    commentElements.forEach((commentElement) => {
      const replyElement = commentElement.querySelector('.baguette-reply-count');
      if (!replyElement) return;

      const latestReplyDate = lastReplyDate(commentElement);
      const hasUnseenReplies = !!latestReplyDate && latestReplyDate.isAfter(lastViewDate);
      replyElement.classList.toggle('baguette-reply-count--unseen', hasUnseenReplies);
    });

    browser.storage.sync.set({ [pullRequestId]: { lastViewDate: dayjs().add(30, 'seconds').toISOString() } });
  });
});
