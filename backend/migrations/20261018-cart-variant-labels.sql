-- Required when deploying with NODE_ENV=production (TypeORM synchronize is off).
-- Safe to run repeatedly.
ALTER TABLE "cart_items"
  ADD COLUMN IF NOT EXISTS "variantLabel" character varying;

ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "variantLabel" character varying;
