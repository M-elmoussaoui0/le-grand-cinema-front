import { useEffect, useRef } from 'react';

interface BarcodeDetectorType {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorType;
  }
}

/** La lecture par caméra utilise l'API BarcodeDetector du navigateur (Chrome sur Android). */
export const cameraDisponible = () => typeof window !== 'undefined' && 'BarcodeDetector' in window;

/** Lit un QR code avec la caméra arrière du téléphone et renvoie son contenu. */
export function CameraQr({ onCode }: { onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.BarcodeDetector) return;
    const detecteur = new window.BarcodeDetector({ formats: ['qr_code'] });
    let flux: MediaStream | undefined;
    let dernier = '';
    let minuterie: ReturnType<typeof setInterval> | undefined;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((f) => {
        flux = f;
        if (!video.current) return;
        video.current.srcObject = f;
        video.current.play();
        minuterie = setInterval(async () => {
          if (!video.current) return;
          const [qr] = await detecteur.detect(video.current);
          // On ignore le même billet lu plusieurs fois de suite par la caméra
          if (qr && qr.rawValue !== dernier) {
            dernier = qr.rawValue;
            onCode(qr.rawValue);
          }
        }, 400);
      })
      .catch(() => undefined);

    return () => {
      clearInterval(minuterie);
      flux?.getTracks().forEach((piste) => piste.stop());
    };
  }, [onCode]);

  return <video ref={video} className="camera" muted playsInline aria-label="Caméra" />;
}
