if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-color-mode', 'dark');

  let theme = document.documentElement.getAttribute('data-theme') || 'dark:dark';
  if (!theme.includes('dark:dark')) theme = `${theme} dark:dark`;
  document.documentElement.setAttribute('data-theme', theme);
}

const colorSchemeHandler = (event: MediaQueryListEvent) => {
  if (event.matches) {
    document.documentElement.setAttribute('data-color-mode', 'dark');

    let theme = document.documentElement.getAttribute('data-theme') || 'dark:dark';
    if (!theme.includes('dark:dark')) theme = `${theme} dark:dark`;
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.setAttribute('data-color-mode', 'light');

    let theme = document.documentElement.getAttribute('data-theme') || '';
    if (theme.includes('dark:dark')) theme = theme.replace('dark:dark', '').trim();
    document.documentElement.setAttribute('data-theme', theme);
  }
};

const colorSchemeMediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeMediaQueryList.addEventListener('change', colorSchemeHandler);
