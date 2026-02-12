"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, Tag } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";
import type { Category } from "@/lib/types";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setToast({ message: "加载分类失败", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast({ message: "请输入分类名称", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsAdding(false);
      setToast({ message: "分类添加成功", type: "success" });
      await fetchCategories();
    } catch (err) {
      console.error("Add category error:", err);
      setToast({ message: "添加失败，请重试", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      setToast({ message: "分类名称不能为空", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      await updateCategory(editingId, editingName.trim());
      setEditingId(null);
      setEditingName("");
      setToast({ message: "修改成功", type: "success" });
      await fetchCategories();
    } catch (err) {
      console.error("Update category error:", err);
      setToast({ message: "修改失败，请重试", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      setToast({ message: "删除成功", type: "success" });
      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      setToast({ message: "删除失败，请重试", type: "error" });
    }
  };

  return (
    <div className="flex flex-col">
      {/* 顶部标题 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">分类管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理商品分类标签
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary gap-1 text-sm"
            aria-label="新增分类"
          >
            <Plus className="h-4 w-4" />
            新增
          </button>
        )}
      </header>

      <main className="flex-1 px-4 py-4">
        {/* 添加新分类 */}
        {isAdding && (
          <div className="card mb-4 flex items-center gap-2 p-3">
            <Tag className="h-5 w-5 shrink-0 text-primary-500" />
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="输入分类名称"
              className="input-field flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewCategoryName("");
                }
              }}
              aria-label="新分类名称"
            />
            <button
              onClick={handleAddCategory}
              disabled={isSaving}
              className="rounded-lg p-2 text-green-600 hover:bg-green-50"
              aria-label="确认添加"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCategoryName("");
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              aria-label="取消添加"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* 分类列表 */}
        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              还没有分类
            </h3>
            <p className="text-sm text-gray-500">
              点击右上角"新增"按钮创建分类
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="card flex items-center gap-3 p-3"
              >
                <Tag className="h-5 w-5 shrink-0 text-primary-500" />

                {editingId === category.id ? (
                  /* 编辑模式 */
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="input-field flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      aria-label="编辑分类名称"
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                      aria-label="保存修改"
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                      aria-label="取消编辑"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  /* 查看模式 */
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label={`编辑${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`删除${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 删除确认框 */}
      {deletingCategory && (
        <ConfirmDialog
          title="删除分类"
          message={`确定要删除分类"${deletingCategory.name}"吗？该分类下的商品将变为"未分类"。`}
          confirmLabel="删除"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCategory(null)}
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

export default CategoriesPage;
