/**
 * Utility functions for SVG math, snapping, points generation, and stall renumbering
 */

export const applySnap = (val: number, snapToGrid: boolean, gridSize: number): number => {
  if (!snapToGrid) return Math.round(val);
  return Math.round(val / gridSize) * gridSize;
};

export const getSvgCoordinates = (
  e: MouseEvent | React.MouseEvent<any>,
  svg: SVGSVGElement | null,
  canvasWidth: number,
  canvasHeight: number,
  snapToGrid: boolean = true,
  gridSize: number = 10,
  isPencil: boolean = false
): { x: number; y: number } => {
  if (!svg) return { x: 0, y: 0 };

  let rawX: number | null = null;
  let rawY: number | null = null;

  // Method 1: Exact SVG Matrix transformation (accounts for scroll, zoom, aspect ratio & retina DPI)
  if (typeof svg.getScreenCTM === "function") {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(ctm.inverse());
      rawX = svgPt.x;
      rawY = svgPt.y;
    }
  }

  // Method 2: Fallback to bounding client rect
  if (rawX === null || rawY === null) {
    const rect = svg.getBoundingClientRect();
    const scaleX = canvasWidth / (rect.width || 1);
    const scaleY = canvasHeight / (rect.height || 1);
    rawX = (e.clientX - rect.left) * scaleX;
    rawY = (e.clientY - rect.top) * scaleY;
  }

  const clampedX = Math.max(0, Math.min(canvasWidth, rawX));
  const clampedY = Math.max(0, Math.min(canvasHeight, rawY));

  return {
    x: isPencil ? Math.round(clampedX) : applySnap(clampedX, snapToGrid, gridSize),
    y: isPencil ? Math.round(clampedY) : applySnap(clampedY, snapToGrid, gridSize),
  };
};

export const getPencilPathData = (points: { x: number; y: number }[]): string => {
  if (!points || points.length === 0) return "";
  return points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");
};

export const getNextStallNumber = (
  currentNumber: string,
  existingNumbers: Set<string>
): string => {
  if (!currentNumber || currentNumber.trim() === "") return "";
  const match = currentNumber.match(/^(.*?)(\d+)$/);
  let prefix = "";
  let num = 1;
  let digits = 1;

  if (match) {
    prefix = match[1];
    num = parseInt(match[2], 10);
    digits = match[2].length;
  } else {
    prefix = currentNumber.trim() + " ";
    num = 1;
    digits = 1;
  }

  let nextNum = num + 1;
  while (true) {
    const formatted = `${prefix}${String(nextNum).padStart(digits, "0")}`;
    if (!existingNumbers.has(formatted)) {
      return formatted;
    }
    nextNum++;
  }
};

export const generateRegularPolygonPoints = (
  sides: number,
  centerX: number,
  centerY: number,
  radius: number = 60,
  snapToGrid: boolean = true,
  gridSize: number = 10
): { x: number; y: number }[] => {
  const pts: { x: number; y: number }[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const offsetAngle = -Math.PI / 2;

  for (let i = 0; i < sides; i++) {
    const angle = offsetAngle + i * angleStep;
    pts.push({
      x: applySnap(Math.round(centerX + radius * Math.cos(angle)), snapToGrid, gridSize),
      y: applySnap(Math.round(centerY + radius * Math.sin(angle)), snapToGrid, gridSize),
    });
  }

  return pts;
};
