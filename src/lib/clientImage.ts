// Browser-only helpers for uploading payment screenshots / receipts.
// Vercel rejects request bodies over ~4.5MB, and phone screenshots are often bigger, so
// images are resized and re-encoded as JPEG before upload.

/** Largest upload we send to the server (stays under Vercel's 4.5MB request limit). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const MAX_DIMENSION = 2000;
const SHRINK_ABOVE_BYTES = 1.5 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

/**
 * Returns a smaller JPEG for large images; returns the file unchanged for PDFs, small images,
 * or formats the browser can't decode (e.g. HEIC outside Safari).
 */
export async function shrinkImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= SHRINK_ABOVE_BYTES) return file;
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // transparent PNG areas become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
  } catch {
    // Fall through and let the size check decide
  }
  return file;
}

/** Reads a JSON response, turning non-JSON errors (e.g. Vercel's "Request Entity Too Large") into a clear message. */
export async function readJsonResponse(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 413) {
      return { success: false, error: "The file is too large. Please upload a smaller screenshot or photo (under 4MB)." };
    }
    return { success: false, error: `Upload failed (error ${res.status}). Please try again.` };
  }
}
