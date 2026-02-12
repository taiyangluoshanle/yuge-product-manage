"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = ({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="分类筛选"
    >
      <button
        onClick={() => onSelect("")}
        className={cn(
          "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors",
          selectedId === ""
            ? "bg-primary-600 text-white font-medium"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        role="tab"
        aria-selected={selectedId === ""}
        tabIndex={0}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors",
            selectedId === category.id
              ? "bg-primary-600 text-white font-medium"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          role="tab"
          aria-selected={selectedId === category.id}
          tabIndex={0}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
