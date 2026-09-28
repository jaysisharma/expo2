import { useEffect, useRef } from "react";
import { CanvasElement, ToolType } from "../types";

interface UseKeyboardShortcutsParams {
  elementsRef: React.MutableRefObject<CanvasElement[]>;
  selectedIdsRef: React.MutableRefObject<string[]>;
  moveSelectedBy: (dx: number, dy: number) => void;
  currentPolygonPoints: { x: number; y: number }[];
  finishPolygon: (pts?: { x: number; y: number }[]) => void;
  setCurrentPolygonPoints: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
  setPolygonHoverPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  deleteSelected: () => void;
  duplicateSelected: (direction?: "right" | "left" | "down" | "up" | "auto") => void;
  saveToStorage: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleUndo: () => void;
  handleRedo: () => void;
  setActiveTool: (tool: ToolType) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  recordHistory: (newElements: CanvasElement[]) => void;
  notify: (msg: string) => void;
}

export function useKeyboardShortcuts({
  elementsRef,
  selectedIdsRef,
  moveSelectedBy,
  currentPolygonPoints,
  finishPolygon,
  setCurrentPolygonPoints,
  setPolygonHoverPos,
  deleteSelected,
  duplicateSelected,
  saveToStorage,
  setSelectedIds,
  handleUndo,
  handleRedo,
  setActiveTool,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  recordHistory,
  notify,
}: UseKeyboardShortcutsParams) {
  const pressedArrowKeys = useRef<{ [key: string]: boolean }>({});
  const isHoldingArrow = useRef<boolean>(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const tick = () => {
      const keys = pressedArrowKeys.current;
      let dx = 0;
      let dy = 0;

      const isShift = keys["Shift"];
      const speed = isShift ? 6 : 1; // 1px/frame pixel-wise (or 6px/frame with Shift)

      if (keys["ArrowUp"]) dy -= speed;
      if (keys["ArrowDown"]) dy += speed;
      if (keys["ArrowLeft"]) dx -= speed;
      if (keys["ArrowRight"]) dx += speed;

      if (dx !== 0 || dy !== 0) {
        moveSelectedBy(dx, dy);
        isHoldingArrow.current = true;
      }

      const hasActiveArrow =
        keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];

      if (hasActiveArrow) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        animationFrameId = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 0. ACTIVE POLYGON DRAWING SHORTCUTS
      if (currentPolygonPoints.length > 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (currentPolygonPoints.length >= 3) {
            finishPolygon();
          } else {
            notify("Need at least 3 vertices to finish polygon");
          }
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          setCurrentPolygonPoints([]);
          setPolygonHoverPos(null);
          notify("Cancelled polygon drawing");
          return;
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          setCurrentPolygonPoints((prev) => prev.slice(0, -1));
          return;
        }
      }

      // 1. DELETE / BACKSPACE
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      }

      // 1.5. SMART DUPLICATE (Ctrl+D / Cmd+D)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          duplicateSelected("auto");
        }
      }

      // 1.8. SAVE (Ctrl+S / Cmd+S)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToStorage();
      }

      // 2. SELECT ALL (Ctrl+A / Cmd+A)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elementsRef.current.map((e) => e.id));
        notify(`Selected all ${elementsRef.current.length} elements`);
      }

      // 3. UNDO (Ctrl+Z)
      else if (isCmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // 4. REDO (Ctrl+Y or Ctrl+Shift+Z)
      else if (
        (isCmdOrCtrl && e.key.toLowerCase() === "y") ||
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }

      // 5. ESCAPE (Deselect)
      else if (e.key === "Escape") {
        setSelectedIds([]);
        setActiveTool("select");
      }

      // 6. Z-INDEX LAYERING ( ] / [ / Shift+] / Shift+[ / Ctrl+] / Ctrl+[ )
      else if (e.key === "]" || e.key === "}") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey || isCmdOrCtrl) {
            bringToFront();
          } else {
            bringForward();
          }
        }
      } else if (e.key === "[" || e.key === "{") {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey || isCmdOrCtrl) {
            sendToBack();
          } else {
            sendBackward();
          }
        }
      }

      // 6.5. DIRECTIONAL FLUSH DUPLICATE (Alt + Arrow Keys)
      else if (
        e.altKey &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.key === "ArrowRight") duplicateSelected("right");
          else if (e.key === "ArrowLeft") duplicateSelected("left");
          else if (e.key === "ArrowDown") duplicateSelected("down");
          else if (e.key === "ArrowUp") duplicateSelected("up");
        }
      }

      // 7. ARROW KEYS MOVEMENT (Pixel-by-pixel precision + Fluid continuous holding)
      else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        if (selectedIdsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey) pressedArrowKeys.current["Shift"] = true;

          // Initial immediate single pixel step
          if (!pressedArrowKeys.current[e.key]) {
            pressedArrowKeys.current[e.key] = true;
            const singleStep = e.shiftKey ? 10 : 1;
            let initialDx = 0;
            let initialDy = 0;
            if (e.key === "ArrowUp") initialDy = -singleStep;
            if (e.key === "ArrowDown") initialDy = singleStep;
            if (e.key === "ArrowLeft") initialDx = -singleStep;
            if (e.key === "ArrowRight") initialDx = singleStep;
            moveSelectedBy(initialDx, initialDy);
          }

          // Start continuous 60fps frame loop
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(tick);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Shift"
      ) {
        delete pressedArrowKeys.current[e.key];
        const remaining =
          pressedArrowKeys.current["ArrowUp"] ||
          pressedArrowKeys.current["ArrowDown"] ||
          pressedArrowKeys.current["ArrowLeft"] ||
          pressedArrowKeys.current["ArrowRight"];

        if (!remaining) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          if (isHoldingArrow.current) {
            isHoldingArrow.current = false;
            recordHistory(elementsRef.current);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [
    moveSelectedBy,
    currentPolygonPoints,
    deleteSelected,
    finishPolygon,
    handleRedo,
    handleUndo,
    saveToStorage,
    duplicateSelected,
    setSelectedIds,
    setActiveTool,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    recordHistory,
    notify,
    elementsRef,
    selectedIdsRef,
    setCurrentPolygonPoints,
    setPolygonHoverPos,
  ]);
}
