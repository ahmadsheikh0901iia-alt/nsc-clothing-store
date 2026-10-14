import { MAX_UPLOAD_BYTES } from './images';

/** Resize on the phone before POSTing, including multipart headroom below 4.5 MB. */
export async function prepareUpload(file) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG, WebP or AVIF image.');
  }
  if (file.size > 20 * 1024 * 1024) throw new Error('Please choose an image smaller than 20 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('This image could not be read. Please export it as JPG or WebP.'));
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('This image is empty.');
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image preparation failed. Please try a smaller JPG.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const extension = blob.type === 'image/webp' ? 'webp' : 'png';
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: blob.type });
      }
    }
    throw new Error('Please choose a smaller image; the upload must be under 4 MB.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
