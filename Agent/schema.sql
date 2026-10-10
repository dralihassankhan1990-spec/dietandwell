-- ═══════════════════════════════════════════════════════════════
-- DietAndWell — PostgreSQL Schema
-- FILE: /backend/src/config/schema.sql
-- 
-- AGENT: Run this file once against your PostgreSQL database.
-- Command: psql -U your_user -d dietandwell -f schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ADMIN USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(500) NOT NULL,
  slug          VARCHAR(500) UNIQUE NOT NULL,
  content       TEXT NOT NULL,
  excerpt       VARCHAR(1000),
  cover_image   VARCHAR(1000),
  category      VARCHAR(100),
  tags          TEXT[] DEFAULT '{}',
  author        VARCHAR(255) DEFAULT 'Admin',
  views         INTEGER DEFAULT 0,
  published     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── CONTACTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(50),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NEWSLETTER SUBSCRIBERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  confirmed  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CALCULATOR SAVES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calculator_saves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  calc_type   VARCHAR(100) NOT NULL,  -- 'bmi' | 'tdee' | 'bodyfat' | 'macros' | 'water' | 'idealweight'
  result_data JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_category  ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created   ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- ── SEED: Admin user ───────────────────────────────────────────
-- AGENT: Run this separately after generating the bcrypt hash.
-- Generate hash: node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"
-- Then replace <BCRYPT_HASH_HERE> below and uncomment:
-- 
-- INSERT INTO admin_users (email, password_hash)
-- VALUES ('admin@dietandwell.com', '<BCRYPT_HASH_HERE>')
-- ON CONFLICT (email) DO NOTHING;
