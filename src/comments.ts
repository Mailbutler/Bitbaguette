import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CSS_CLASSES } from './constants';
import browser from 'webextension-polyfill';

dayjs.extend(minMax);
dayjs.extend(customParseFormat);

export function enrichComments() {
  const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");
  if (commentElements.length === 0) return;

  console.debug('Enriching comments…');
  commentElements.forEach((commentElement) => {
    const headerElement = commentElement.querySelector(CSS_CLASSES.COMMENT_HEADER);
    if (!headerElement) throw new Error('Header element not found!');

    const replyCount = numReplies(commentElement);
    if (replyCount > 0) {
      let replyCountElement = headerElement.querySelector(':scope > .baguette-reply-count');
      if (!replyCountElement) {
        replyCountElement = document.createElement('div');
        replyCountElement.classList.add('baguette-comment-header-element', 'baguette-reply-count');
        headerElement.appendChild(replyCountElement);
      }
      replyCountElement.innerHTML = `<span aria-hidden="true" class="${CSS_CLASSES.INDICATOR_SPAN}" style="--icon-primary-color: var(--ds-icon, #42526E); --icon-secondary-color: var(--ds-surface, #FFFFFF);"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><g fill="currentColor" fill-rule="evenodd"><path d="M4.998 11.513c0-3.038 3.141-5.51 7.002-5.51 3.861 0 7.002 2.472 7.002 5.51 0 3.039-3.141 5.51-7.002 5.51-3.861 0-7.002-2.471-7.002-5.51zm14.84 7.771v-.002s-1.564-2.26-.767-3.116l-.037.02C20.261 14.902 21 13.279 21 11.513 21 7.371 16.963 4 12 4s-9 3.37-9 7.513 4.037 7.514 9 7.514c1.42 0 2.76-.285 3.957-.776 1.003 1.022 2.287 1.572 3.24 1.719l.002-.003a.524.524 0 00.164.033.515.515 0 00.474-.716z"></path><rect x="7" y="9" width="10" height="2" rx="1"></rect><rect x="7" y="12" width="5" height="2" rx="1"></rect></g></svg></span></span><span aria-hidden="true">${replyCount}</span>`;

      const openTaskCount = numOpenTasks(commentElement);
      if (openTaskCount > 0) {
        let taskCountElement = headerElement.querySelector(':scope > .baguette-task-count');
        if (!taskCountElement) {
          taskCountElement = document.createElement('div');
          taskCountElement.classList.add('baguette-comment-header-element', 'baguette-task-count');
          headerElement.appendChild(taskCountElement);
        }
        taskCountElement.innerHTML = `<span aria-hidden="true" class="${CSS_CLASSES.INDICATOR_SPAN}" style="--icon-primary-color: var(--ds-icon, #42526E); --icon-secondary-color: var(--ds-surface, #FFFFFF);"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><g fill="currentColor" fill-rule="evenodd"><path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 01-.993.993H3.993A.994.994 0 013 20.007V3.993zM5 5v14h14V5H5z"></path><path d="M9.707 11.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 10-1.414-1.414L11 12.586l-1.293-1.293z" fill-rule="nonzero"></path></g></svg></span></span><span aria-hidden="true">${openTaskCount}</span>`;
      }
    }

    if (!headerElement.querySelector(':scope > .baguette-collapse-toggle')) {
      const commentId = commentElement.getAttribute('id');
      if (!commentId) throw new Error('Comment Id not found!');

      const toggleElement = document.createElement('span');
      toggleElement.classList.add(
        CSS_CLASSES.TOGGLE_BUTTON,
        'baguette-comment-header-element',
        'baguette-collapse-toggle'
      );
      toggleElement.innerHTML = `<span class="${CSS_CLASSES.TOGGLE_ICON}"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path d="M10.294 9.698a.988.988 0 010-1.407 1.01 1.01 0 011.419 0l2.965 2.94a1.09 1.09 0 010 1.548l-2.955 2.93a1.01 1.01 0 01-1.42 0 .988.988 0 010-1.407l2.318-2.297-2.327-2.307z" fill="currentColor" fill-rule="evenodd"></path></svg></span>`;
      headerElement.appendChild(toggleElement);

      headerElement.addEventListener('click', () => {
        const isCollapsed = commentElement.classList.toggle('baguette-collapsed');

        browser.storage.sync.set({ [commentId]: { isCollapsed } });
      });

      // load saved config for this comment
      browser.storage.sync.get([commentId]).then((result) => {
        const isCollapsed = !!result[commentId]?.isCollapsed;
        commentElement.classList.toggle('baguette-collapsed', isCollapsed);
      });
    }
  });

  updateUnseenState();
  enrichCommentLinks();
}

