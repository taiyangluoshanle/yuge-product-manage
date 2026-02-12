"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  categories: Category[];
}

export const ProductCard = ({ product, categories }: ProductCardProps) => {
  const category = categories.find((c) => c.id === product.category_id);

  return (
    <Link
      href={`/product/${product.id}`}
      className="card flex items-center gap-3 p-3 transition-shadow hover:shadow-md"
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
  );
};
