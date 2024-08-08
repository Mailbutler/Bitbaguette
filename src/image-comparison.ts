import { createPinia } from 'pinia';
import { createApp } from 'vue';
import ImageComparisonModal from '@/components/ImageComparisonModal.vue';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { useMainStore } from './store';
import { ImageDiff, basicImageDiff, imageFileName } from './models/image-diff';
import { CSS_CLASSES } from './constants';

export function addImageComparisonModal() {
  console.debug('Adding image comparison modal…');

  const modalAnchorComponent = document.createElement('div');
  modalAnchorComponent.id = 'baguette-image-comparison-modal';
  document.body.appendChild(modalAnchorComponent);
  createApp(ImageComparisonModal)
    .use(createPinia())
    .use(createVuetify({ icons: { defaultSet: 'mdi', aliases, sets: { mdi } }, theme: { defaultTheme: 'light' } }))
    .mount('#baguette-image-comparison-modal');
}

export async function addImageComparisonButtons() {
  const imageDiffs: Promise<ImageDiff>[] = [];

  const firstImageDiffElements = Array.from(document.querySelectorAll('div[data-testid="image-diff"]:first-child'));
  const imageDiffWrappers = firstImageDiffElements.map((el) => el.parentElement!);
  if (imageDiffWrappers.length === 0) return;

  imageDiffWrappers.forEach((wrapperElement) => {
    const imageDiffElementPair = wrapperElement.querySelectorAll('div[data-testid="image-diff"] img');
    if (imageDiffElementPair.length !== 2) throw new Error('Image diff is not a pair!');

    const oldImageUrl = imageDiffElementPair[0].getAttribute('src');
    const newImageUrl = imageDiffElementPair[1].getAttribute('src');
    if (!(oldImageUrl && newImageUrl)) throw new Error('Failed to extract image URLs!');

    const imageDiff = basicImageDiff(oldImageUrl, newImageUrl);
    imageDiffs.push(imageDiff);

    // add button, if not present already
    if (!wrapperElement.querySelector(':scope .baguette-image-comparison-button')) {
      console.debug('Adding image comparison button…');

      const buttonWrapperElement = document.createElement('div');
      buttonWrapperElement.classList.add('baguette-image-comparison-button-wrapper');
      wrapperElement.appendChild(buttonWrapperElement);

      const buttonElement = document.createElement('button');
      buttonElement.classList.add('baguette-image-comparison-button', CSS_CLASSES.BUTTON);
      buttonElement.innerText = 'Compare';
      buttonElement.addEventListener('click', () => {
        const currentWrapperElement = buttonElement.closest("[data-testid^='file-content']");
        if (!currentWrapperElement) throw new Error('Button wrapper not found!');

        const currentDiffElementPair = currentWrapperElement.querySelectorAll('div[data-testid="image-diff"] img');
        if (currentDiffElementPair.length !== 2) throw new Error('Image diff is not a pair!');

        const oldImageUrl = currentDiffElementPair[0].getAttribute('src');
        const newImageUrl = currentDiffElementPair[1].getAttribute('src');
        if (!(oldImageUrl && newImageUrl)) throw new Error('Failed to extract image URLs!');

        const fileName = imageFileName(oldImageUrl);
        mainStore.setActiveImageDiffByFileName(fileName);
        mainStore.setShowDialog(true);
      });
      buttonWrapperElement.appendChild(buttonElement);
    }
  });

  const mainStore = useMainStore();
  mainStore.setImageDiffs(await Promise.all(imageDiffs));
}