export function updateUnseenState(retried = false) {
  const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");
  if (commentElements.length === 0) return;

  if (!browser.storage) {
    if (retried) throw new Error('Browser storage not accessible!');

    // Try again
    setTimeout(() => updateUnseenState(true), 500);
    return;
  }

  const pullRequestId = window.location.pathname;
  browser.storage.sync.get([pullRequestId]).then((result) => {
    const lastViewDate = result[pullRequestId]?.lastViewDate ? dayjs(result[pullRequestId]?.lastViewDate) : dayjs();

    commentElements.forEach((commentElement) => {
      const replyElement = commentElement.querySelector('.baguette-reply-count');
      if (!replyElement) return;

      const latestReplyDate = lastReplyDate(commentElement);
      const hasUnseenReplies = !!latestReplyDate && latestReplyDate.isAfter(lastViewDate);
      replyElement.classList.toggle('baguette-reply-count--unseen', hasUnseenReplies); // TODO: highlight unseen comments on click
    });

    browser.storage.sync.set({ [pullRequestId]: { lastViewDate: dayjs().add(30, 'seconds').toISOString() } });
  });
}

export function addGlobalCommentControls() {
  const commentsHeaderElement = document.querySelector('[data-qa="conversations-global-style"] .sc-bZQynM');
  if (!commentsHeaderElement) return;

  if (!commentsHeaderElement.querySelector('.baguette-collapse-all')) {
    const collapseAllElement = document.createElement('span');
    collapseAllElement.classList.add(CSS_CLASSES.TOGGLE_BUTTON, 'baguette-collapse-all');
    collapseAllElement.innerHTML = `<span class="${CSS_CLASSES.TOGGLE_ICON}"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path d="M11.22 6.322L8.293 9.277a1.009 1.009 0 000 1.419.986.986 0 001.405 0l2.298-2.317 2.307 2.327a.989.989 0 001.407 0 1.01 1.01 0 000-1.419l-2.94-2.965A1.106 1.106 0 0011.99 6c-.28 0-.557.107-.77.322zm0 6l-2.928 2.955a1.009 1.009 0 000 1.419.986.986 0 001.405 0l2.298-2.317 2.307 2.327a.989.989 0 001.407 0 1.01 1.01 0 000-1.419l-2.94-2.965A1.106 1.106 0 0011.99 12c-.28 0-.557.107-.77.322z" fill="currentColor" fill-rule="evenodd"></path></svg></span>`;
    commentsHeaderElement.appendChild(collapseAllElement);

    collapseAllElement.addEventListener('click', (event) => {
      const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");

      commentElements.forEach((commentElement) => {
        const commentId = commentElement.getAttribute('id');
        if (!commentId) throw new Error('Comment Id not found!');

        const isCollapsed = commentElement.classList.toggle('baguette-collapsed', true);

        browser.storage.sync.set({ [commentId]: { isCollapsed } });
      });

      event.stopPropagation();
    });
  }

  if (!commentsHeaderElement.querySelector('.baguette-expand-all')) {
    const expandAllElement = document.createElement('span');
    expandAllElement.classList.add(CSS_CLASSES.TOGGLE_BUTTON, 'baguette-expand-all');
    expandAllElement.innerHTML = `<span class="${CSS_CLASSES.TOGGLE_ICON}"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path d="M14.302 13.294l-2.308 2.327-2.297-2.317a.986.986 0 00-1.405 0 1.009 1.009 0 000 1.419l2.928 2.955c.214.215.492.322.77.322.28 0 .56-.107.778-.322l2.94-2.965a1.012 1.012 0 000-1.419.988.988 0 00-1.406 0zm0-6l-2.308 2.327-2.297-2.317a.986.986 0 00-1.405 0 1.009 1.009 0 000 1.419l2.928 2.955c.214.215.492.322.77.322.28 0 .56-.107.778-.322l2.94-2.965a1.012 1.012 0 000-1.419.988.988 0 00-1.406 0z" fill="currentColor" fill-rule="evenodd"></path></svg></span>`;
    commentsHeaderElement.appendChild(expandAllElement);

    expandAllElement.addEventListener('click', (event) => {
      const commentElements = document.querySelectorAll<HTMLDivElement>("[id^='comment-']");

      commentElements.forEach((commentElement) => {
        const commentId = commentElement.getAttribute('id');
        if (!commentId) throw new Error('Comment Id not found!');

        const isCollapsed = commentElement.classList.toggle('baguette-collapsed', false);

        browser.storage.sync.set({ [commentId]: { isCollapsed } });
      });

      event.stopPropagation();
    });
  }
}

