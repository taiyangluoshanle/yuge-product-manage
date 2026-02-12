"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const isMountedRef = useRef(true);
  const isScanningRef = useRef(false);
  const [error, setError] = useState<string>("");
  const [isStarting, setIsStarting] = useState(true);

  const handleScanResult = useCallback(
    async (
      decodedText: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scanner: any
    ) => {
      if (!isMountedRef.current || !isScanningRef.current) return;
      isScanningRef.current = false;

      try {
        await scanner.stop();
      } catch (e) {
        console.error("Stop scanner error:", e);
      }

      if (isMountedRef.current) {
        onScanSuccess(decodedText);
        onClose();
      }
    },
    [onScanSuccess, onClose]
  );

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scannerInstance: any = null;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("当前浏览器不支持摄像头，请使用手动输入");
          setIsStarting(false);
          return;
        }

        const { Html5Qrcode } = await import("html5-qrcode");

        if (!isMountedRef.current) return;

        const html5QrCode = new Html5Qrcode("barcode-reader");
        scannerInstance = html5QrCode;
        isScanningRef.current = true;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777,
          },
          (decodedText: string) => {
            handleScanResult(decodedText, html5QrCode);
          },
          () => {
            // 忽略每帧扫描失败的回调
          }
        );

        if (isMountedRef.current) {
          setIsStarting(false);
        }
      } catch (err) {
        console.error("Scanner error:", err);
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : String(err);

          if (
            errorMessage.includes("Permission") ||
            errorMessage.includes("NotAllowed")
          ) {
            setError("摄像头权限被拒绝，请在浏览器设置中允许访问摄像头");
          } else if (
            errorMessage.includes("NotFound") ||
            errorMessage.includes("DevicesNotFound")
          ) {
            setError("未检测到摄像头设备");
          } else {
            setError("无法启动摄像头，请检查权限设置或使用手动输入");
          }
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      isMountedRef.current = false;
      isScanningRef.current = false;
      if (scannerInstance) {
        scannerInstance.stop().catch(() => {});
        try {
          scannerInstance.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [handleScanResult]);

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
          tabIndex={0}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center"
        ref={scannerRef}
      >
        <div id="barcode-reader" className="w-full max-w-md" />
        {isStarting && !error && (
          <div className="absolute text-sm text-gray-300">
            正在启动摄像头...
          </div>
        )}
      </div>

      {error && (
        <div className="space-y-3 bg-red-600 px-4 py-4 text-center">
          <p className="text-sm text-white">{error}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30"
          >
            关闭，手动输入条形码
          </button>
        </div>
      )}

      {!error && (
        <div className="bg-black/80 px-4 py-4 text-center text-sm text-gray-300">
          将条形码对准框内，自动识别
        </div>
      )}
    </div>
  );
};
