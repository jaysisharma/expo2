import React, { RefObject } from "react";
import { CanvasElement, ToolType } from "../../types";
import { getPencilPathData } from "../../utils";
import { TransformHandles } from "./TransformHandles";

interface CanvasElementRendererProps {
  elements: CanvasElement[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeTool: ToolType;
  svgRef: RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  getCoordinates: (e: React.MouseEvent<any>) => { x: number; y: number };
  setIsDragging: (dragging: boolean) => void;
  setIsResizing: (handle: string | null) => void;
  setIsRotating: (rotating: boolean) => void;
  setInitialAngleOffset: (offset: number) => void;
  setDragStartPos: (pos: { x: number; y: number }) => void;
  setInitialElementState: (el: CanvasElement | null) => void;
  setInitialMultiPosMap: (map: {
    [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } };
  }) => void;
  recordHistory: (elements: CanvasElement[]) => void;
  notify: (msg: string) => void;
}

export function CanvasElementRenderer({
  elements,
  selectedIds,
  setSelectedIds,
  activeTool,
  svgRef,
  canvasWidth,
  canvasHeight,
  getCoordinates,
  setIsDragging,
  setIsResizing,
  setIsRotating,
  setInitialAngleOffset,
  setDragStartPos,
  setInitialElementState,
  setInitialMultiPosMap,
  recordHistory,
  notify,
}: CanvasElementRendererProps) {
  const isSelectOrEraser = activeTool === "select" || activeTool === "eraser";

  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    if (!isSelectOrEraser) return;
    e.stopPropagation();

    if (activeTool === "eraser") {
      recordHistory(elements.filter((item) => item.id !== el.id));
      notify(`Deleted ${el.number || el.type}`);
      return;
    }

    const isSelected = selectedIds.includes(el.id);

    // If element belongs to a group, resolve all group member IDs
    const groupMemberIds: string[] = el.groupId
      ? elements.filter((item) => item.groupId === el.groupId).map((item) => item.id)
      : [el.id];

    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      if (isSelected) {
        // Remove the whole group from selection
        setSelectedIds((prev) => prev.filter((id) => !groupMemberIds.includes(id)));
      } else {
        setSelectedIds((prev) => Array.from(new Set([...prev, ...groupMemberIds])));
      }
      return;
    }

    // If not already selected, select the whole group
    if (!isSelected) {
      setSelectedIds(groupMemberIds);
    }

    const currentSelectedIds = isSelected ? selectedIds : groupMemberIds;
    const posMap: {
      [id: string]: { x: number; y: number; points?: { x: number; y: number }[]; arcControl?: { x: number; y: number } };
    } = {};

    elements.forEach((item) => {
      if (currentSelectedIds.includes(item.id)) {
        posMap[item.id] = {
          x: item.x,
          y: item.y,
          points: item.points ? item.points.map((p) => ({ ...p })) : undefined,
          arcControl: item.arcControl ? { ...item.arcControl } : undefined,
        };
      }
    });

    setInitialMultiPosMap(posMap);
    setIsDragging(true);
    setInitialElementState(el);
    setDragStartPos(getCoordinates(e));
  };

  return (
    <>
      {elements.map((el) => {
        const isSelected = selectedIds.includes(el.id);

        // 1. Stall / Rectangle
        if (el.type === "stall" || el.type === "zone") {
          const isOutline =
            el.color === "transparent" ||
            el.color === "none" ||
            el.fillOpacity === 0 ||
            el.category === "Hollow Wall / Boundary";

          return (
            <g
              key={el.id}
              transform={
                el.rotation
                  ? `rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`
                  : undefined
              }
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none"}
            >
              <rect
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                rx={el.borderRadius !== undefined ? el.borderRadius : 4}
                ry={el.borderRadius !== undefined ? el.borderRadius : 4}
                fill={isOutline ? "none" : el.color === "transparent" || el.color === "none" ? "none" : el.color}
                fillOpacity={
                  isOutline || el.color === "transparent" || el.color === "none"
                    ? 0
                    : el.fillOpacity !== undefined
                    ? el.fillOpacity
                    : isSelected
                    ? 0.95
                    : 0.85
                }
                stroke={isSelected ? "#38BDF8" : el.borderColor}
                strokeWidth={isSelected ? Math.max(3, el.strokeWidth + 1.5) : el.strokeWidth || 2}
                pointerEvents={isOutline ? "stroke" : undefined}
              />

              {/* Label */}
              <text
                x={el.x + el.width / 2 + (el.textOffsetX || 0)}
                y={el.y + el.height / 2 + (el.textOffsetY || 0)}
                dominantBaseline="central"
                textAnchor="middle"
                transform={
                  el.textRotation
                    ? `rotate(${el.textRotation}, ${el.x + el.width / 2 + (el.textOffsetX || 0)}, ${el.y + el.height / 2 + (el.textOffsetY || 0)})`
                    : undefined
                }
                fill={el.textColor || "#FFFFFF"}
                fontWeight={el.fontWeight || "700"}
                fontSize={el.fontSize || (el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5)}
                fontFamily="sans-serif"
                pointerEvents="none"
              >
                {el.number}
              </text>

              {/* Interactive Resize & Rotation Handles */}
              {isSelected && selectedIds.length === 1 && (
                <TransformHandles
                  element={el}
                  svgRef={svgRef}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  getCoordinates={getCoordinates}
                  setIsResizing={setIsResizing}
                  setInitialElementState={setInitialElementState}
                  setDragStartPos={setDragStartPos}
                  setInitialAngleOffset={setInitialAngleOffset}
                  setIsRotating={setIsRotating}
                  onRotateText={(id) => {
                    const nextAngle = ((el.textRotation || 0) + 90) % 360;
                    recordHistory(
                      elements.map((item) =>
                        item.id === id ? { ...item, textRotation: nextAngle } : item
                      )
                    );
                    notify(`Rotated text to ${nextAngle}°`);
                  }}
                />
              )}
            </g>
          );
        }

        // 2. Freehand Pencil
        if (el.type === "pencil" && el.points) {
          return (
            <path
              key={el.id}
              d={getPencilPathData(el.points)}
              fill="none"
              stroke={isSelected ? "#38BDF8" : el.borderColor}
              strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
            />
          );
        }

        // 3. Line / Wall
        if (el.type === "line" && el.points && el.points.length >= 2) {
          return (
            <line
              key={el.id}
              x1={el.points[0].x}
              y1={el.points[0].y}
              x2={el.points[1].x}
              y2={el.points[1].y}
              stroke={isSelected ? "#38BDF8" : el.borderColor}
              strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
              strokeLinecap="round"
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
            />
          );
        }

        // 4. Arc / Curve
        if (el.type === "arc" && el.points && el.points.length >= 2 && el.arcControl) {
          return (
            <path
              key={el.id}
              d={`M ${el.points[0].x} ${el.points[0].y} Q ${el.arcControl.x} ${el.arcControl.y} ${el.points[1].x} ${el.points[1].y}`}
              fill="none"
              stroke={isSelected ? "#38BDF8" : el.borderColor}
              strokeWidth={isSelected ? el.strokeWidth + 2 : el.strokeWidth}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={isSelectOrEraser ? "cursor-grab pointer-events-auto" : "pointer-events-none"}
            />
          );
        }

        // 5. Text Label
        if (el.type === "text") {
          const fontSize = el.fontSize || 16;
          const fontWeight = el.fontWeight || "700";
          const textContent = el.number || "Text Label";
          const approxCharWidth = fontSize * 0.65;
          const textW = Math.max(el.width || 0, Math.ceil(textContent.length * approxCharWidth) + 20);
          const textH = Math.max(el.height || 0, Math.ceil(fontSize * 1.35));
          const baselineOffset = fontSize * 0.85;
          const topY = el.y - baselineOffset;
          const centerX = el.x + textW / 2;
          const centerY = topY + textH / 2;

          return (
            <g
              key={el.id}
              transform={
                el.rotation
                  ? `rotate(${el.rotation}, ${centerX}, ${centerY})`
                  : undefined
              }
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none"}
            >
              {/* Invisible Hitbox Rect so clicking anywhere on or around the text easily selects & drags it */}
              <rect
                x={el.x - 8}
                y={topY - 8}
                width={textW + 16}
                height={textH + 16}
                fill="transparent"
                pointerEvents="all"
              />
              <text
                x={el.x}
                y={el.y}
                fill={el.textColor || "#FFFFFF"}
                fontSize={fontSize}
                fontWeight={fontWeight}
                fontFamily="sans-serif"
                pointerEvents="none"
              >
                {el.number}
              </text>
              {isSelected && (
                <>
                  <rect
                    x={el.x - 4}
                    y={topY - 4}
                    width={textW + 8}
                    height={textH + 8}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {selectedIds.length === 1 && (
                    <>
                      <line
                        x1={centerX}
                        y1={topY - 4}
                        x2={centerX}
                        y2={topY - 24}
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        pointerEvents="none"
                      />
                      {el.rotation !== 0 && (
                        <text
                          x={centerX}
                          y={topY - 28}
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
                        cx={centerX}
                        cy={topY - 24}
                        r="6"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform pointer-events-auto"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!svgRef.current) return;
                          const rect = svgRef.current.getBoundingClientRect();
                          const scaleX = canvasWidth / (rect.width || 1);
                          const scaleY = canvasHeight / (rect.height || 1);
                          const rawMouseX = (e.clientX - rect.left) * scaleX;
                          const rawMouseY = (e.clientY - rect.top) * scaleY;

                          const initialMouseAngle = Math.atan2(rawMouseY - centerY, rawMouseX - centerX) * (180 / Math.PI);
                          setInitialAngleOffset(initialMouseAngle - (el.rotation || 0));
                          setIsRotating(true);
                          setInitialElementState({
                            ...el,
                            width: textW,
                            height: textH,
                            x: el.x,
                            y: el.y,
                          });
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </g>
          );
        }

        // 6. Polygon / Multi-Point Shape Stall
        if (el.type === "polygon" && el.points && el.points.length >= 3) {
          const pointsString = el.points.map((p) => `${p.x},${p.y}`).join(" ");
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          const isOutline =
            el.color === "transparent" ||
            el.color === "none" ||
            el.fillOpacity === 0 ||
            el.category === "Hollow Wall / Boundary";

          return (
            <g key={el.id} className={isSelectOrEraser ? "pointer-events-auto" : "pointer-events-none"}>
              <polygon
                points={pointsString}
                fill={isOutline ? "none" : el.color === "transparent" || el.color === "none" ? "none" : el.color}
                fillOpacity={
                  isOutline || el.color === "transparent" || el.color === "none"
                    ? 0
                    : el.fillOpacity !== undefined
                    ? el.fillOpacity
                    : 0.85
                }
                stroke={isSelected ? "#38BDF8" : el.borderColor || "#38BDF8"}
                strokeWidth={isSelected ? (el.strokeWidth || 2) + 2 : (el.strokeWidth || 2)}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents={isOutline ? "stroke" : undefined}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
                className={isSelectOrEraser ? "cursor-grab active:cursor-grabbing" : ""}
              />

              {/* Stall Number / Label */}
              {el.number && (
                <text
                  x={centerX + (el.textOffsetX || 0)}
                  y={centerY + (el.textOffsetY || 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={
                    el.textRotation
                      ? `rotate(${el.textRotation}, ${centerX + (el.textOffsetX || 0)}, ${centerY + (el.textOffsetY || 0)})`
                      : undefined
                  }
                  fill={el.textColor || "#FFFFFF"}
                  fontSize={el.fontSize || (el.width > 60 ? 11 : el.width > 30 ? 9 : 7.5)}
                  fontWeight={el.fontWeight || "bold"}
                  fontFamily="monospace"
                  className="select-none pointer-events-none drop-shadow-md"
                >
                  {el.number}
                </text>
              )}

              {/* Selected Vertex Handles & Bounding Outline */}
              {isSelected && (
                <>
                  <rect
                    x={el.x - 2}
                    y={el.y - 2}
                    width={el.width + 4}
                    height={el.height + 4}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    pointerEvents="none"
                  />
                  {el.points.map((pt, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#38BDF8"
                      stroke="#0C121C"
                      strokeWidth="1.5"
                      className="pointer-events-none"
                    />
                  ))}
                </>
              )}
            </g>
          );
        }

        return null;
      })}

      {/* GROUP BOUNDING BOXES — drawn once per unique groupId */}
      {(() => {
        const groupIds = Array.from(
          new Set(elements.filter((el) => el.groupId).map((el) => el.groupId as string))
        );
        return groupIds.map((gid) => {
          const members = elements.filter((el) => el.groupId === gid);
          if (members.length < 2) return null;

          // Compute bounding box across all members
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          members.forEach((el) => {
            const ex = el.x, ey = el.y;
            const ew = el.width || 0, eh = el.height || 0;
            minX = Math.min(minX, ex);
            minY = Math.min(minY, ey);
            maxX = Math.max(maxX, ex + ew);
            maxY = Math.max(maxY, ey + eh);
          });

          const pad = 8;
          const isGroupSelected = members.some((el) => selectedIds.includes(el.id));

          return (
            <g key={`group-${gid}`} pointerEvents="none">
              <rect
                x={minX - pad}
                y={minY - pad}
                width={maxX - minX + pad * 2}
                height={maxY - minY + pad * 2}
                fill="none"
                stroke={isGroupSelected ? "#F59E0B" : "#94A3B880"}
                strokeWidth={isGroupSelected ? 2 : 1}
                strokeDasharray={isGroupSelected ? "6 4" : "4 4"}
                rx={6}
                ry={6}
              />
              {/* Group label badge */}
              <rect
                x={minX - pad}
                y={minY - pad - 17}
                width={56}
                height={17}
                rx={4}
                fill={isGroupSelected ? "#F59E0B" : "#334155"}
                opacity={0.92}
              />
              <text
                x={minX - pad + 6}
                y={minY - pad - 5}
                fill={isGroupSelected ? "#0F172A" : "#94A3B8"}
                fontSize={10}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                📦 Group ({members.length})
              </text>
            </g>
          );
        });
      })()}
    </>
  );
}
