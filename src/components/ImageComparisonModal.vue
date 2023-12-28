<template>
  <v-dialog v-if="hasImages" id="baguette-image-comparison-modal" v-model="showDialog" width="auto">
    <v-card class="bg-grey-lighten-2">
      <div v-if="selectedImageDiff" class="baguette-modal-content">
        <v-btn
          v-if="!atBeginning"
          class="baguette-button baguette-button-prev"
          :icon="mdiArrowLeft"
          color="amber"
          elevation="2"
          @click="previous"
        />
        <v-btn
          v-if="!atEnd"
          class="baguette-button baguette-button-next"
          :icon="mdiArrowRight"
          color="amber"
          elevation="2"
          @click="next"
        />

        <v-tabs v-model="tab" align-tabs="center" :disabled="!hasImages" grow fixed-tabs bg-color="amber">
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
      </div>
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

import { VDialog } from 'vuetify/components/VDialog';
import { VCard } from 'vuetify/components/VCard';
import { VBtn } from 'vuetify/components/VBtn';
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTabs, VTab } from 'vuetify/components/VTabs';
import { VBadge } from 'vuetify/components/VBadge';
import { VWindow, VWindowItem } from 'vuetify/components/VWindow';

export default defineComponent({
  name: 'ImageComparisonModal',
  components: { VDialog, VCard, VRow, VCol, VBtn, VTabs, VTab, VBadge, VWindow, VWindowItem, ImgComparisonSlider },
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
  .baguette-modal-content {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    .baguette-button {
      position: absolute;
      z-index: 42;
      top: 8px;

      &.baguette-button-prev {
        left: 8px;
      }

      &.baguette-button-next {
        right: 8px;
      }
    }
  }

  .v-tabs {
    flex-shrink: 0;

    .v-tab {
      :deep(.v-badge__badge) {
        bottom: unset !important;
        left: 150% !important;
        top: -22px;
      }
    }
  }

  .v-window {
    overflow: auto;
  }

  img-comparison-slider {
    --divider-width: 3px;
    --divider-color: rgb(255, 193, 7);
    --default-handle-opacity: 0.8;
  }

  img-comparison-slider,
  img {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
