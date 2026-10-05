/**
 * Client-side high-fidelity image compression utility
 * Prevents HTTP 413 (Payload Too Large) by resizing and compressing
 * raw camera/DSLR photos before upload.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Automatically downscales oversized dimensions (default max 2048px)
 * and encodes to lightweight WebP/JPEG format.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  // SVGs, GIFs, and non-images shouldn't be re-compressed via Canvas
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    maxSizeMB = 1.8,
  } = options;

  // If already under 350KB and already webp/jpeg with reasonable size, skip
  if (file.size < 350 * 1024 && (file.type === "image/webp" || file.type === "image/jpeg")) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          // If 2d context fails, return original
          resolve(file);
          return;
        }

        // Fill background with white for transparency safety if converting to jpeg
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Draw image with high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Attempt WebP encoding first (widely supported & superior compression)
        const mimeType = "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Check if compression helped or if we need further quality step
            const maxBytes = maxSizeMB * 1024 * 1024;
            if (blob.size > maxBytes && quality > 0.5) {
              // Retry with lower quality
              canvas.toBlob(
                (secondBlob) => {
                  if (secondBlob) {
                    const finalName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    resolve(new File([secondBlob], finalName, { type: mimeType }));
                  } else {
                    const finalName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    resolve(new File([blob], finalName, { type: mimeType }));
                  }
                },
                mimeType,
                0.7
              );
              return;
            }

            const finalName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], finalName, { type: mimeType });

            // Only use compressed if it's smaller than the original
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
