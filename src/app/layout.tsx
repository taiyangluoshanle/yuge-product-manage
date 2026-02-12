import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "商品价格管理",
  description: "家庭商品价格管理工具",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-lg bg-white pb-20">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        <BottomNav />
      </body>
    </html>
  );
};

export default RootLayout;
