import { useRef, useCallback } from "react";
import { CanvasElement, PRESET_CATEGORIES } from "../types";
import { getNextStallNumber } from "../utils";

interface UseCanvasBatchOpsParams {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedElements: CanvasElement[];
  batchPrefix: string;
  batchStartNum: number;
  recordHistory: (newElements: CanvasElement[]) => void;
  notify: (msg: string) => void;
  selectedIdsRef: React.MutableRefObject<string[]>;
}

export function useCanvasBatchOps({
  elements,
  setElements,
  selectedIds,
  setSelectedIds,
  selectedElements,
  batchPrefix,
  batchStartNum,
  recordHistory,
  notify,
  selectedIdsRef,
}: UseCanvasBatchOpsParams) {
  const lastDuplicateDirection = useRef<"right" | "left" | "down" | "up">("right");

  const updateSelectedBatch = (
    updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)
  ) => {
    if (selectedIds.length === 0) return;
    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        const patch = typeof updates === "function" ? updates(el) : updates;
        return { ...el, ...patch };
      }
      return el;
    });
    recordHistory(updated);
  };

  const handleBatchRenumber = () => {
    if (selectedIds.length === 0) return;
    const prefix = batchPrefix.trim() || "C";
    const start = batchStartNum || 1;

    // Sort selected items top-to-bottom then left-to-right
    const sorted = [...selectedElements].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
      return a.x - b.x;
    });

    const labelMap: { [id: string]: string } = {};
    sorted.forEach((el, idx) => {
      labelMap[el.id] = `${prefix}${start + idx}`;
    });

    const updated = elements.map((el) => {
      if (labelMap[el.id]) {
        return { ...el, number: labelMap[el.id] };
      }
      return el;
    });

    recordHistory(updated);
    notify(`Sequentially renumbered ${sorted.length} stalls (${prefix}${start} ... ${prefix}${start + sorted.length - 1})`);
  };

  const applyCategoryPreset = (cat: (typeof PRESET_CATEGORIES)[0]) => {
    updateSelectedBatch({
      category: cat.name,
      dimensions: cat.defaultDim,
      sizeSqM: cat.sqm,
      sizeSqFt: Math.round(cat.sqm * 10.764),
      priceNPR: cat.npr,
      priceUSD: cat.usd,
      color: cat.color === "transparent" ? "transparent" : cat.color,
      fillOpacity: cat.color === "transparent" ? 0 : cat.fillOpacity,
      borderColor: cat.border,
      textColor: cat.color === "transparent" ? cat.border : "#FFFFFF",
      width: cat.defaultW,
      height: cat.defaultH,
    });
    notify(`Applied ${cat.name} to ${selectedIds.length} stall(s)`);
  };

  const alignSelected = (mode: "left" | "top" | "center-x" | "center-y" | "distribute-h" | "distribute-v") => {
    if (selectedElements.length < 2) return;

    if (mode === "left") {
      const minX = Math.min(...selectedElements.map((e) => e.x));
      updateSelectedBatch({ x: minX });
      notify("Aligned Left");
    } else if (mode === "top") {
      const minY = Math.min(...selectedElements.map((e) => e.y));
      updateSelectedBatch({ y: minY });
      notify("Aligned Top");
    } else if (mode === "center-x") {
      const avgCenterX = Math.round(
        selectedElements.reduce((acc, e) => acc + e.x + e.width / 2, 0) / selectedElements.length
      );
      updateSelectedBatch((el) => ({ x: avgCenterX - el.width / 2 }));
      notify("Aligned Center X");
    } else if (mode === "center-y") {
      const avgCenterY = Math.round(
        selectedElements.reduce((acc, e) => acc + e.y + e.height / 2, 0) / selectedElements.length
      );
      updateSelectedBatch((el) => ({ y: avgCenterY - el.height / 2 }));
      notify("Aligned Center Y");
    } else if (mode === "distribute-h") {
      const sorted = [...selectedElements].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x;
      const step = (maxX - minX) / (sorted.length - 1);
      const posMap: { [id: string]: number } = {};
      sorted.forEach((el, i) => {
        posMap[el.id] = Math.round(minX + i * step);
      });
      updateSelectedBatch((el) => ({ x: posMap[el.id] ?? el.x }));
      notify("Distributed Horizontally");
    }
  };

  const duplicateSelected = (direction: "right" | "left" | "down" | "up" | "auto" = "auto") => {
    if (selectedIds.length === 0) return;

    const actualDirection = direction === "auto" ? lastDuplicateDirection.current : direction;
    lastDuplicateDirection.current = actualDirection;

    const currentSelected = elements.filter((el) => selectedIds.includes(el.id));
    if (currentSelected.length === 0) return;

    const primary = currentSelected[0];
    const angleDeg = primary.rotation || 0;
    const rad = (angleDeg * Math.PI) / 180;

    let dx = 0;
    let dy = 0;

    if (currentSelected.length === 1) {
      let width = primary.width || 80;
      let height = primary.height || 60;
      if (primary.type === "polygon" && primary.points && primary.points.length > 0) {
        const xs = primary.points.map((p) => p.x);
        const ys = primary.points.map((p) => p.y);
        width = Math.max(...xs) - Math.min(...xs);
        height = Math.max(...ys) - Math.min(...ys);
      }

      if (actualDirection === "right") {
        dx = Math.round(width * Math.cos(rad));
        dy = Math.round(width * Math.sin(rad));
      } else if (actualDirection === "left") {
        dx = -Math.round(width * Math.cos(rad));
        dy = -Math.round(width * Math.sin(rad));
      } else if (actualDirection === "down") {
        dx = Math.round(-height * Math.sin(rad));
        dy = Math.round(height * Math.cos(rad));
      } else if (actualDirection === "up") {
        dx = Math.round(height * Math.sin(rad));
        dy = -Math.round(height * Math.cos(rad));
      }
    } else {
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      let minRotX = Infinity;
      let maxRotX = -Infinity;
      let minRotY = Infinity;
      let maxRotY = -Infinity;

      currentSelected.forEach((el) => {
        const w = el.width || 80;
        const h = el.height || 60;
        const corners = [
          { x: el.x, y: el.y },
          { x: el.x + w, y: el.y },
          { x: el.x, y: el.y + h },
          { x: el.x + w, y: el.y + h },
        ];
        corners.forEach((c) => {
          const rx = c.x * cos - c.y * sin;
          const ry = c.y * sin + c.y * cos;
          if (rx < minRotX) minRotX = rx;
          if (rx > maxRotX) maxRotX = rx;
          if (ry < minRotY) minRotY = ry;
          if (ry > maxRotY) maxRotY = ry;
        });
      });

      const spanX = Math.max(1, maxRotX - minRotX);
      const spanY = Math.max(1, maxRotY - minRotY);

      if (actualDirection === "right") {
        dx = Math.round(spanX * Math.cos(rad));
        dy = Math.round(spanX * Math.sin(rad));
      } else if (actualDirection === "left") {
        dx = -Math.round(spanX * Math.cos(rad));
        dy = -Math.round(spanX * Math.sin(rad));
      } else if (actualDirection === "down") {
        dx = Math.round(-spanY * Math.sin(rad));
        dy = Math.round(spanY * Math.cos(rad));
      } else if (actualDirection === "up") {
        dx = Math.round(spanY * Math.sin(rad));
        dy = -Math.round(spanY * Math.cos(rad));
      }
    }

    const existingNumbers = new Set(elements.map((e) => e.number).filter(Boolean));
    const newItems: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    currentSelected.forEach((el, idx) => {
      const nextNum = getNextStallNumber(el.number, existingNumbers);
      if (nextNum) existingNumbers.add(nextNum);

      const cloned: CanvasElement = {
        ...el,
        id: `STALL_${Date.now()}_${idx}`,
        number: nextNum || `${el.number}_copy`,
        x: Math.round(el.x + dx),
        y: Math.round(el.y + dy),
        ...(el.points
          ? {
              points: el.points.map((p) => ({
                x: Math.round(p.x + dx),
                y: Math.round(p.y + dy),
              })),
            }
          : {}),
      };
      newItems.push(cloned);
      newSelectedIds.push(cloned.id);
    });

    recordHistory([...elements, ...newItems]);
    setSelectedIds(newSelectedIds);
    notify(`Duplicated ${newItems.length} element(s) (${actualDirection.toUpperCase()})`);
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const updated = elements.filter((i) => !selectedIds.includes(i.id));
    recordHistory(updated);
    setSelectedIds([]);
    notify(`Deleted ${count} element(s)`);
  };

  const selectAllStalls = () => {
    const ids = elements
      .filter((e) => e.type === "stall" || e.type === "zone" || (e.type === "polygon" && e.category !== "Hollow Wall / Boundary"))
      .map((e) => e.id);
    setSelectedIds(ids);
    notify(`Selected all ${ids.length} stalls`);
  };

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const newElements = [...unselected, ...selected];
    recordHistory(newElements);
    notify("Brought to Front (Top Layer)");
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const newElements = [...selected, ...unselected];
    recordHistory(newElements);
    notify("Sent to Back (Bottom Layer)");
  };

  const bringForward = () => {
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i + 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i + 1];
        newElements[i + 1] = temp;
      }
    }
    recordHistory(newElements);
    notify("Brought Forward 1 Level");
  };

  const sendBackward = () => {
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i - 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i - 1];
        newElements[i - 1] = temp;
      }
    }
    recordHistory(newElements);
    notify("Sent Backward 1 Level");
  };

  const moveSelectedBy = useCallback(
    (dx: number, dy: number) => {
      if (selectedIdsRef.current.length === 0 || (dx === 0 && dy === 0)) return;
      const ids = selectedIdsRef.current;
      setElements((prev) =>
        prev.map((el) => {
          if (ids.includes(el.id)) {
            const updatedEl: CanvasElement = {
              ...el,
              x: Math.round(el.x + dx),
              y: Math.round(el.y + dy),
            };
            if (el.points && el.points.length > 0) {
              updatedEl.points = el.points.map((pt) => ({
                x: Math.round(pt.x + dx),
                y: Math.round(pt.y + dy),
              }));
            }
            if (el.arcControl) {
              updatedEl.arcControl = {
                x: Math.round(el.arcControl.x + dx),
                y: Math.round(el.arcControl.y + dy),
              };
            }
            return updatedEl;
          }
          return el;
        })
      );
    },
    [selectedIdsRef, setElements]
  );

  const clearCanvas = () => {
    if (elements.length === 0) return;
    if (confirm("Clear all elements on the canvas?")) {
      recordHistory([]);
      setSelectedIds([]);
      notify("Canvas cleared");
    }
  };

  return {
    updateSelectedBatch,
    handleBatchRenumber,
    applyCategoryPreset,
    alignSelected,
    duplicateSelected,
    deleteSelected,
    selectAllStalls,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    moveSelectedBy,
    clearCanvas,
  };
}
