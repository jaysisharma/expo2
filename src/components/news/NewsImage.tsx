'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';

interface NewsImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackIconSize?: number;
}

export function NewsImage({
  src,
  alt,
  fill = true,
  className = 'object-cover',
  sizes,
  priority = false,
  fallbackIconSize = 40,
}: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src || null);
  const [hasError, setHasError] = useState(false);
  const [triedProxy, setTriedProxy] = useState(false);

  useEffect(() => {
    setImgSrc(src || null);
    setHasError(!src);
    setTriedProxy(false);
  }, [src]);

  if (!imgSrc || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
        <Newspaper
          style={{ width: fallbackIconSize, height: fallbackIconSize }}
          className="opacity-40"
        />
      </div>
    );
  }

  const handleError = () => {
    // If direct load failed for an external URL and we haven't tried proxy yet, try via our server proxy
    if (!triedProxy && imgSrc.startsWith('http')) {
      setTriedProxy(true);
      setImgSrc(`/api/proxy-image?url=${encodeURIComponent(imgSrc)}`);
    } else {
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt || 'News article'}
      fill={fill}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      priority={priority}
      unoptimized
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}

export default NewsImage;
