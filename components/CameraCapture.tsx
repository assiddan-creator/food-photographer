'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  autoStart?: boolean;
  onCancel?: () => void;
  onOpenGallery?: () => void;
}

export default function CameraCapture({
  onCapture,
  autoStart = false,
  onCancel,
  onOpenGallery,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(autoStart);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setErrorMsg(null);
      setIsStarting(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        await video.play().catch(() => undefined);
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMsg(
        error instanceof Error && error.message === 'unsupported'
          ? 'המצלמה לא זמינה בדפדפן הזה. העלו מהגלריה.'
          : 'אין גישה למצלמה. תוודא שנתת הרשאות בדפדפן, או העלה מהגלריה.',
      );
      setIsCameraOpen(false);
    } finally {
      setIsStarting(false);
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      void startCamera();
    }
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64);
        stopCamera();
      }
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel?.();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {errorMsg ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
          {errorMsg}
        </div>
      ) : null}

      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-black ${
          isCameraOpen ? 'block' : isStarting ? 'block' : 'hidden'
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        {isStarting && !isCameraOpen ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            פותח מצלמה…
          </div>
        ) : null}
        {isCameraOpen ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent px-4 py-5">
            <button
              type="button"
              onClick={handleCancel}
              className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white"
              aria-label="בטל"
            >
              <X size={18} />
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-cyan-400 text-zinc-950 shadow-[0_0_24px_rgba(34,211,238,0.45)]"
              aria-label="צלם"
            >
              <Camera size={28} />
            </button>
            <span className="size-11" aria-hidden />
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {!isCameraOpen && !isStarting ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            type="button"
            onClick={() => void startCamera()}
            className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3.5 text-base font-bold text-zinc-950 hover:bg-cyan-300"
          >
            <Camera size={18} />
            פתח מצלמה
          </button>
          {onOpenGallery ? (
            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80"
            >
              <Upload size={14} />
              העלאה מהגלריה
            </button>
          ) : null}
          {onCancel ? (
            <button type="button" onClick={handleCancel} className="text-xs text-white/35 hover:text-white/60">
              ביטול
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
