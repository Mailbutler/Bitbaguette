import { extendImageDiff, ImageDiff } from '@/models/image-diff';
import { defineStore } from 'pinia';

export type RootState = {
  _showDialog: boolean;
  _imageDiffs: ImageDiff[];
  _activeImageDiffIndex: number;
  _pendingExtendedImageDiff: boolean;
};

export const useMainStore = defineStore({
  id: 'main',
  state: () =>
    ({
      _showDialog: false,
      _imageDiffs: [],
      _activeImageDiffIndex: 0,
      _pendingExtendedImageDiff: false
    }) as RootState,

  getters: {
    showDialog: (state) => state._showDialog,
    imageDiffs: (state) => state._imageDiffs,
    activeImageDiffIndex: (state) => state._activeImageDiffIndex,
    pendingExtendedImageDiff: (state) => state._pendingExtendedImageDiff
  },

  actions: {
    setShowDialog(show: boolean) {
      this._showDialog = show;
    },
    setImageDiffs(imageDiffs: ImageDiff[]) {
      this._imageDiffs = imageDiffs;
    },
    setActiveImageDiffIndex(index: number) {
      this._activeImageDiffIndex = index;
    },
    setActiveImageDiffByFileName(fileName: string) {
      this._activeImageDiffIndex = this._imageDiffs.findIndex((imageDiff) => imageDiff.fileName == fileName);
      if (this._activeImageDiffIndex === -1) throw new Error(`Failed to find image diff for ${fileName}`);
    },
    async computeDiff(imageDiff: ImageDiff): Promise<void> {
      try {
        this._pendingExtendedImageDiff = false;

        await extendImageDiff(imageDiff);
      } finally {
        this._pendingExtendedImageDiff = false;
      }
    }
  }
});
