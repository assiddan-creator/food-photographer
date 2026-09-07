'use client';

import { useCallback, useState, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, X } from 'lucide-react';
import { compressImage, fileToBase64 } from '@/lib/compress';
import { GlassCard } from './GlassCard';

interface Props {
  onImageReady: (base64: string, preview: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  variant?: 'dark';
}

export function ImageUploader({ onImageReady, onClear, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      const base64 = await fileToBase64(compressed);
      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);
      onImageReady(base64, previewUrl);
    } finally {
      setIsCompressing(false);
    }
  }, [onImageReady]);

  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
  };

  return (
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard
            className={`relative overflow-hidden ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            {...dropHandlers}
          >
            <div className="relative aspect-square">
              <img src={preview} alt="תצוגה מקדימה" className="h-full w-full rounded-2xl bg-black object-contain" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onClear?.();
                }}
                className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.label
          key="drop"
          htmlFor="file-upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          {...dropHandlers}
          className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-colors ${
            isDragging ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/25 bg-white/5'
          } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
          {isCompressing ? (
            <Loader2 size={44} className="animate-spin text-cyan-400" />
          ) : (
            <Upload size={44} className="text-white/45" />
          )}
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {isCompressing ? 'מכווץ תמונה...' : 'גרור לכאן או לחץ להעלאה'}
            </p>
            <p className="mt-1 text-sm text-white/40">עד 10MB · כיווץ אוטומטי</p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled || isCompressing}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
          />
        </motion.label>
      )}
    </AnimatePresence>
  );
}
