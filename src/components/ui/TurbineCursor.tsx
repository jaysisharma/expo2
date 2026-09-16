"use client";

import React, { useEffect, useState, useRef } from "react";

export default function TurbineCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rotationRef = useRef(0);
  const lastMoveTimeRef = useRef(0);

  useEffect(() => {
    // Only enable on non-touch devices with fine pointer (mouse/trackpad)
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "a, button, input, select, textarea, [role='button'], .cursor-pointer"
        );
        setIsHovering(!!interactive);
      }
      lastMoveTimeRef.current = performance.now();
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    let animationFrameId: number;

    const renderLoop = () => {
      // Lerp position for silky smooth follow
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.28;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.28;

      // Rotate turbine continuously, faster when moving or clicked
      const timeSinceMove = performance.now() - lastMoveTimeRef.current;
      const speed = timeSinceMove < 150 ? (isClicked ? 7.5 : 4.5) : (isHovering ? 2.5 : 1.2);
      rotationRef.current = (rotationRef.current + speed) % 360;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      const turbineEl = document.getElementById("turbine-runner-rotor");
      if (turbineEl) {
        turbineEl.style.transform = `rotate(${rotationRef.current}deg)`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isClicked, isHovering]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[99999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      {/* Centered Turbine Runner Wrapper */}
      <div
        className={`relative -top-4 -left-4 flex items-center justify-center transition-transform duration-200 ease-out ${
          isClicked
            ? "scale-75"
            : isHovering
            ? "scale-125"
            : "scale-100"
        }`}
      >
        {/* Glow Halo when hovering interactive element */}
        <div
          className={`absolute inset-0 w-8 h-8 rounded-full blur-sm transition-all duration-300 ${
            isHovering
              ? "bg-[#25C176]/50 scale-150"
              : isClicked
              ? "bg-[#38BDF8]/60 scale-125"
              : "bg-[#218A59]/20 scale-100"
          }`}
        />

        {/* Center Guide Dot */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-xs z-10" />

        {/* Hydro Turbine Runner SVG (6 Curved Francis Blades) */}
        <svg
          id="turbine-runner-rotor"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        >
          {/* Turbine Outer Stator Ring */}
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="url(#turbine-gradient-outer)"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.8"
          />

          {/* 6 Curved Francis Hydro Blades */}
          <g>
            {/* Blade 1 (0 deg) */}
            <path
              d="M16 16 C16 11, 21 8, 26 10 C23 13, 20 14, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#25C176"
              strokeWidth="0.5"
            />
            {/* Blade 2 (60 deg) */}
            <path
              d="M16 16 C20 13, 25 15, 26 21 C22 20, 19 18, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#25C176"
              strokeWidth="0.5"
            />
            {/* Blade 3 (120 deg) */}
            <path
              d="M16 16 C19 20, 19 25, 15 28 C15 24, 15 21, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#38BDF8"
              strokeWidth="0.5"
            />
            {/* Blade 4 (180 deg) */}
            <path
              d="M16 16 C16 21, 11 24, 6 22 C9 19, 12 18, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#38BDF8"
              strokeWidth="0.5"
            />
            {/* Blade 5 (240 deg) */}
            <path
              d="M16 16 C12 19, 7 17, 6 11 C10 12, 13 14, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#25C176"
              strokeWidth="0.5"
            />
            {/* Blade 6 (300 deg) */}
            <path
              d="M16 16 C13 12, 13 7, 17 4 C17 8, 17 11, 16 16 Z"
              fill="url(#turbine-blade-grad)"
              stroke="#25C176"
              strokeWidth="0.5"
            />
          </g>

          {/* Central Generator Hub */}
          <circle cx="16" cy="16" r="4" fill="#04281E" stroke="#34D399" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="1.8" fill="#38BDF8" />

          {/* Gradients */}
          <defs>
            <linearGradient id="turbine-gradient-outer" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#218A59" />
            </linearGradient>
            <linearGradient id="turbine-blade-grad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#25C176" stopOpacity="0.9" />
              <stop offset="1" stopColor="#087EA4" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
