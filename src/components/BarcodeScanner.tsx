"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, Keyboard } from "lucide-react";

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
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

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

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) return;
    onScanSuccess(trimmed);
    onClose();
  }, [manualBarcode, onScanSuccess, onClose]);

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

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
          "html5-qrcode"
        );

        if (!isMountedRef.current) return;

        // 显式指定要识别的条形码格式
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const html5QrCode = new Html5Qrcode("barcode-reader", {
          formatsToSupport,
          verbose: false,
        });
        scannerInstance = html5QrCode;
        isScanningRef.current = true;

        // 根据屏幕宽度动态计算扫描框尺寸
        const screenWidth = window.innerWidth;
        const qrboxWidth = Math.min(Math.floor(screenWidth * 0.85), 400);
        const qrboxHeight = Math.floor(qrboxWidth * 0.45);

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: qrboxWidth, height: qrboxHeight },
            aspectRatio: 1.777,
            disableFlip: false,
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="rounded-full p-1 text-white hover:bg-white/20"
            aria-label="手动输入条形码"
            tabIndex={0}
          >
            <Keyboard className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white hover:bg-white/20"
            aria-label="关闭扫描器"
            tabIndex={0}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* 手动输入区域 */}
      {showManualInput && (
        <div className="flex gap-2 bg-black/90 px-4 py-3">
          <input
            type="text"
            inputMode="numeric"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            placeholder="手动输入条形码"
            className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400"
            autoFocus
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim()}
            className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            确定
          </button>
        </div>
      )}

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
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setError("");
                setShowManualInput(true);
              }}
              className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30"
            >
              手动输入条形码
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {!error && !showManualInput && (
        <div className="bg-black/80 px-4 py-4 text-center text-sm text-gray-300">
          将条形码对准框内，自动识别
          <br />
          <span className="text-xs text-gray-500">
            识别不了？点右上角键盘图标手动输入
          </span>
        </div>
      )}
    </div>
  );
};
