'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, X } from 'lucide-react';
import { compressImage, fileToBase64 } from '@/lib/compress';
import { GlassCard } from './GlassCard';

interface Props {
  onImageReady: (base64: string, preview: string) => void;
  disabled?: boolean;
  variant?: 'dark';
}

export function ImageUploader({ onImageReady, disabled, variant = 'dark' }: Props) {
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

  const wrapperClassName = `relative overflow-hidden transition-all duration-300 ${isDragging ? 'border-violet-400 bg-violet-500/20' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`;

  return (
    <GlassCard
      className={wrapperClassName}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative aspect-square">
            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl bg-black" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.label
            key="drop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-4 p-12 cursor-pointer"
            htmlFor="file-upload"
          >
            {isCompressing ? (
              <Loader2 size={48} className="text-violet-400 animate-spin" />
            ) : (
              <Upload size={48} className="text-white/40" />
            )}
            <div className="text-center">
              <p className="text-white font-medium">
                {isCompressing ? 'Compressing...' : 'Drop your food photo'}
              </p>
              <p className="text-white/40 text-sm mt-1">or click to browse · Max 10MB · Auto-compressed</p>
            </div>
            <input id="file-upload" type="file" accept="image/*" className="sr-only" disabled={disabled || isCompressing} onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          </motion.label>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
