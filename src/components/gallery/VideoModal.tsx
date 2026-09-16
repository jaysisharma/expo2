"use client";

import React, { useEffect } from "react";
import { VideoItem } from "@/lib/types";
import { X, ExternalLink, Play } from "lucide-react";

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (video) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const isEmbeddable =
    video.videoUrl.includes("youtube.com") ||
    video.videoUrl.includes("youtu.be") ||
    video.videoUrl.includes("vimeo.com");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-5xl bg-black border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Minimal Control Bar */}
        <div className="p-3 border-b border-white/10 flex items-center justify-end gap-2 bg-white/5">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Open external source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
            title="Close video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {isEmbeddable ? (
            <iframe
              src={getEmbedUrl(video.videoUrl)}
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-bold transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>OPEN EXTERNAL VIDEO</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
