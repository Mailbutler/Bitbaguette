import { arrayBufferToDataUrl, imageDimensions } from '@/utils';
import Resemble from 'resemblejs';

export interface ImageDiff {
  fileName: string;

  width: number;
  height: number;

  oldImageUrl: string;
  newImageUrl: string;

  oldDataUrl: string;
  newDataUrl: string;

  diffDataUrl?: string;
  rawMisMatchPercentage?: number;
}

export function imageFileName(imageUrl: string): string {
  return imageUrl.split('/').pop() || imageUrl;
}

export async function basicImageDiff(oldImageUrl: string, newImageUrl: string): Promise<ImageDiff> {
  const fileDataResponses = await Promise.all(
    [oldImageUrl, newImageUrl].map(async (url) => {
      const response = await fetch(url);
      return response.arrayBuffer();
    })
  );

  const oldFileData: ArrayBuffer = fileDataResponses[0];
  const newFileData: ArrayBuffer = fileDataResponses[1];

  const fileName = newImageUrl.split('/').pop() || newImageUrl;

  const oldDataUrl = arrayBufferToDataUrl(oldFileData);
  const newDataUrl = arrayBufferToDataUrl(newFileData);

  const { width, height } = await imageDimensions(newDataUrl);

  return {
    fileName,
    width,
    height,

    oldImageUrl,
    newImageUrl,

    oldDataUrl,
    newDataUrl
  };
}

function comparisonResult(
  image1: string | ImageData | Buffer,
  image2: string | ImageData | Buffer,
  options: Resemble.ComparisonOptions | Resemble.ComparisonCallback
): Promise<Resemble.ComparisonResult> {
  return new Promise<Resemble.ComparisonResult>((resolve, reject) => {
    Resemble.compare(image1, image2, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function extendImageDiff(imageDiff: ImageDiff): Promise<ImageDiff> {
  const diffResult = await comparisonResult(imageDiff.oldDataUrl, imageDiff.newDataUrl, {
    output: {
      transparency: 0.3,
      useCrossOrigin: false
    }
  });

  imageDiff.diffDataUrl = diffResult.getImageDataUrl();
  imageDiff.rawMisMatchPercentage = diffResult.rawMisMatchPercentage;

  return imageDiff;
}
