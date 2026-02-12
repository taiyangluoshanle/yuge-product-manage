export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  changed_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export type ProductFormData = {
  name: string;
  barcode: string;
  price: string;
  category_id: string;
  note: string;
  image_url: string;
};
