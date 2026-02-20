export function blobToImageElement(blob: Blob): HTMLImageElement {
  const blobUrl = URL.createObjectURL(blob);

  const img = new Image();
  img.src = blobUrl;

  return img;
}
