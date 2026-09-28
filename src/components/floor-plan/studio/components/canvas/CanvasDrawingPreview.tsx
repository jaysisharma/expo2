import React from "react";
import { ToolType } from "../../types";

interface CanvasDrawingPreviewProps {
  activeTool: ToolType;
  drawingRect: { x: number; y: number; width: number; height: number } | null;
  activeFillColor: string;
  activeStrokeColor: string;
  activeStrokeWidth: number;
  activeBorderRadius: number;
  currentPolygonPoints: { x: number; y: number }[];
  polygonHoverPos: { x: number; y: number } | null;
  selectionMarquee: { x1: number; y1: number; x2: number; y2: number } | null;
}

export function CanvasDrawingPreview({
  activeTool,
  drawingRect,
  activeFillColor,
  activeStrokeColor,
  activeStrokeWidth,
  activeBorderRadius,
  currentPolygonPoints,
  polygonHoverPos,
  selectionMarquee,
}: CanvasDrawingPreviewProps) {
  return (
    <>
      {/* Drawing Rectangle Preview */}
      {drawingRect && (
        <rect
          x={drawingRect.x}
          y={drawingRect.y}
          width={drawingRect.width}
          height={drawingRect.height}
          fill={activeFillColor === "transparent" ? "none" : activeFillColor}
          fillOpacity={0.6}
          stroke={activeStrokeColor}
          strokeWidth={activeStrokeWidth}
          strokeDasharray="4 4"
          rx={activeBorderRadius}
        />
      )}

      {/* 1. Live Target Indicator before 1st point is placed */}
      {activeTool === "polygon" && currentPolygonPoints.length === 0 && polygonHoverPos && (
        <g className="pointer-events-none">
          <circle
            cx={polygonHoverPos.x}
            cy={polygonHoverPos.y}
            r="10"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <circle
            cx={polygonHoverPos.x}
            cy={polygonHoverPos.y}
            r="4"
            fill="#38BDF8"
            stroke="#0C121C"
            strokeWidth="1.5"
          />
          <rect
            x={polygonHoverPos.x + 12}
            y={polygonHoverPos.y - 12}
            width="132"
            height="22"
            rx="6"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="1"
            fillOpacity="0.9"
          />
          <text
            x={polygonHoverPos.x + 18}
            y={polygonHoverPos.y + 3}
            fill="#38BDF8"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            Click to place pt 1
          </text>
        </g>
      )}

      {/* 2. Active Polygon In-Progress Drawing Preview */}
      {activeTool === "polygon" && currentPolygonPoints.length > 0 && (
        <g className="pointer-events-none">
          {/* Ghost Fill Preview */}
          {currentPolygonPoints.length >= 2 && polygonHoverPos && (
            <polygon
              points={[...currentPolygonPoints, polygonHoverPos].map((p) => `${p.x},${p.y}`).join(" ")}
              fill={activeFillColor === "transparent" ? "none" : activeFillColor}
              fillOpacity={0.35}
              stroke="none"
            />
          )}

          {/* Polyline Path for existing points */}
          <polyline
            points={currentPolygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={activeStrokeColor || "#38BDF8"}
            strokeWidth={activeStrokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rubberband line from last point to cursor */}
          {polygonHoverPos && currentPolygonPoints.length > 0 && (
            <line
              x1={currentPolygonPoints[currentPolygonPoints.length - 1].x}
              y1={currentPolygonPoints[currentPolygonPoints.length - 1].y}
              x2={polygonHoverPos.x}
              y2={polygonHoverPos.y}
              stroke={activeStrokeColor || "#38BDF8"}
              strokeWidth={activeStrokeWidth || 2}
              strokeDasharray="4 4"
            />
          )}

          {/* Rubberband current hover target */}
          {polygonHoverPos && (
            <g>
              <circle
                cx={polygonHoverPos.x}
                cy={polygonHoverPos.y}
                r="6"
                fill="#38BDF8"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <rect
                x={polygonHoverPos.x + 10}
                y={polygonHoverPos.y - 12}
                width="85"
                height="20"
                rx="4"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1"
                fillOpacity="0.9"
              />
              <text
                x={polygonHoverPos.x + 16}
                y={polygonHoverPos.y + 2}
                fill="#38BDF8"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Pt #{currentPolygonPoints.length + 1}
              </text>
            </g>
          )}

          {/* Existing Vertex Circles with Numbers */}
          {currentPolygonPoints.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={idx === 0 ? "8" : "6"}
                fill={idx === 0 ? "#10B981" : "#38BDF8"}
                stroke="#0C121C"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                fill="#0C121C"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {idx + 1}
              </text>
            </g>
          ))}

          {/* First Point Closing Target Halo */}
          {currentPolygonPoints.length >= 3 && (
            <g>
              <circle
                cx={currentPolygonPoints[0].x}
                cy={currentPolygonPoints[0].y}
                r="18"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <text
                x={currentPolygonPoints[0].x}
                y={currentPolygonPoints[0].y - 22}
                textAnchor="middle"
                fill="#10B981"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
                className="drop-shadow-md"
              >
                🎯 Click to Close
              </text>
            </g>
          )}
        </g>
      )}

      {/* Marquee Box Selection Preview */}
      {selectionMarquee && (
        <rect
          x={Math.min(selectionMarquee.x1, selectionMarquee.x2)}
          y={Math.min(selectionMarquee.y1, selectionMarquee.y2)}
          width={Math.abs(selectionMarquee.x2 - selectionMarquee.x1)}
          height={Math.abs(selectionMarquee.y2 - selectionMarquee.y1)}
          fill="rgba(56, 189, 248, 0.15)"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}
    </>
  );
}
