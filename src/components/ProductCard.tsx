"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const category = categories.find((c) => c.id === product.category_id);

  const handleDelete = async (e: React.MouseEvent) => {
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

  return (
    <>
      <div className="card flex items-center gap-3 p-3 transition-shadow hover:shadow-md">
        <Link
          href={`/product/${product.id}`}
          className="flex flex-1 items-center gap-3 overflow-hidden"
          aria-label={`查看 ${product.name} 详情`}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {product.name}
            </h3>
            {category && (
              <span className="mt-0.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">
                {category.name}
              </span>
            )}
            {product.barcode && (
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {product.barcode}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <span className="text-lg font-bold text-red-500">
              {formatPrice(product.price)}
            </span>
          </div>
        </Link>

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0 rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label={`删除 ${product.name}`}
            tabIndex={0}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {showDeleteDialog && (
        <ConfirmDialog
          title="删除商品"
          message={`确定要删除"${product.name}"吗？此操作不可撤销。`}
          confirmLabel="删除"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
};
