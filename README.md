# 商品价格管理

家庭商品价格管理工具，支持扫码录入、拍照上传、分类管理和价格历史追踪。

## 技术栈

- Next.js 14 + TypeScript
- TailwindCSS
- Supabase（数据库 + 图片存储）
- html5-qrcode（条形码扫描）
- Lucide React（图标）

## 快速开始

### 第一步：设置 Supabase

1. 打开 [supabase.com](https://supabase.com)，注册账号（免费）
2. 点击「New Project」创建一个新项目
3. 等待项目初始化完成
4. 进入项目，点击左侧菜单「SQL Editor」
5. 将 `supabase-setup.sql` 文件中的内容粘贴进去，点击「Run」执行
6. 创建图片存储桶：
   - 点击左侧菜单「Storage」
   - 点击「New bucket」
   - 名称填 `product-images`
   - 勾选「Public bucket」
   - 点击确认创建
7. 获取 API 密钥：
   - 点击左侧菜单「Settings」→「API」
   - 复制「Project URL」和「anon public」Key

### 第二步：配置环境变量

在项目根目录创建 `.env.local` 文件：

```
NEXT_PUBLIC_SUPABASE_URL=你复制的Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你复制的anon_key
```

### 第三步：安装依赖并运行

```bash
cd price-manager
npm install
npm run dev
```

打开浏览器访问 http://localhost:3000

### 部署到 Vercel（可选，让家人都能访问）

1. 将代码推送到 GitHub
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 点击「Import Project」，选择你的仓库
4. 在 Environment Variables 中添加上面两个环境变量
5. 点击「Deploy」
6. 部署完成后会得到一个 `.vercel.app` 的链接，分享给家人即可

## 功能列表

- 商品列表浏览和搜索
- 条形码扫描录入
- 拍照上传商品图片
- 手动录入商品信息
- 商品分类管理
- 价格编辑和历史记录追踪
- 移动端适配（手机端友好）
