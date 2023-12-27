import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(minMax);
dayjs.extend(customParseFormat);

export function numReplies(commentElement: HTMLDivElement): number {
  const nestedCommentElements = Array.from(commentElement.querySelectorAll('.css-1ghcdo'));
  return nestedCommentElements.length;
}

export function lastReplyDate(commentElement: HTMLDivElement): dayjs.Dayjs | null {
  const dateElements = Array.from(
    commentElement.querySelectorAll(
      ':scope > .css-1ghcdo .css-mkbxrn span[title], :scope > .css-1ghcdo .css-mkbxrn time[title]'
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
