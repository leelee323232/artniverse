// Data conversion only: writes SQL and an archive; never connects to a database.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'database-import');
fs.mkdirSync(out, { recursive: true });
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const archive = JSON.parse(read('database-import/product-fixtures-archive.json'));
// Presale and auction are frontend-only demos; do not reinsert them on future exports.
const products = archive.products.filter(p => p.productType === 'general');
const { details, categories, reviews } = archive;
// UTF-8 hex literals avoid quote/backslash and SQL-mode dependent escaping.
const str = value => `(CONVERT(0x${Buffer.from(String(value), 'utf8').toString('hex')} USING utf8mb4) COLLATE utf8mb4_unicode_ci)`;
const json = value => str(JSON.stringify(value));
const text = value => value === '' ? "''" : str(value);
const lines = [
  '-- MySQL / MariaDB. Import 01-schema.sql once BEFORE this file.',
  '-- Sandbox fixture data; no DELETE, TRUNCATE, or existing-row overwrite.',
  '-- Run as one script in one connection. Dates are frozen at export time in the archive.',
  'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;', 'START TRANSACTION;',
];
const creatorIds = [...new Set(products.map(p => p.creatorId))];
for (const id of creatorIds) {
  const name = details.find(p => p.creatorId === id)?.creatorName ?? products.find(p => p.creatorId === id && p.creatorName)?.creatorName ?? `測試創作者 ${id}`;
  const key = str(`catalog-demo-v1-creator-${id}`);
  lines.push(`-- Test creator ${id}: ${name}`, `INSERT INTO creators (name, description, tags, followers, rating, total_reviews, import_key, created_at, updated_at) SELECT ${str(name)}, ${str('商品測試資料匯入，尚未綁定真實會員。')}, JSON_ARRAY(), 0, 0, 0, ${key}, NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM creators WHERE import_key = ${key});`, `SET @creator_${id} = (SELECT id FROM creators WHERE import_key = ${key});`);
}
for (const p of products) {
  const d = details.find(d => d.id === p.id) ?? {};
  const category = categories.find(c => c.id === p.categoryId);
  const meta = { ...p, legacyId: p.id, categoryDefinition: category, demoReviews: p.id === '1' ? reviews.map(r => ({ ...r, verified: false, isDemo: true })) : [], demoSold: d.sold ?? 0, isDemo: true };
  delete meta.id;
  const columns = ['name','price','original_price','image','category','category_id','stock','sold','rating','review_count','creator_id','creator_name','description','features','specifications','is_new','is_creator_product','product_type','is_active','sort_order','catalog_meta','import_key','created_at','updated_at'];
  const values = [str(p.name),p.price,d.originalPrice ?? p.price,json(d.images ?? [p.image]),str(category?.name ?? '商品'),str(p.categoryId),p.stock,0,0,0,`@creator_${p.creatorId}`,str(p.creatorName ?? d.creatorName ?? `測試創作者 ${p.creatorId}`),text(p.description ?? d.description ?? ''),json(d.features ?? []),json(d.specifications ?? {}),0,1,str(p.productType),p.isActive ? 1 : 0,p.sortOrder,json(meta),str(`catalog-demo-v1-product-${p.id}`),str(p.createdAt + ' 00:00:00'),'NOW()'];
  lines.push(`-- ${p.id}: ${p.name} (${p.productType})`, `INSERT INTO products (${columns.join(', ')}) SELECT ${values.join(', ')} WHERE NOT EXISTS (SELECT 1 FROM products WHERE import_key = ${str(`catalog-demo-v1-product-${p.id}`)});`);
}
lines.push('COMMIT;', 'SELECT id, name, product_type, is_active, import_key FROM products WHERE import_key LIKE \'catalog-demo-v1-product-%\' ORDER BY sort_order;');
fs.writeFileSync(path.join(out, '02-products.sql'), lines.join('\n\n') + '\n');
fs.writeFileSync(path.join(out, '01-schema.sql'), `-- Run once on the existing project schema. DDL commits implicitly in MySQL.
-- If these columns were already added, skip the corresponding ALTER statement.
ALTER TABLE creators ADD COLUMN import_key VARCHAR(100) NULL UNIQUE;
ALTER TABLE products
  ADD COLUMN product_type VARCHAR(16) NOT NULL DEFAULT 'general',
  ADD COLUMN is_active TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN catalog_meta JSON NULL,
  ADD COLUMN import_key VARCHAR(100) NULL UNIQUE;
`);
