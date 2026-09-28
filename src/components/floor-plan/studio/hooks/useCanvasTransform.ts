import { useState, useEffect, useCallback, RefObject } from "react";
import { CanvasElement } from "../types";
import { getSvgCoordinates, applySnap } from "../utils";

interface UseCanvasTransformParams {
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedIds: string[];
  snapToGrid: boolean;
  gridSize: number;
  recordHistory: (newElements: CanvasElement[]) => void;
}

export function useCanvasTransform({
  svgRef,
  canvasWidth,
  canvasHeight,
  elements,
  setElements,
  selectedIds,
  snapToGrid,
  gridSize,
  recordHistory,
}: UseCanvasTransformParams) {
  // Dragging, Resizing & Rotating State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [initialAngleOffset, setInitialAngleOffset] = useState<number>(0);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState<CanvasElement | null>(null);
  const [initialMultiPosMap, setInitialMultiPosMap] = useState<{
    [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } };
  }>({});

  const selectedElements = elements.filter((i) => selectedIds.includes(i.id));
  const primarySelected = selectedElements[0] || null;

  const getCoordinates = useCallback(
    (e: MouseEvent | React.MouseEvent<any>) => {
      return getSvgCoordinates(e, svgRef.current, canvasWidth, canvasHeight, snapToGrid, gridSize);
    },
    [snapToGrid, gridSize, canvasWidth, canvasHeight, svgRef]
  );

  // Global mouse tracking for Dragging, Resizing & Rotating
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const currentPos = getCoordinates(e);

      // 1. Dragging Multiple or Single Elements
      if (isDragging && selectedIds.length > 0 && initialElementState) {
        let dx = currentPos.x - dragStartPos.x;
        let dy = currentPos.y - dragStartPos.y;

        // Shift key locks drag into strict horizontal or vertical line
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) {
            dy = 0;
          } else {
            dx = 0;
          }
        }

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id) && initialMultiPosMap[el.id]) {
              const basePos = initialMultiPosMap[el.id];
              const newX = applySnap(basePos.x + dx, snapToGrid, gridSize);
              const newY = applySnap(basePos.y + dy, snapToGrid, gridSize);
              const shiftX = newX - basePos.x;
              const shiftY = newY - basePos.y;

              const updatedEl: CanvasElement = {
                ...el,
                x: newX,
                y: newY,
              };

              if (basePos.points) {
                updatedEl.points = basePos.points.map((pt) => ({
                  x: pt.x + shiftX,
                  y: pt.y + shiftY,
                }));
              }

              if (basePos.arcControl) {
                updatedEl.arcControl = {
                  x: basePos.arcControl.x + shiftX,
                  y: basePos.arcControl.y + shiftY,
                };
              }

              return updatedEl;
            }
            return el;
          })
        );
      }

      // 2. Resizing (Primary Selected)
      else if (isResizing && primarySelected && initialElementState) {
        const dx = currentPos.x - dragStartPos.x;
        const dy = currentPos.y - dragStartPos.y;

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id)) {
              let newW = el.width;
              let newH = el.height;
              let newX = el.x;
              let newY = el.y;

              const base = initialElementState;

              if (isResizing.includes("e")) newW = Math.max(20, applySnap(base.width + dx, snapToGrid, gridSize));
              if (isResizing.includes("s")) newH = Math.max(20, applySnap(base.height + dy, snapToGrid, gridSize));
              if (isResizing.includes("w")) {
                const calculatedW = base.width - dx;
                if (calculatedW > 20) {
                  newW = applySnap(calculatedW, snapToGrid, gridSize);
                  newX = applySnap(base.x + dx, snapToGrid, gridSize);
                }
              }
              if (isResizing.includes("n")) {
                const calculatedH = base.height - dy;
                if (calculatedH > 20) {
                  newH = applySnap(calculatedH, snapToGrid, gridSize);
                  newY = applySnap(base.y + dy, snapToGrid, gridSize);
                }
              }

              return { ...el, x: newX, y: newY, width: newW, height: newH };
            }
            return el;
          })
        );
      }

      // 3. Rotating (Smooth 1° Precision with Zero Jumping Delta Offset)
      else if (isRotating && primarySelected && initialElementState && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = canvasWidth / rect.width;
        const scaleY = canvasHeight / rect.height;
        const rawMouseX = (e.clientX - rect.left) * scaleX;
        const rawMouseY = (e.clientY - rect.top) * scaleY;

        const centerX = initialElementState.x + initialElementState.width / 2;
        const centerY = initialElementState.y + initialElementState.height / 2;
        const currentAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
        let deg = Math.round(currentAngle - initialAngleOffset);

        while (deg > 180) deg -= 360;
        while (deg <= -180) deg += 360;

        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }

        setElements((prev) =>
          prev.map((el) => {
            if (selectedIds.includes(el.id)) return { ...el, rotation: deg };
            return el;
          })
        );
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        setIsDragging(false);
        setIsResizing(null);
        setIsRotating(false);
        setInitialElementState(null);
        setInitialMultiPosMap({});
        recordHistory(elements);
      }
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    isRotating,
    selectedIds,
    primarySelected,
    initialElementState,
    initialMultiPosMap,
    dragStartPos,
    getCoordinates,
    elements,
    snapToGrid,
    gridSize,
    canvasWidth,
    canvasHeight,
    recordHistory,
    setElements,
    svgRef,
    initialAngleOffset,
  ]);

  return {
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    isRotating,
    setIsRotating,
    initialAngleOffset,
    setInitialAngleOffset,
    dragStartPos,
    setDragStartPos,
    initialElementState,
    setInitialElementState,
    initialMultiPosMap,
    setInitialMultiPosMap,
    getCoordinates,
  };
}
