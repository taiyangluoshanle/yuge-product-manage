"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScanBarcode, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getProducts, getCategories, deleteProduct, getProductByBarcode } from "@/lib/api";
import type { SortOption } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ScannerWrapper } from "@/components/ScannerWrapper";
import { Toast } from "@/components/Toast";
import type { Product, Category } from "@/lib/types";

const HomePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 首次加载 / 搜索 / 切换分类 / 切换排序时重新加载
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setPage(0);
      const [productsResult, categoriesData] = await Promise.all([
        getProducts(search || undefined, selectedCategory || undefined, 0, sortBy),
        getCategories(),
      ]);
      setProducts(productsResult.data);
      setHasMore(productsResult.hasMore);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch error:", err);
      setToast({ message: "加载数据失败，请检查网络连接", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  // 加载更多
  const fetchMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getProducts(
        search || undefined,
        selectedCategory || undefined,
        nextPage,
        sortBy
      );
      setProducts((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, search, selectedCategory, sortBy]);

  // 切换价格排序: 默认 -> 价格升序 -> 价格降序 -> 默认
  const handleToggleSort = useCallback(() => {
    setSortBy((prev) => {
      if (prev === "updated_at") return "price_asc";
      if (prev === "price_asc") return "price_desc";
      return "updated_at";
    });
  }, []);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // 删除商品
  const handleDeleteProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setToast({ message: "删除成功", type: "success" });
      } catch (err) {
        console.error("Delete error:", err);
        setToast({ message: "删除失败，请重试", type: "error" });
      }
    },
    []
  );

  // 扫码查价
  const handleScanSuccess = useCallback(
    async (barcode: string) => {
      setShowScanner(false);
      setNotFoundBarcode(null);
      try {
        const product = await getProductByBarcode(barcode);
        if (product) {
          router.push(`/product/${product.id}`);
        } else {
          setNotFoundBarcode(barcode);
        }
      } catch (err) {
        console.error("Scan search error:", err);
        setToast({ message: "查询失败，请重试", type: "error" });
      }
    },
    [router]
  );

  // 跳转到录入页
  const handleGoToAdd = useCallback(() => {
    if (!notFoundBarcode) return;
    router.push(`/add?barcode=${encodeURIComponent(notFoundBarcode)}`);
    setNotFoundBarcode(null);
  }, [notFoundBarcode, router]);

  // 搜索防抖
  useEffect(() => {
    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchData]);

  // IntersectionObserver 监听触底加载更多
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchMore]);

  return (
    <div className="flex flex-col">
      {/* 顶部标题 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">商品价格管理</h1>
          <button
            onClick={() => setShowScanner(true)}
            className="btn-secondary gap-1.5 text-sm"
            aria-label="扫码查价"
            tabIndex={0}
          >
            <ScanBarcode className="h-4 w-4" />
            扫码查价
          </button>
        </div>
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
        {/* 排序按钮 */}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleToggleSort}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sortBy !== "updated_at"
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-100 text-gray-600"
            }`}
            aria-label="价格排序"
            tabIndex={0}
          >
            {sortBy === "price_asc" && <ArrowUp className="h-3 w-3" />}
            {sortBy === "price_desc" && <ArrowDown className="h-3 w-3" />}
            {sortBy === "updated_at" && <ArrowUpDown className="h-3 w-3" />}
            {sortBy === "updated_at" && "价格排序"}
            {sortBy === "price_asc" && "价格从低到高"}
            {sortBy === "price_desc" && "价格从高到低"}
          </button>
        </div>
      </header>

      {/* 商品列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-1 px-4 py-3">
          {isLoading ? (
            <LoadingSpinner className="py-20" />
          ) : products.length === 0 ? (
            <EmptyState
              title={
                search || selectedCategory
                  ? "未找到匹配的商品"
                  : "还没有商品"
              }
              description={
                search || selectedCategory
                  ? "试试其他搜索条件"
                  : '点击下方「录入」按钮添加第一个商品'
              }
              actionLabel={
                !search && !selectedCategory ? "去录入商品" : undefined
              }
              actionHref={!search && !selectedCategory ? "/add" : undefined}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                共 {products.length} 件商品
                {hasMore && "+"}
              </p>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={categories}
                  onDelete={handleDeleteProduct}
                  onUpdated={(updated) => {
                    setProducts((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    );
                  }}
                />
              ))}

              {/* 触底加载区域 */}
              <div ref={loadMoreRef} className="py-4 text-center">
                {isLoadingMore && (
                  <LoadingSpinner size="sm" className="py-2" />
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-xs text-gray-300">没有更多了</p>
                )}
              </div>
            </div>
          )}
        </main>
      </PullToRefresh>

      {/* 扫码查价 */}
      {showScanner && (
        <ScannerWrapper
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* 扫码未找到商品提示 */}
      {notFoundBarcode && (
        <div className="fixed inset-x-0 bottom-20 z-50 mx-4 animate-fade-in">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-lg">
            <p className="text-sm font-medium text-orange-800">
              未找到条形码 <span className="font-mono">{notFoundBarcode}</span> 的商品
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleGoToAdd}
                className="flex-1 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white active:bg-primary-600"
                aria-label="去录入商品"
                tabIndex={0}
              >
                去录入该商品
              </button>
              <button
                onClick={() => setNotFoundBarcode(null)}
                className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-300"
                aria-label="关闭提示"
                tabIndex={0}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
