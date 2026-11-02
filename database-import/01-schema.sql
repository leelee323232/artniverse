-- Run once on the existing project schema. DDL commits implicitly in MySQL.
-- If these columns were already added, skip the corresponding ALTER statement.
ALTER TABLE creators ADD COLUMN import_key VARCHAR(100) NULL UNIQUE;
ALTER TABLE products
  ADD COLUMN product_type VARCHAR(16) NOT NULL DEFAULT 'general',
  ADD COLUMN is_active TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN catalog_meta JSON NULL,
  ADD COLUMN import_key VARCHAR(100) NULL UNIQUE;
