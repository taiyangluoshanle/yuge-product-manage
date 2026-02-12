"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  ScanBarcode,
  History,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  getProductById,
  getCategories,
  getPriceHistory,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";
import { ScannerWrapper } from "@/components/ScannerWrapper";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Toast } from "@/components/Toast";
import { formatPrice, formatDate, safeParsePrice } from "@/lib/utils";
import type { Product, Category, PriceHistory, ProductFormData, ProductUnit } from "@/lib/types";
import { PRODUCT_UNITS } from "@/lib/types";

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    barcode: "",
    price: "",
    unit: "件" as ProductUnit,
    category_id: "",
    note: "",
    image_url: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productData, categoriesData, historyData] = await Promise.all([
        getProductById(productId),
        getCategories(),
        getPriceHistory(productId),
      ]);

      if (!productData) {
        setToast({ message: "商品不存在", type: "error" });
        setTimeout(() => router.push("/"), 1000);
        return;
      }

      setProduct(productData);
      setCategories(categoriesData);
      setPriceHistory(historyData);
      setFormData({
        name: productData.name,
        barcode: productData.barcode || "",
        price: productData.price.toString(),
        unit: productData.unit || "件",
        category_id: productData.category_id || "",
        note: productData.note || "",
        image_url: productData.image_url || "",
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setToast({ message: "加载失败", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setToast({ message: "请输入商品名称", type: "error" });
      return;
    }
    if (!formData.price || safeParsePrice(formData.price) <= 0) {
      setToast({ message: "请输入有效价格", type: "error" });
      return;
    }
    if (!product) return;

    setIsSaving(true);
    try {
      const updated = await updateProduct(product.id, formData, product.price);
      setProduct(updated);
      setIsEditing(false);
      setToast({ message: "保存成功", type: "success" });
      // 刷新价格历史
      const history = await getPriceHistory(productId);
      setPriceHistory(history);
    } catch (err) {
      console.error("Update error:", err);
      setToast({ message: "保存失败，请重试", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id);
      setToast({ message: "删除成功", type: "success" });
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ message: "删除失败，请重试", type: "error" });
    }
  };

  const handleScanSuccess = (barcode: string) => {
    setFormData((prev) => ({ ...prev, barcode }));
    setShowScanner(false);
  };

  const getPriceTrendIcon = (item: PriceHistory) => {
    if (item.new_price > item.old_price) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
    if (item.new_price < item.old_price) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (isLoading) {
    return <LoadingSpinner className="py-32" />;
  }

  if (!product) {
    return null;
  }

  const category = categories.find((c) => c.id === product.category_id);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // 重置表单
                  setFormData({
                    name: product.name,
                    barcode: product.barcode || "",
                    price: product.price.toString(),
                    unit: product.unit || "件",
                    category_id: product.category_id || "",
                    note: product.note || "",
                    image_url: product.image_url || "",
                  });
                }}
                className="btn-secondary text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary gap-1 text-sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                保存
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary text-sm"
              >
                编辑
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label="删除商品"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="space-y-6 px-4 py-4">
        {isEditing ? (
          /* ========== 编辑模式 ========== */
          <>
            <ImageUpload
              imageUrl={formData.image_url}
              onImageChange={(url) => handleInputChange("image_url", url)}
            />

            <div className="space-y-1.5">
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                条形码
              </label>
              <div className="flex gap-2">
                <input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  placeholder="条形码"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="btn-secondary shrink-0"
                  aria-label="扫描条形码"
                >
                  <ScanBarcode className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                商品名称 <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
                价格（元） <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="input-field flex-1"
                  required
                />
                <select
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="input-field w-20 shrink-0"
                  aria-label="计量单位"
                >
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      /{u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                分类
              </label>
              <select
                id="edit-category"
                value={formData.category_id}
                onChange={(e) => handleInputChange("category_id", e.target.value)}
                className="input-field"
              >
                <option value="">未分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700">
                备注
              </label>
              <textarea
                id="edit-note"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                className="input-field min-h-[80px] resize-none"
                rows={3}
              />
            </div>
          </>
        ) : (
          /* ========== 查看模式 ========== */
          <>
            {/* 商品信息卡片 */}
            <div className="card overflow-hidden">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="mt-2 text-3xl font-bold text-red-500">
                  {formatPrice(product.price, product.unit)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {category && (
                    <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-600">
                      {category.name}
                    </span>
                  )}
                  {product.unit && product.unit !== "件" && (
                    <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">
                      按{product.unit}
                    </span>
                  )}
                </div>
                {product.barcode && (
                  <p className="mt-2 text-sm text-gray-500">
                    条形码: {product.barcode}
                  </p>
                )}
                {product.note && (
                  <p className="mt-2 text-sm text-gray-600">{product.note}</p>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  录入时间: {formatDate(product.created_at)}
                </p>
                <p className="text-xs text-gray-400">
                  更新时间: {formatDate(product.updated_at)}
                </p>
              </div>
            </div>

            {/* 价格历史 */}
            <div className="card p-4">
              <div className="mb-3 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">价格变更记录</h3>
              </div>
              {priceHistory.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  暂无价格变更记录
                </p>
              ) : (
                <div className="space-y-2">
                  {priceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {getPriceTrendIcon(item)}
                        <div>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.old_price)}
                          </span>
                          <span className="mx-1.5 text-gray-300">→</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.new_price)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(item.changed_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 条形码扫描器 */}
      {showScanner && (
        <ScannerWrapper
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="删除商品"
          message={`确定要删除"${product.name}"吗？此操作不可撤销。`}
          confirmLabel="删除"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {/* Toast */}
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

export default ProductDetailPage;
