'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // פתיחת המצלמה
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      // 'environment' פותח את המצלמה האחורית (מעולה לצילום אוכל/שטח)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMsg('אחי, אין גישה למצלמה. תוודא שנתת הרשאות בדפדפן.');
    }
  };

  // עצירת המצלמה (קריטי לביצועים ולניהול זיכרון)
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  }, []);

  // ניקוי המצלמה כשיוצאים מהקומפוננטה כדי שלא תרוץ ברקע
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // תפיסת התמונה כ-Base64
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // טריק של מקצוענים: דחיסה ל-80% איכות כ-JPEG ישר בקליינט.
        // שומר על משקל נמוך, מונע קריסות ב-Vercel ועף בטיל ל-Fal.ai
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64);
        stopCamera(); // סוגרים מצלמה אחרי הצילום
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-gray-900 text-white w-full max-w-md mx-auto">
      {errorMsg && <div className="text-red-500 font-bold">{errorMsg}</div>}

      {/* הוידאו לייב מהמצלמה */}
      <div
        className={`relative w-full aspect-[4/3] bg-black/40 rounded-lg overflow-hidden ${!isCameraOpen ? 'hidden' : 'block'}`}
      >
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
      </div>

      {/* קנבס מוסתר שמשמש רק לגזירת התמונה בפועל */}
      <canvas ref={canvasRef} className="hidden" />

      {/* כפתורי שליטה פשוטים לטסטים */}
      <div className="flex gap-4">
        {!isCameraOpen ? (
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
          >
            פתח מצלמה
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            >
              צלם!
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
            >
              בטל
            </button>
          </>
        )}
      </div>
    </div>
  );
}
