USE prishtina_traffic;

-- fshi data e vjetër (opsionale për reset)
DELETE FROM vehicles;

-- =========================
-- 🚍 BUSES (25)
-- =========================
INSERT INTO vehicles (type, lat, lng, status, route_name)
SELECT 
  'bus',
  42.6629 + (RAND() - 0.5) * 0.05,
  21.1655 + (RAND() - 0.5) * 0.05,
  'in_use',
  CONCAT('Line ', FLOOR(RAND()*10 + 1))
FROM (
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) a,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) b
LIMIT 25;

-- =========================
-- 🚕 TAXIS (40)
-- =========================
INSERT INTO vehicles (type, lat, lng, status)
SELECT 
  'taxi',
  42.6629 + (RAND() - 0.5) * 0.05,
  21.1655 + (RAND() - 0.5) * 0.05,
  IF(RAND() > 0.5, 'available', 'occupied')
FROM (
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) a,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) b,
(
  SELECT 1 UNION SELECT 2
) c
LIMIT 40;

-- =========================
-- 🚲 BIKES (200)
-- =========================
INSERT INTO vehicles (type, lat, lng, status)
SELECT 
  'bike',
  42.6629 + (RAND() - 0.5) * 0.05,
  21.1655 + (RAND() - 0.5) * 0.05,
  'locked'
FROM (
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) a,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) b,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) c
LIMIT 200;

-- =========================
-- 🛴 SCOOTERS (400)
-- =========================
INSERT INTO vehicles (type, lat, lng, status, battery_level)
SELECT 
  'scooter',
  42.6629 + (RAND() - 0.5) * 0.05,
  21.1655 + (RAND() - 0.5) * 0.05,
  'locked',
  FLOOR(RAND() * 100)
FROM (
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) a,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) b,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) c,
(
  SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
) d
LIMIT 400;