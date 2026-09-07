'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  autoStart?: boolean;
  onOpenGallery?: () => void;
}

export default function CameraCapture({
  onCapture,
  autoStart = false,
  onOpenGallery,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
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

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    try {
      setErrorMsg(null);
      setIsStarting(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported');
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
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
          ? 'המצלמה לא זמינה בדפדפן הזה. העלו מתמונות.'
          : 'אין גישה למצלמה. תוודא שנתת הרשאות, או העלה מתמונות.',
      );
      setIsCameraOpen(false);
    } finally {
      setIsStarting(false);
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      void startCamera('environment');
    }
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(base64);
    stopCamera();
  };

  const switchCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    void startCamera(next);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {errorMsg ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
          {errorMsg}
        </div>
      ) : null}

      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black sm:aspect-[4/5]">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        {isStarting && !isCameraOpen ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            פותח מצלמה…
          </div>
        ) : null}
        {isCameraOpen ? (
          <span className="absolute top-3 right-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
            ● LIVE
          </span>
        ) : null}
        <p className="absolute inset-x-0 bottom-24 bg-black/55 px-4 py-2 text-center text-xs font-medium text-white/90">
          מקם את כל המנה בתוך המסגרת · אור טבעי עדיף
        </p>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center px-4 pb-5 pt-8">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isCameraOpen}
            className="size-[72px] rounded-full border-[5px] border-white bg-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.45)] disabled:opacity-40"
            aria-label="צלם מנה"
          />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between px-1 text-sm text-white/55">
        <button type="button" onClick={switchCamera} className="hover:text-white">
          החלף מצלמה
        </button>
        <button type="button" onClick={onOpenGallery} className="hover:text-white">
          העלה מתמונות ▾
        </button>
      </div>

      {!isCameraOpen && !isStarting ? (
        <button
          type="button"
          onClick={() => void startCamera(facingMode)}
          className="rounded-2xl bg-cyan-400 py-3 text-sm font-bold text-zinc-950"
        >
          פתח מצלמה
        </button>
      ) : null}
    </div>
  );
}
