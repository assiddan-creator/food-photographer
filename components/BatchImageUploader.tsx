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
            ? 'border-cta bg-cta/10'
            : 'border-cta/50 bg-surface hover:bg-frame'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isCompressing ? (
          <Loader2 size={40} className="animate-spin text-cta" />
        ) : (
          <Upload size={40} className="text-muted" />
        )}
        <div className="space-y-1 text-center">
          <p className="font-medium text-cream">
            {isCompressing ? 'מכווץ תמונות...' : 'העלו כמה תמונות מנות'}
          </p>
          <p className="text-sm text-muted">
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
              className="card-gold relative overflow-hidden rounded-xl"
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
                  className="absolute top-1 left-1 rounded-full bg-bg/80 p-1 text-cream hover:bg-bg"
                  aria-label={`הסר ${item.fileName}`}
                >
                  <X size={12} />
                </button>
              ) : null}
              <p className="truncate px-2 py-1 text-[10px] text-muted">{item.fileName}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
