"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({
  onScanSuccess,
  onClose,
}: BarcodeScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let scanner: { clear: () => Promise<void>; stop: () => Promise<void> } | null = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5QrCode = new Html5Qrcode("barcode-reader");
        html5QrCodeRef.current = html5QrCode;
        scanner = html5QrCode as unknown as typeof scanner;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777,
          },
          (decodedText: string) => {
            onScanSuccess(decodedText);
            html5QrCode.stop().catch(console.error);
            onClose();
          },
          () => {
            // 忽略扫描失败的回调（每帧都会触发）
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setError("无法启动摄像头，请检查摄像头权限设置");
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between bg-black/80 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          <span className="text-sm font-medium">扫描条形码</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white hover:bg-white/20"
          aria-label="关闭扫描器"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center" ref={scannerRef}>
        <div id="barcode-reader" className="w-full max-w-md" />
      </div>

      {error && (
        <div className="bg-red-600 px-4 py-3 text-center text-sm text-white">
          {error}
        </div>
      )}

      <div className="bg-black/80 px-4 py-4 text-center text-sm text-gray-300">
        将条形码对准框内，自动识别
      </div>
    </div>
  );
};
