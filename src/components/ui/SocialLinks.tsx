import React from 'react';
import { SOCIAL_LINKS } from '@/data/socials';

/** Row of official social profile icons in brand colors (white glyph on brand-colored tile). */
export function SocialLinks({
  className = '',
  linkClassName = '',
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Himalayan Green Energy Expo on ${s.label}`}
          title={s.label}
          className={`w-9 h-9 rounded-lg border border-white/15 text-white flex items-center justify-center shadow-sm transition-transform hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-emerald-400 ${s.bg} ${linkClassName}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
