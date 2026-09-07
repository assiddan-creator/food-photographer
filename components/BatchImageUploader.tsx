'use client';

import { useCallback, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { BATCH_MAX_IMAGES } from '@/lib/presets';
import type { BatchItem } from '@/hooks/useBatchPipeline';

interface Props {
  items: BatchItem[];
  disabled?: boolean;
  onAddFiles: (files: File[]) => Promise<void>;
  onRemove: (id: string) => void;
}

export function BatchImageUploader({ items, disabled, onAddFiles, onRemove }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const remaining = BATCH_MAX_IMAGES - items.length;

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    if (disabled) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setIsCompressing(true);
    try {
      await onAddFiles(files);
    } finally {
      setIsCompressing(false);
    }
  }, [disabled, onAddFiles]);

  return (
    <div className="space-y-3" dir="rtl">
      <label
        htmlFor="batch-file-upload"
        onDragOver={e => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) void processFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 cursor-pointer transition-colors ${
          isDragging
            ? 'border-cyan-300 bg-cyan-500/15'
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isCompressing ? (
          <Loader2 size={40} className="text-cyan-300 animate-spin" />
        ) : (
          <Upload size={40} className="text-white/40" />
        )}
        <div className="text-center space-y-1">
          <p className="text-white font-medium">
            {isCompressing ? 'מכווץ תמונות...' : 'העלו כמה תמונות מנות'}
          </p>
          <p className="text-white/45 text-sm">
            גרירה או לחיצה · עד {BATCH_MAX_IMAGES} תמונות · נשארו {Math.max(remaining, 0)}
          </p>
        </div>
        <input
          id="batch-file-upload"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={disabled || isCompressing || remaining <= 0}
          onChange={e => {
            if (e.target.files) void processFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {items.map(item => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40"
            >
              <img
                src={item.previewUrl}
                alt={item.fileName}
                className="h-24 w-full object-cover"
              />
              {!disabled && item.status !== 'working' && item.status !== 'done' ? (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="absolute top-1 left-1 p-1 rounded-full bg-black/70 text-white hover:bg-black/90"
                  aria-label={`הסר ${item.fileName}`}
                >
                  <X size={12} />
                </button>
              ) : null}
              <p className="truncate px-2 py-1 text-[10px] text-white/60">{item.fileName}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
