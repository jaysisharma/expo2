import { useState, useEffect, useRef } from "react";
import { CanvasElement, CanvasBgMode } from "../types";

interface UseCanvasPersistenceProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  recordHistory?: (elements: CanvasElement[]) => void;
  setSelectedIds?: (ids: string[]) => void;
  setHistory?: React.Dispatch<React.SetStateAction<CanvasElement[][]>>;
  setHistoryIdx?: React.Dispatch<React.SetStateAction<number>>;
}

export function useCanvasPersistence({
  elements,
  setElements,
  recordHistory,
  setSelectedIds,
  setHistory,
  setHistoryIdx,
}: UseCanvasPersistenceProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Background and Canvas dimensions
  const [canvasBgMode, setCanvasBgMode] = useState<CanvasBgMode>("cad-dark");
  const [showBgImage, setShowBgImage] = useState<boolean>(true);
  const [bgImageSrc, setBgImageSrc] = useState<string>("/images/floor-plan-official.webp");
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(0.65);
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(850);
  const [showCanvasSettingsModal, setShowCanvasSettingsModal] = useState<boolean>(false);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load Saved Design from Server on Mount
  useEffect(() => {
    async function loadFloorPlan() {
      try {
        const res = await fetch("/api/floor-plan/save");
        const resData = await res.json();
        if (resData.success && resData.data) {
          if (Array.isArray(resData.data.elements) && resData.data.elements.length > 0) {
            setElements(resData.data.elements);
            if (setHistory) setHistory([resData.data.elements]);
            if (setHistoryIdx) setHistoryIdx(0);
            else if (recordHistory) recordHistory(resData.data.elements);
          }
          if (resData.data.bgImageSrc) setBgImageSrc(resData.data.bgImageSrc);
          if (resData.data.blueprintOpacity !== undefined) setBlueprintOpacity(resData.data.blueprintOpacity);
          if (resData.data.canvasBgMode) setCanvasBgMode(resData.data.canvasBgMode);
          if (resData.data.showBgImage !== undefined) setShowBgImage(resData.data.showBgImage);
          if (resData.data.canvasWidth) setCanvasWidth(Number(resData.data.canvasWidth) || 1200);
          if (resData.data.canvasHeight) setCanvasHeight(Number(resData.data.canvasHeight) || 850);
          if (resData.data.updatedAt) {
            const d = new Date(resData.data.updatedAt);
            setLastSavedTime(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
          return;
        }
      } catch (err) {
        console.warn("Server load error, checking local backup", err);
      }

      // Local fallback
      try {
        const local = localStorage.getItem("hhe_canvas_studio_elements");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setElements(parsed);
            if (setHistory) setHistory([parsed]);
            if (setHistoryIdx) setHistoryIdx(0);
            else if (recordHistory) recordHistory(parsed);
          }
        }
        const localBg = localStorage.getItem("hhe_canvas_bg_mode");
        if (localBg) setCanvasBgMode(localBg as any);
        const localShowBg = localStorage.getItem("hhe_show_bg_image");
        if (localShowBg !== null) setShowBgImage(localShowBg === "true");
        const localW = localStorage.getItem("hhe_canvas_width");
        if (localW) setCanvasWidth(Number(localW) || 1200);
        const localH = localStorage.getItem("hhe_canvas_height");
        if (localH) setCanvasHeight(Number(localH) || 850);
        const localImg = localStorage.getItem("hhe_canvas_bg_image");
        if (localImg) setBgImageSrc(localImg);
        const localOp = localStorage.getItem("hhe_blueprint_opacity");
        if (localOp) setBlueprintOpacity(Number(localOp) || 0.65);
      } catch (e) {}
    }

    loadFloorPlan();
  }, []);

  // Background Image File Upload Handler
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        notify("Image size too large (max 15MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          setBgImageSrc(dataUrl);
          setShowBgImage(true);
          notify("Custom blueprint background image loaded!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear Canvas
  const clearCanvas = () => {
    if (elements.length === 0) return;
    if (confirm("Clear all elements on the canvas?")) {
      setElements([]);
      if (setHistory) setHistory([[]]);
      if (setHistoryIdx) setHistoryIdx(0);
      else if (recordHistory) recordHistory([]);
      if (setSelectedIds) setSelectedIds([]);
      notify("Canvas cleared");
    }
  };

  // Save to Database & LocalStorage
  const saveToStorage = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      localStorage.setItem("hhe_canvas_studio_elements", JSON.stringify(elements));
      localStorage.setItem("hhe_canvas_bg_mode", canvasBgMode);
      localStorage.setItem("hhe_show_bg_image", String(showBgImage));
      localStorage.setItem("hhe_canvas_width", String(canvasWidth));
      localStorage.setItem("hhe_canvas_height", String(canvasHeight));
      localStorage.setItem("hhe_canvas_bg_image", bgImageSrc);
      localStorage.setItem("hhe_blueprint_opacity", String(blueprintOpacity));

      const response = await fetch("/api/floor-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          bgImageSrc,
          blueprintOpacity,
          canvasBgMode,
          showBgImage,
          canvasWidth,
          canvasHeight,
        }),
      });

      const resJson = await response.json();
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (resJson.success) {
        notify("Floor plan & background settings saved to server database!");
      } else {
        notify("Saved to local browser backup");
      }
    } catch (error) {
      notify("Saved to local storage");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    toastMsg,
    notify,
    isSaving,
    lastSavedTime,
    canvasBgMode,
    setCanvasBgMode,
    showBgImage,
    setShowBgImage,
    bgImageSrc,
    setBgImageSrc,
    blueprintOpacity,
    setBlueprintOpacity,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    showCanvasSettingsModal,
    setShowCanvasSettingsModal,
    bgFileInputRef,
    handleBgImageUpload,
    clearCanvas,
    saveToStorage,
  };
}
