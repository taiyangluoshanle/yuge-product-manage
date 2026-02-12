"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanBarcode, Save, Loader2 } from "lucide-react";
import { createProduct, getCategories } from "@/lib/api";
import { safeParsePrice } from "@/lib/utils";
import { ScannerWrapper } from "@/components/ScannerWrapper";
import { ImageUpload } from "@/components/ImageUpload";
import { Toast } from "@/components/Toast";
import type { Category, ProductFormData, ProductUnit } from "@/lib/types";
import { PRODUCT_UNITS } from "@/lib/types";

const AddProductPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // 从 URL 参数读取条形码（扫码查价未找到商品时跳转过来）
  const barcodeFromUrl = searchParams.get("barcode") || "";

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    barcode: barcodeFromUrl,
    price: "",
    unit: "件" as ProductUnit,
    category_id: "",
    note: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScanSuccess = (barcode: string) => {
    setFormData((prev) => ({ ...prev, barcode }));
    setShowScanner(false);
    setToast({ message: `已识别条形码: ${barcode}`, type: "success" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await createProduct(formData);
      setToast({ message: "商品添加成功！", type: "success" });
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      console.error("Create product error:", err);
      setToast({ message: "添加失败，请重试", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* 顶部标题 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">录入商品</h1>
        <p className="mt-1 text-sm text-gray-500">
          扫码或手动录入商品信息
        </p>
      </header>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 px-4 py-4">
        {/* 图片上传 */}
        <ImageUpload
          imageUrl={formData.image_url}
          onImageChange={(url) => handleInputChange("image_url", url)}
        />

        {/* 条形码 */}
        <div className="space-y-1.5">
          <label
            htmlFor="barcode"
            className="block text-sm font-medium text-gray-700"
          >
            条形码
          </label>
          <div className="flex gap-2">
            <input
              id="barcode"
              type="text"
              value={formData.barcode}
              onChange={(e) => handleInputChange("barcode", e.target.value)}
              placeholder="扫描或手动输入条形码"
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
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            商品名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="请输入商品名称"
            className="input-field"
            required
          />
        </div>

        {/* 价格 + 单位 */}
        <div className="space-y-1.5">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            价格（元） <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="0.00"
              className="input-field flex-1"
              required
            />
            <select
              id="unit"
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

        {/* 分类 */}
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            分类
          </label>
          <select
            id="category"
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

        {/* 备注 */}
        <div className="space-y-1.5">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700"
          >
            备注
          </label>
          <textarea
            id="note"
            value={formData.note}
            onChange={(e) => handleInputChange("note", e.target.value)}
            placeholder="可选，补充商品信息..."
            className="input-field min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary w-full gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "保存中..." : "保存商品"}
        </button>
      </form>

      {/* 条形码扫描器 */}
      {showScanner && (
        <ScannerWrapper
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
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

export default AddProductPage;
