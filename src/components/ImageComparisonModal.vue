<template>
  <v-dialog v-if="hasImages" id="baguette-image-comparison-modal" v-model="showDialog" width="auto">
    <v-card class="bg-grey-lighten-2">
      <template v-if="selectedImageDiff">
        <v-row>
          <v-btn :icon="mdiArrowLeft" color="primary" :disabled="atBeginning" @click="previous" />
          <v-col>
            <v-tabs v-model="tab" align-tabs="center" :disabled="!hasImages" color="primary">
              <v-tab value="current">Before</v-tab>
              <v-tab value="proposed">After</v-tab>
              <v-tab value="slider">Slider</v-tab>
              <v-tab value="diff">
                Diff
                <v-badge
                  v-if="selectedImageDiff.rawMisMatchPercentage"
                  :content="
                    Number(selectedImageDiff.rawMisMatchPercentage / 100).toLocaleString(undefined, {
                      style: 'percent',
                      minimumFractionDigits: 2
                    })
                  "
                  color="error"
                />
              </v-tab>
            </v-tabs>

            <v-window v-model="tab">
              <v-window-item value="current" class="bg-grey-lighten-1 rounded">
                <div class="d-flex">
                  <img :src="selectedImageDiff.oldDataUrl" :style="`max-width:${selectedImageDiff.width}px;`" />
                </div>
              </v-window-item>

              <v-window-item value="proposed" class="bg-grey-lighten-1 rounded">
                <div class="d-flex">
                  <img :src="selectedImageDiff.newDataUrl" :style="`max-width:${selectedImageDiff.width}px;`" />
                </div>
              </v-window-item>

              <v-window-item value="slider" class="bg-grey-lighten-1 rounded">
                <div class="d-flex">
                  <ImgComparisonSlider :style="`max-width:${selectedImageDiff.width}px;`">
                    <!-- eslint-disable -->
                    <img slot="first" :src="selectedImageDiff.oldDataUrl" />
                    <img slot="second" :src="selectedImageDiff.newDataUrl" />
                    <!-- eslint-enable -->
                  </ImgComparisonSlider>
                </div>
              </v-window-item>

              <v-window-item value="diff" class="bg-grey-lighten-1 rounded">
                <div class="d-flex">
                  <img :src="selectedImageDiff.diffDataUrl" :style="`max-width:${selectedImageDiff.width}px;`" />
                </div>
              </v-window-item>
            </v-window>
          </v-col>
          <v-btn :icon="mdiArrowRight" color="primary" :disabled="atEnd" @click="next" />
        </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '@/store';
import { ImgComparisonSlider } from '@img-comparison-slider/vue';

import { mdiArrowRight, mdiArrowLeft } from '@mdi/js';
import { mapStores } from 'pinia';
import { ImageDiff } from '../models/image-diff';

export default defineComponent({
  name: 'ImageComparisonModal',
  components: { ImgComparisonSlider },
  data: () => ({
    selectedImageDiffIndex: 0,
    tab: 'slider',
    mdiArrowRight,
    mdiArrowLeft
  }),
  computed: {
    ...mapStores(useMainStore),
    showDialog: {
      get(): boolean {
        return this.mainStore.showDialog;
      },
      set(show: boolean) {
        this.mainStore.setShowDialog(show);
      }
    },
    selectedImageDiff: {
      get(): ImageDiff | undefined {
        if (this.selectedImageDiffIndex === -1) return;

        return this.mainStore.imageDiffs[this.selectedImageDiffIndex];
      },
      set(newImageDiff: ImageDiff) {
        this.selectedImageDiffIndex = this.mainStore.imageDiffs.findIndex(
          (imageDiff) => imageDiff.fileName === newImageDiff.fileName
        );
      }
    },
    hasImages(): boolean {
      return this.mainStore.imageDiffs.length > 0;
    },
    atBeginning(): boolean {
      return this.selectedImageDiffIndex <= 0;
    },
    atEnd(): boolean {
      return this.selectedImageDiffIndex >= this.mainStore.imageDiffs.length - 1;
    }
  },
  watch: {
    selectedImageDiff: {
      immediate: true,
      handler: function (newImageDiff: ImageDiff | undefined) {
        if (newImageDiff && !newImageDiff.diffDataUrl) {
          this.mainStore.computeDiff(newImageDiff);
        }
      }
    }
  },
  async mounted() {
    document.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    onKeydown(e: KeyboardEvent) {
      if (this.selectedImageDiff) {
        if (e.keyCode === 37 && !this.atBeginning) {
          this.previous();
        } else if (e.keyCode === 39 && !this.atEnd) {
          this.next();
        }
      }
    },
    previous() {
      if (this.selectedImageDiffIndex <= 0) return;

      this.selectedImageDiffIndex--;
    },
    next() {
      if (this.selectedImageDiffIndex >= this.mainStore.imageDiffs.length - 1) return;

      this.selectedImageDiffIndex++;
    }
  }
});
</script>

<style lang="scss" scoped>
#baguette-image-comparison-modal {
  .v-row {
    align-items: center;
    gap: 16px;
    margin: -12px 8px;
  }

  .v-tabs {
    min-width: 600px;
  }

  .v-tab {
    &::v-deep .v-badge__badge {
      bottom: unset !important;
      left: 130% !important;
      top: -22px;
    }
  }

  img-comparison-slider {
    --divider-width: 2px;
    --divider-color: #7b1fa2;
    --default-handle-opacity: 0.3;
  }

  img-comparison-slider,
  img {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