function enrichCommentLinks() {
  const commentLinkElements = document.querySelectorAll<HTMLAnchorElement>("a[href^='#comment-']");
  if (commentLinkElements.length === 0) return;

  commentLinkElements.forEach((commentLinkElement) => {
    commentLinkElement.addEventListener('click', onClickCommentLink);
  });
}

export function highlightComment(commentId: string, expand = true) {
  commentId = commentId.replace('#', '');
  const commentElement = document.getElementById(commentId);
  if (!commentElement) return;

  commentElement.classList.add('baguette-highlighted');
  setTimeout(() => commentElement.classList.remove('baguette-highlighted'), 3000);

  if (expand) expandComment(commentId);
}

function expandComment(commentId: string) {
  const commentElement = document.getElementById(commentId);
  if (!commentElement) return;

  commentElement.classList.remove('baguette-collapsed');

  // expand all parents, too
  const parentCommentId = commentElement.closest("[id^='comment-']")?.getAttribute('id');
  if (parentCommentId && parentCommentId !== commentId) expandComment(parentCommentId);

  // expand all children, too
  commentElement.querySelectorAll("[id^='comment-']").forEach((commentElement) => {
    const childCommentId = commentElement.getAttribute('id');
    if (childCommentId) expandComment(childCommentId);
  });
}

function onClickCommentLink(event: MouseEvent) {
  const clickedElement = event.currentTarget as HTMLAnchorElement | null;
  const commentId = clickedElement?.getAttribute('href');
  if (commentId) highlightComment(commentId);
}

export function numReplies(commentElement: HTMLDivElement): number {
  const nestedCommentElements = Array.from(commentElement.querySelectorAll(CSS_CLASSES.NESTED_COMMENT));
  return nestedCommentElements.length;
}

export function lastReplyDate(commentElement: HTMLDivElement): dayjs.Dayjs | null {
  const dateElements = Array.from(
    commentElement.querySelectorAll(
      `:scope > ${CSS_CLASSES.NESTED_COMMENT} ${CSS_CLASSES.COMMENT_DATE_LINK} span[title], :scope > ${CSS_CLASSES.NESTED_COMMENT} ${CSS_CLASSES.COMMENT_DATE_LINK} time[title]`
    )
  );
  if (dateElements.length === 0) return null;

  return dayjs.max(
    dateElements
      .map((dateElement) => {
        const dateString = dateElement.getAttribute('title')?.split(' GMT')[0];
        if (!dateString) return dayjs('Invalid');

        return dayjs(dateString, 'MMMM D, YYYY at h:mm:ss A');
      })
      .filter((date) => date.isValid())
  );
}

export function numOpenTasks(commentElement: HTMLDivElement): number {
  const checkboxElements = Array.from(commentElement.querySelectorAll('input[type="checkbox"][aria-checked="false"]'));
  return checkboxElements.length;
}
