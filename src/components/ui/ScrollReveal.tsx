'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  distance?: number;
  stagger?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.7,
  distance = 35,
  stagger = 0,
  once = true,
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = elRef.current;
    if (!el) return;

    const xOffset = direction === 'left' ? distance : direction === 'right' ? -distance : 0;
    const yOffset = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

    const ctx = gsap.context(() => {
      const targets = stagger && el.children.length > 0 ? Array.from(el.children) : el;

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          x: xOffset,
          y: yOffset,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          stagger: stagger || 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, direction, distance, duration, once, stagger]);

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}

export default ScrollReveal;
