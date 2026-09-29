"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, Link as LinkIcon } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export function ImageUploadField({
  label = "Image",
  value,
  onChange,
  folder = "general",
  placeholder = "https://... or upload an image file",
  name,
  required = false,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, SVG, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || "Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Hidden input to support traditional form submission if name is provided */}
      {name && <input type="hidden" name={name} value={value} />}

      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3 h-3 text-slate-400" />
          <span>{showUrlInput ? "Hide URL Input" : "Paste URL Instead"}</span>
        </button>
      </div>

      {/* Main Upload Box / Preview Area */}
      <div className="space-y-2">
        {value ? (
          <div className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center gap-3 group">
            {/* Image Preview Thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200/80">
              <Image
                src={value}
                alt="Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Image Details */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Image Attached</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-full font-mono mt-0.5">
                {value}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  Change image
                </button>
              </div>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative rounded-xl border border-dashed p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/40"
                : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
            } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
          >
            {isUploading ? (
              <div className="py-2 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                <span className="text-xs font-medium text-slate-600">
                  Uploading image...
                </span>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    Click to upload or drag & drop image
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG, WEBP, or SVG up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Optional Manual URL Input */}
        {showUrlInput && (
          <div className="pt-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#218A59]"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-[11px] text-red-600 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
