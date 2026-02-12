"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";

interface ImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export const ImageUpload = ({ imageUrl, onImageChange }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const url = await uploadImage(file);
      onImageChange(url);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        商品图片
      </label>

      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="商品图片"
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
            aria-label="移除图片"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-primary-400 hover:text-primary-500"
            aria-label="上传商品图片"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Camera className="h-8 w-8" />
                <span className="text-xs">拍照/上传</span>
              </>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="选择图片文件"
      />

      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
};
