"use client";

import { useRef } from "react";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function PhotoUpload({ files, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const merged = [...files, ...selected].slice(0, 5);
    onChange(merged);
    // Reset input so same file can be re-selected if removed
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= 5}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add photos
        </button>
        <span className="text-xs text-gray-500">{files.length}/5 — max 5 MB each</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
