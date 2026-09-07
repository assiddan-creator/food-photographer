'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Images } from 'lucide-react';

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
          ? 'המצלמה לא זמינה בדפדפן הזה. נסו שוב, או צלמו ממכשיר עם מצלמה.'
          : 'אין גישה למצלמה. בדקו הרשאות בדפדפן, ואז נסו שוב.',
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

  const cameraFailed = Boolean(errorMsg) && !isStarting && !isCameraOpen;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">צלמו את המנה עכשיו</h2>
        <p className="text-sm text-white/50">במטבח מצלמים — לא מחפשים קובץ</p>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black sm:aspect-[4/5]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover ${cameraFailed ? 'invisible' : ''}`}
        />

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

        {cameraFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 shadow-[0_0_32px_rgba(34,211,238,0.35)]">
              <Camera size={30} strokeWidth={2.25} />
            </div>
            <p className="max-w-sm text-sm font-medium text-amber-100">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void startCamera(facingMode)}
              className="w-full max-w-xs rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-zinc-950 hover:bg-cyan-300"
            >
              נסה מצלמה שוב
            </button>
            {onOpenGallery ? (
              <button
                type="button"
                onClick={onOpenGallery}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-white/25 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Images size={16} />
                העלה מתמונות
              </button>
            ) : null}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {cameraFailed ? null : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={switchCamera}
            className="rounded-2xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            החלף מצלמה
          </button>
          {onOpenGallery ? (
            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Images size={16} />
              העלה מתמונות
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
