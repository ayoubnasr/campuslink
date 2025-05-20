/**
 * Make sure to input the baseDir as follows: "/path/to/files"
 */
export function preloadImageFrames(baseDir, frameCount) {
    const images = [];
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `${baseDir}/frame${i.toString().padStart(4, '0')}.png`;
      images.push(img);
    }
    return images;
};