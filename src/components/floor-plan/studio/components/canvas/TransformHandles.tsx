import React, { RefObject } from "react";
import { CanvasElement } from "../../types";

interface TransformHandlesProps {
  element: CanvasElement;
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  getCoordinates: (e: React.MouseEvent<any>) => { x: number; y: number };
  setIsResizing: (handle: string | null) => void;
  setInitialElementState: (el: CanvasElement | null) => void;
  setDragStartPos: (pos: { x: number; y: number }) => void;
  setInitialAngleOffset: (offset: number) => void;
  setIsRotating: (rotating: boolean) => void;
  onRotateText?: (id: string) => void;
}

export function TransformHandles({
  element: el,
  svgRef,
  canvasWidth,
  canvasHeight,
  getCoordinates,
  setIsResizing,
  setInitialElementState,
  setDragStartPos,
  setInitialAngleOffset,
  setIsRotating,
  onRotateText,
}: TransformHandlesProps) {
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(handle);
    setInitialElementState(el);
    setDragStartPos(getCoordinates(e));
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / (rect.width || 1);
    const scaleY = canvasHeight / (rect.height || 1);
    const rawMouseX = (e.clientX - rect.left) * scaleX;
    const rawMouseY = (e.clientY - rect.top) * scaleY;

    const centerX = el.x + el.width / 2;
    const centerY = el.y + el.height / 2;
    const initialMouseAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
    setInitialAngleOffset(initialMouseAngle - (el.rotation || 0));
    setIsRotating(true);
    setInitialElementState(el);
  };

  return (
    <>
      {/* 4 Corner Resize Handles */}
      <circle
        cx={el.x + el.width}
        cy={el.y + el.height}
        r="5.5"
        fill="#38BDF8"
        stroke="#0C121C"
        strokeWidth="2"
        className="cursor-se-resize pointer-events-auto"
        onMouseDown={(e) => handleResizeStart(e, "se")}
      />
      <circle
        cx={el.x + el.width}
        cy={el.y}
        r="5.5"
        fill="#38BDF8"
        stroke="#0C121C"
        strokeWidth="2"
        className="cursor-ne-resize pointer-events-auto"
        onMouseDown={(e) => handleResizeStart(e, "ne")}
      />
      <circle
        cx={el.x}
        cy={el.y + el.height}
        r="5.5"
        fill="#38BDF8"
        stroke="#0C121C"
        strokeWidth="2"
        className="cursor-sw-resize pointer-events-auto"
        onMouseDown={(e) => handleResizeStart(e, "sw")}
      />
      <circle
        cx={el.x}
        cy={el.y}
        r="5.5"
        fill="#38BDF8"
        stroke="#0C121C"
        strokeWidth="2"
        className="cursor-nw-resize pointer-events-auto"
        onMouseDown={(e) => handleResizeStart(e, "nw")}
      />

      {/* Top Rotation Stem & Handle */}
      <line
        x1={el.x + el.width / 2}
        y1={el.y}
        x2={el.x + el.width / 2}
        y2={el.y - 24}
        stroke="#38BDF8"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        pointerEvents="none"
      />
      {el.rotation !== 0 && (
        <text
          x={el.x + el.width / 2}
          y={el.y - 30}
          fill="#38BDF8"
          fontSize="10"
          fontWeight="700"
          fontFamily="sans-serif"
          textAnchor="middle"
          className="select-none pointer-events-none"
        >
          {el.rotation}°
        </text>
      )}
      <circle
        cx={el.x + el.width / 2}
        cy={el.y - 24}
        r="6"
        fill="#10B981"
        stroke="#FFFFFF"
        strokeWidth="2"
        className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform pointer-events-auto"
        onMouseDown={handleRotateStart}
      />

      {/* Bottom Text Rotation Handle */}
      {el.number && onRotateText && (
        <g
          className="cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onRotateText(el.id);
          }}
        >
          <line
            x1={el.x + el.width / 2}
            y1={el.y + el.height}
            x2={el.x + el.width / 2}
            y2={el.y + el.height + 20}
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            pointerEvents="none"
          />
          <circle
            cx={el.x + el.width / 2}
            cy={el.y + el.height + 20}
            r="8.5"
            fill="#0284C7"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="hover:scale-125 transition-transform"
          />
          <text
            x={el.x + el.width / 2}
            y={el.y + el.height + 20}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="sans-serif"
            className="select-none pointer-events-none"
          >
            T↻
          </text>
          {el.textRotation !== undefined && el.textRotation !== 0 && (
            <text
              x={el.x + el.width / 2}
              y={el.y + el.height + 34}
              fill="#0284C7"
              fontSize="9"
              fontWeight="700"
              fontFamily="sans-serif"
              textAnchor="middle"
              className="select-none pointer-events-none"
            >
              text: {el.textRotation}°
            </text>
          )}
        </g>
      )}
    </>
  );
}
