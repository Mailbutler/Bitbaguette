import { createPinia } from 'pinia';
import { createApp } from 'vue';
import ImageComparisonModal from '@/components/ImageComparisonModal.vue';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { useMainStore } from './store';
import { ImageDiff, basicImageDiff } from './models/image-diff';
import { CSS_CLASSES } from './constants';

export function addImageComparisonModal() {
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

  const imageDiffElements = Array.from(document.querySelectorAll(CSS_CLASSES.IMAGE_DIFF));
  imageDiffElements.forEach((imageDiffElement) => {
    const imageDiffElementPair = imageDiffElement.querySelectorAll('div[data-testid="image-diff"] img');
    if (imageDiffElementPair.length !== 2) throw new Error('Image diff is not a pair!');

    imageDiffs.push(
      basicImageDiff(imageDiffElementPair[0].getAttribute('src')!, imageDiffElementPair[1].getAttribute('src')!)
    );

    // add button, if not present already
    if (!imageDiffElement.querySelector(':scope .baguette-image-comparison-button')) {
      const buttonWrapperElement = document.createElement('div');
      buttonWrapperElement.classList.add('baguette-image-comparison-button-wrapper');
      imageDiffElement.appendChild(buttonWrapperElement);

      const buttonElement = document.createElement('button');
      buttonElement.classList.add('baguette-image-comparison-button', CSS_CLASSES.BUTTON);
      buttonElement.innerHTML = `<span>Compare</span>`;
      buttonElement.addEventListener('click', () => {
        mainStore.setActiveImageDiff(imageDiffElementPair[0].getAttribute('src')!);
        mainStore.setShowDialog(true);
      });
      buttonWrapperElement.appendChild(buttonElement);
    }
  });
  if (imageDiffElements.length === 0) return;

  const mainStore = useMainStore();
  mainStore.setImageDiffs(await Promise.all(imageDiffs));
}
