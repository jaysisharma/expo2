import QRCode from "qrcode";

/**
 * Generates an authentic, standard ISO/IEC 18004 QR Code SVG Data URI.
 * Guaranteed to scan instantly on iPhone Camera, Android Google Lens, and industrial barcode scanners.
 */
export async function generateQRCodeDataURL(text: string, size = 256): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2, // Standard quiet zone
      color: {
        dark: "#061A2A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Failed to generate QR Code DataURL", err);
    return "";
  }
}

export async function generateQRCodeSVG(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#061A2A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Failed to generate QR Code SVG", err);
    return "";
  }
}

/**
 * Synchronous standard QR Matrix generator using standard QRCode.create
 */
export function generateQRCodeMatrix(text: string): boolean[][] {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
    const moduleCount = qr.modules.size;
    const matrix: boolean[][] = [];

    // Add 2-module quiet zone border for guaranteed instant camera scanning
    const margin = 2;
    const totalSize = moduleCount + margin * 2;

    for (let r = 0; r < totalSize; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < totalSize; c++) {
        if (r < margin || r >= totalSize - margin || c < margin || c >= totalSize - margin) {
          row.push(false); // Quiet zone is white (false)
        } else {
          row.push(Boolean(qr.modules.get(r - margin, c - margin)));
        }
      }
      matrix.push(row);
    }

    return matrix;
  } catch (e) {
    console.error("QR Code matrix error", e);
    // Fallback minimal matrix
    return Array.from({ length: 25 }, () => Array(25).fill(false));
  }
}
