-- ============================================
-- Davar Migration v4 — GPS → İl/İlçe
-- Supabase SQL Editor'de çalıştır
-- ============================================

-- 1. city ve district kolonları ekle
ALTER TABLE reports ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS district TEXT;

-- 2. Eski GPS kolonlarını kaldır (artık kullanılmıyor)
ALTER TABLE reports DROP COLUMN IF EXISTS latitude;
ALTER TABLE reports DROP COLUMN IF EXISTS longitude;
ALTER TABLE reports DROP COLUMN IF EXISTS address;

-- 3. city üzerinden filtreleme için index
CREATE INDEX IF NOT EXISTS idx_reports_city ON reports (city);
CREATE INDEX IF NOT EXISTS idx_reports_city_district ON reports (city, district);

-- 4. created_at üzerinden 7-gün sorguları için index
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
