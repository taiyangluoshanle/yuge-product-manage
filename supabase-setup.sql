-- =============================================
-- 商品价格管理系统 - Supabase 数据库建表脚本
-- 在 Supabase 后台 SQL Editor 中运行此脚本
-- =============================================

-- 1. 创建分类表
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建商品表
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建价格历史表
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2) NOT NULL,
  new_price DECIMAL(10,2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建索引，加速查询
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_price_history_product ON price_history(product_id);

-- 5. 启用 RLS（行级安全策略）并设置为公开访问
-- 因为是家庭自用，不需要用户认证，设置为公开读写
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读写所有数据
CREATE POLICY "允许公开读取分类" ON categories FOR SELECT USING (true);
CREATE POLICY "允许公开新增分类" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "允许公开修改分类" ON categories FOR UPDATE USING (true);
CREATE POLICY "允许公开删除分类" ON categories FOR DELETE USING (true);

CREATE POLICY "允许公开读取商品" ON products FOR SELECT USING (true);
CREATE POLICY "允许公开新增商品" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "允许公开修改商品" ON products FOR UPDATE USING (true);
CREATE POLICY "允许公开删除商品" ON products FOR DELETE USING (true);

CREATE POLICY "允许公开读取价格历史" ON price_history FOR SELECT USING (true);
CREATE POLICY "允许公开新增价格历史" ON price_history FOR INSERT WITH CHECK (true);
CREATE POLICY "允许公开删除价格历史" ON price_history FOR DELETE USING (true);

-- 6. 插入一些默认分类（可选）
INSERT INTO categories (name, sort_order) VALUES
  ('食品', 1),
  ('饮料', 2),
  ('日用品', 3),
  ('零食', 4),
  ('调味品', 5),
  ('生鲜', 6),
  ('其他', 99);
