import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/** 安全解析价格字符串，精确到分（两位小数） */
export const safeParsePrice = (value: string): number => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
};

/** 比较两个价格是否相等（避免浮点数精度问题） */
export const isPriceEqual = (a: number, b: number): boolean => {
  return Math.abs(a - b) < 0.001;
};

export const formatPrice = (price: number, unit?: string): string => {
  const priceStr = `¥${price.toFixed(2)}`;
  if (!unit) return priceStr;
  return `${priceStr}/${unit}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** 压缩图片，返回压缩后的 File 对象 */
export const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // 如果文件小于 200KB，不压缩
    if (file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
};
