"use client";

import { useState } from "react";
import { Package, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ImagePreview } from "@/components/ImagePreview";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import type { Product, Category } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onDelete?: (id: string) => Promise<void>;
}

export const ProductCard = ({
  product,
  categories,
  onDelete,
}: ProductCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const category = categories.find((c) => c.id === product.category_id);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(product.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.image_url) {
      setShowImagePreview(true);
    }
  };

  const handleCardClick = () => {
    setShowDetailModal(true);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowDetailModal(true);
    }
  };

  return (
    <>
      <div
        className="card flex cursor-pointer items-center gap-3 p-3 transition-shadow hover:shadow-md"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`查看 ${product.name} 详情`}
      >
        {/* 图片区域 - 点击放大 */}
        {product.image_url ? (
          <button
            onClick={handleImageClick}
            className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100"
            aria-label={`放大 ${product.name} 图片`}
            tabIndex={-1}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-110"
            />
          </button>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {/* 商品信息 */}
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {product.name}
          </h3>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {category && (
              <span className="inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">
                {category.name}
              </span>
            )}
            {product.unit && product.unit !== "件" && (
              <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
                按{product.unit}
              </span>
            )}
          </div>
          {product.barcode && (
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {product.barcode}
            </p>
          )}
        </div>

        {/* 价格 */}
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-red-500">
            {formatPrice(product.price, product.unit)}
          </span>
        </div>

        {/* 删除按钮 */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0 rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label={`删除 ${product.name}`}
            tabIndex={-1}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="删除商品"
          message={`确定要删除"${product.name}"吗？此操作不可撤销。`}
          confirmLabel="删除"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {/* 商品详情弹窗 */}
      {showDetailModal && (
        <ProductDetailModal
          product={product}
          categories={categories}
          onClose={() => setShowDetailModal(false)}
        />
      )}

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
