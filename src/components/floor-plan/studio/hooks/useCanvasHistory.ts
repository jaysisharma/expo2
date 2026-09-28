import { useState } from "react";
import { CanvasElement } from "../types";

export function useCanvasHistory(
  elements: CanvasElement[],
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
) {
  const [history, setHistory] = useState<CanvasElement[][]>([elements]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const recordHistory = (newElements: CanvasElement[]) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newElements);
    if (updatedHistory.length > 50) updatedHistory.shift();
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setElements(history[historyIdx - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setElements(history[historyIdx + 1]);
    }
  };

  return {
    history,
    historyIdx,
    recordHistory,
    handleUndo,
    handleRedo,
    setHistory,
    setHistoryIdx,
  };
}
