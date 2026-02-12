"use client";

import { useEffect, useState, useCallback } from "react";
import { getProducts, getCategories } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Toast } from "@/components/Toast";
import type { Product, Category } from "@/lib/types";

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(search || undefined, selectedCategory || undefined),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("加载数据失败，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchData]);

  return (
    <div className="flex flex-col">
      {/* 顶部标题 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-3 pt-4">
        <h1 className="mb-3 text-xl font-bold text-gray-900">商品价格管理</h1>
        <SearchBar value={search} onChange={setSearch} />
        {categories.length > 0 && (
          <div className="mt-3">
            <CategoryFilter
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        )}
      </header>

      {/* 商品列表 */}
      <main className="flex-1 px-4 py-3">
        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : products.length === 0 ? (
          <EmptyState
            title={search || selectedCategory ? "未找到匹配的商品" : "还没有商品"}
            description={
              search || selectedCategory
                ? "试试其他搜索条件"
                : '点击下方「录入」按钮添加第一个商品'
            }
            actionLabel={!search && !selectedCategory ? "去录入商品" : undefined}
            actionHref={!search && !selectedCategory ? "/add" : undefined}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">共 {products.length} 件商品</p>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast 提示 */}
      {error && (
        <Toast message={error} type="error" onClose={() => setError("")} />
      )}
    </div>
  );
};

export default HomePage;
