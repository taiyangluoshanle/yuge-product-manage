"use client";

import { useState } from "react";
import {
  X,
  Pencil,
  Save,
  Package,
  Loader2,
  ScanBarcode,
  ArrowLeft,
} from "lucide-react";
import { formatPrice, formatDate, safeParsePrice } from "@/lib/utils";
import { updateProduct, getCategories } from "@/lib/api";
import { ImagePreview } from "@/components/ImagePreview";
import { ImageUpload } from "@/components/ImageUpload";
import { ScannerWrapper } from "@/components/ScannerWrapper";
import { Toast } from "@/components/Toast";
import type { Product, Category, ProductFormData, ProductUnit } from "@/lib/types";
import { PRODUCT_UNITS } from "@/lib/types";

interface ProductDetailModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onUpdated?: (product: Product) => void;
}

export const ProductDetailModal = ({
  product,
  categories,
  onClose,
  onUpdated,
}: ProductDetailModalProps) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const category = categories.find((c) => c.id === product.category_id);

  const [formData, setFormData] = useState<ProductFormData>({
    name: product.name,
    barcode: product.barcode || "",
    price: product.price.toString(),
    unit: product.unit || "件",
    category_id: product.category_id || "",
    note: product.note || "",
    image_url: product.image_url || "",
  });

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

    setIsSaving(true);
    try {
      const updated = await updateProduct(product.id, formData, product.price);
      setToast({ message: "保存成功", type: "success" });
      setIsEditing(false);
      onUpdated?.(updated);
      setTimeout(onClose, 800);
    } catch (err) {
      console.error("Update error:", err);
      setToast({ message: "保存失败，请重试", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: product.name,
      barcode: product.barcode || "",
      price: product.price.toString(),
      unit: product.unit || "件",
      category_id: product.category_id || "",
      note: product.note || "",
      image_url: product.image_url || "",
    });
  };

  const handleScanSuccess = (barcode: string) => {
    setFormData((prev) => ({ ...prev, barcode }));
    setShowScanner(false);
    setToast({ message: `已识别条形码: ${barcode}`, type: "success" });
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
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? "编辑商品" : "商品详情"}
            </h3>
            <button
              onClick={isEditing ? handleCancelEdit : onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label={isEditing ? "取消编辑" : "关闭"}
              tabIndex={0}
            >
              {isEditing ? (
                <ArrowLeft className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* 内容 */}
          <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
            {isEditing ? (
              /* ========== 编辑模式 ========== */
              <div className="space-y-4">
                {/* 图片 */}
                <ImageUpload
                  imageUrl={formData.image_url}
                  onImageChange={(url) => handleInputChange("image_url", url)}
                />

                {/* 条形码 */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-barcode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    条形码
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="modal-barcode"
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        handleInputChange("barcode", e.target.value)
                      }
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

                {/* 商品名称 */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    商品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
                    className="input-field"
                    required
                  />
                </div>

                {/* 价格 + 单位 */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    价格（元） <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="modal-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      className="input-field flex-1"
                      required
                    />
                    <select
                      id="modal-unit"
                      value={formData.unit}
                      onChange={(e) =>
                        handleInputChange("unit", e.target.value)
                      }
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

                {/* 分类 */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    分类
                  </label>
                  <select
                    id="modal-category"
                    value={formData.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
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

                {/* 备注 */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-note"
                    className="block text-sm font-medium text-gray-700"
                  >
                    备注
                  </label>
                  <textarea
                    id="modal-note"
                    value={formData.note}
                    onChange={(e) =>
                      handleInputChange("note", e.target.value)
                    }
                    placeholder="可选，补充商品信息..."
                    className="input-field min-h-[60px] resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              /* ========== 查看模式 ========== */
              <>
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
              </>
            )}
          </div>

          {/* 底部操作 */}
          <div className="border-t border-gray-100 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex-1 gap-1.5"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "保存中..." : "保存"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary w-full gap-1.5"
              >
                <Pencil className="h-4 w-4" />
                编辑商品
              </button>
            )}
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

      {/* 扫码 */}
      {showScanner && (
        <ScannerWrapper
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
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
    </>
  );
};
