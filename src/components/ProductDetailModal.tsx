"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil, Package } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { ImagePreview } from "@/components/ImagePreview";
import type { Product, Category } from "@/lib/types";

interface ProductDetailModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
}

export const ProductDetailModal = ({
  product,
  categories,
  onClose,
}: ProductDetailModalProps) => {
  const router = useRouter();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const category = categories.find((c) => c.id === product.category_id);

  const handleGoToDetail = () => {
    onClose();
    router.push(`/product/${product.id}`);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[55] flex items-end justify-center bg-black/50 sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-label={`${product.name} 详情`}
      >
        <div
          className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-white sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">商品详情</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="关闭"
              tabIndex={0}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
            {/* 图片 */}
            <div className="mb-4 flex justify-center">
              {product.image_url ? (
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="overflow-hidden rounded-xl"
                  aria-label="点击放大图片"
                  tabIndex={0}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-full max-w-xs object-cover transition-transform hover:scale-105"
                  />
                </button>
              ) : (
                <div className="flex h-32 w-full max-w-xs items-center justify-center rounded-xl bg-gray-100">
                  <Package className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* 商品信息 */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">
                {product.name}
              </h2>

              <p className="text-3xl font-bold text-red-500">
                {formatPrice(product.price, product.unit)}
              </p>

              <div className="flex flex-wrap gap-2">
                {category && (
                  <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-600">
                    {category.name}
                  </span>
                )}
                {product.unit && (
                  <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">
                    按{product.unit}
                  </span>
                )}
              </div>

              {product.barcode && (
                <p className="text-sm text-gray-500">
                  <span className="text-gray-400">条形码：</span>
                  {product.barcode}
                </p>
              )}

              {product.note && (
                <p className="text-sm text-gray-600">
                  <span className="text-gray-400">备注：</span>
                  {product.note}
                </p>
              )}

              <div className="space-y-0.5 text-xs text-gray-400">
                <p>录入时间：{formatDate(product.created_at)}</p>
                <p>更新时间：{formatDate(product.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="border-t border-gray-100 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
            <button
              onClick={handleGoToDetail}
              className="btn-primary w-full gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              编辑商品
            </button>
          </div>
        </div>
      </div>

      {/* 图片放大预览 */}
      {showImagePreview && product.image_url && (
        <ImagePreview
          src={product.image_url}
          alt={product.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};
