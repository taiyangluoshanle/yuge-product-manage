"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface ScannerWrapperProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

/** 用 ErrorBoundary 包裹 BarcodeScanner，防止扫码崩溃导致白屏 */
export const ScannerWrapper = ({
  onScanSuccess,
  onClose,
}: ScannerWrapperProps) => {
  return (
    <ErrorBoundary>
      <BarcodeScanner onScanSuccess={onScanSuccess} onClose={onClose} />
    </ErrorBoundary>
  );
};
