import browser from 'webextension-polyfill';

type ColorTheme = 'light' | 'dark' | 'match';

function setThemeAttributes(theme: ColorTheme) {
  document.documentElement.setAttribute('data-color-mode', theme);

  let themeAttribute = document.documentElement.getAttribute('data-theme') || '';
  themeAttribute = themeAttribute.replace('dark:dark', '').replace('light:light', '');

  themeAttribute = `${themeAttribute} ${theme}:${theme}`;
  document.documentElement.setAttribute('data-theme', themeAttribute.trim());
}

// get initial theme setting from storage
browser.storage.sync.get(['theme']).then((result) => {
  const selectedTheme: ColorTheme = result['theme'] || 'match';

  if (['light', 'dark'].includes(selectedTheme)) {
    setThemeAttributes(selectedTheme);
  } else {
    // match browser
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeAttributes('dark');
    } else {
      setThemeAttributes('light');
    }
  }
});

browser.storage.sync.onChanged.addListener((changes) => {
  const changedItems = Object.keys(changes);
  if (!changedItems.includes('theme')) return;

  const selectedTheme: ColorTheme | undefined = changes['theme']?.newValue;
  if (!selectedTheme) return;

  if (['light', 'dark'].includes(selectedTheme)) {
    setThemeAttributes(selectedTheme);
  } else {
    // match browser
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeAttributes('dark');
    } else {
      setThemeAttributes('light');
    }
  }
});

const colorSchemeMediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeMediaQueryList.addEventListener('change', async (event: MediaQueryListEvent) => {
  if (event.matches) {
    setThemeAttributes('dark');
  } else {
    setThemeAttributes('light');
  }
});

export function addThemeSelector(accountDropdownElement: Element) {
  if (accountDropdownElement.querySelector('.baguette-dropdown-section')) return; // already added

  const allGroupsElement = accountDropdownElement.querySelector('.css-4mjcmd');
  if (!allGroupsElement) throw new Error('Groups element not found!');

  const lastGroupElement = Array.from(allGroupsElement.querySelectorAll('.css-4mjcmd')).at(-1);
  if (!lastGroupElement) throw new Error('Last group element not found!');

  const groupWrapperElement = document.createElement('div');
  groupWrapperElement.classList.add('css-4mjcmd', 'baguette-dropdown-section');

  const groupElement = document.createElement('div');
  groupElement.setAttribute('role', 'group');
  groupElement.setAttribute('data-section', 'true');
  groupElement.setAttribute('aria-label', 'Theme');
  groupElement.classList.add('css-bc3sqp');
  groupWrapperElement.appendChild(groupElement);

  const groupTitleElement = document.createElement('div');
  groupTitleElement.classList.add('css-7857jj');
  groupTitleElement.setAttribute('data-ds--menu--heading-item', 'true');
  groupTitleElement.innerText = 'Theme';
  groupElement.appendChild(groupTitleElement);

  const themeSelectElement = document.createElement('div');
  themeSelectElement.classList.add('baguette-radio-group');
  themeSelectElement.setAttribute('role', 'radiogroup');
  const inputElements = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Match browser', value: 'match' }
  ].map((option) => {
    const labelElement = document.createElement('label');
    labelElement.classList.add('css-1kddo3z', 'baguette-radio-label');

    const inputElement = document.createElement('input');
    inputElement.name = 'themeMode';
    inputElement.type = 'radio';
    inputElement.classList.add('css-1v4ose0', 'baguette-radio-input');
    inputElement.value = option.value;
    inputElement.onclick = (event) => {
      browser.storage.sync.set({ theme: (event.currentTarget as HTMLInputElement).value });
    };
    labelElement.appendChild(inputElement);

    const spanElement = document.createElement('span');
    spanElement.classList.add('css-b9c6gp', 'baguette-radio-title');
    spanElement.innerText = option.name;
    labelElement.appendChild(spanElement);

    themeSelectElement.appendChild(labelElement);

    return inputElement;
  });
  groupElement.appendChild(themeSelectElement);

  allGroupsElement.insertBefore(groupWrapperElement, lastGroupElement);

  browser.storage.sync.get(['theme']).then((result) => {
    const theme: ColorTheme = result['theme'] || 'match';

    const inputElement = inputElements.find((input) => input.value === theme);
    if (inputElement) inputElement.checked = true;
  });
}
