import { supabase } from "./supabase";
import { safeParsePrice, isPriceEqual } from "./utils";
import type { Product, PriceHistory, Category, ProductFormData } from "./types";

// ==================== 商品相关 ====================

const PAGE_SIZE = 20;

export type SortOption = "updated_at" | "price_asc" | "price_desc";

export const getProducts = async (
  search?: string,
  categoryId?: string,
  page = 0,
  sort: SortOption = "updated_at"
): Promise<{ data: Product[]; hasMore: boolean }> => {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  // 排序
  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  query = query.range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const products = data || [];
  const total = count || 0;
  const hasMore = from + products.length < total;

  return { data: products, hasMore };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getProductByBarcode = async (
  barcode: string
): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createProduct = async (
  formData: ProductFormData
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: formData.name,
      barcode: formData.barcode || null,
      price: safeParsePrice(formData.price),
      unit: formData.unit || "件",
      category_id: formData.category_id || null,
      note: formData.note || null,
      image_url: formData.image_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (
  id: string,
  formData: ProductFormData,
  oldPrice: number
): Promise<Product> => {
  const newPrice = safeParsePrice(formData.price);

  // 如果价格变了，记录价格历史
  if (!isPriceEqual(newPrice, oldPrice)) {
    await supabase.from("price_history").insert({
      product_id: id,
      old_price: oldPrice,
      new_price: newPrice,
    });
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name: formData.name,
      barcode: formData.barcode || null,
      price: newPrice,
      unit: formData.unit || "件",
      category_id: formData.category_id || null,
      note: formData.note || null,
      image_url: formData.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

// ==================== 价格历史 ====================

export const getPriceHistory = async (
  productId: string
): Promise<PriceHistory[]> => {
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", productId)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// ==================== 分类相关 ====================

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createCategory = async (name: string): Promise<Category> => {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (
  id: string,
  name: string
): Promise<Category> => {
  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  // 先把该分类下的商品分类置空
  await supabase
    .from("products")
    .update({ category_id: null })
    .eq("category_id", id);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
};

// ==================== 图片上传 ====================

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};
