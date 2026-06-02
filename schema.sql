-- Q8Work D1 schema
-- منصة العمل الجزئي للكويتيين

-- Users: shared auth table for all roles (worker | company | admin)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('worker', 'company', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at    INTEGER NOT NULL
);

-- Sessions: opaque token -> user
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Worker (الكويتي) profile
CREATE TABLE IF NOT EXISTS worker_profiles (
  user_id            TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name          TEXT NOT NULL DEFAULT '',     -- derived: first_name + last_name
  first_name         TEXT NOT NULL DEFAULT '',
  last_name          TEXT NOT NULL DEFAULT '',
  photo_key          TEXT,
  bio                TEXT NOT NULL DEFAULT '',
  skills             TEXT NOT NULL DEFAULT '[]',   -- JSON array of skill strings
  area               TEXT NOT NULL DEFAULT '',     -- المنطقة الجغرافية
  phone              TEXT NOT NULL DEFAULT '',     -- shown to company only after acceptance
  email              TEXT NOT NULL DEFAULT '',     -- shown to company only after acceptance
  civil_id           TEXT NOT NULL DEFAULT '',     -- الرقم المدني
  civil_id_image_key TEXT,                          -- صورة الهوية المدنية (R2)
  civil_id_verified  INTEGER NOT NULL DEFAULT 0,
  availability       TEXT NOT NULL DEFAULT '[]',   -- JSON: ["morning","evening","weekend"]
  work_type          TEXT NOT NULL DEFAULT '',     -- field | office | remote
  commitment         TEXT NOT NULL DEFAULT '',     -- daily | weekly | project
  expected_salary    TEXT NOT NULL DEFAULT '',
  created_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_worker_area ON worker_profiles(area);

-- Company (الشركة) profile
CREATE TABLE IF NOT EXISTS company_profiles (
  user_id                  TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name             TEXT NOT NULL DEFAULT '',
  logo_key                 TEXT,
  description              TEXT NOT NULL DEFAULT '',
  commercial_registry_key  TEXT,                   -- السجل التجاري (uploaded doc)
  contact_name             TEXT NOT NULL DEFAULT '',
  contact_phone            TEXT NOT NULL DEFAULT '',
  sector                   TEXT NOT NULL DEFAULT '',
  website                  TEXT NOT NULL DEFAULT '',   -- public website
  public_email             TEXT NOT NULL DEFAULT '',   -- public contact email
  instagram                TEXT NOT NULL DEFAULT '',
  twitter                  TEXT NOT NULL DEFAULT '',   -- X
  linkedin                 TEXT NOT NULL DEFAULT '',
  verified                 INTEGER NOT NULL DEFAULT 0,
  created_at               INTEGER NOT NULL
);

-- Jobs / projects posted by companies
CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,
  company_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  duration        TEXT NOT NULL DEFAULT '',        -- day | week | month | project
  salary          TEXT NOT NULL DEFAULT '',
  area            TEXT NOT NULL DEFAULT '',
  work_type       TEXT NOT NULL DEFAULT '',        -- field | office | remote
  skills_required TEXT NOT NULL DEFAULT '[]',      -- JSON array
  headcount       INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Offers sent by companies to workers
CREATE TABLE IF NOT EXISTS offers (
  id              TEXT PRIMARY KEY,
  job_id          TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  company_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message         TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_offers_worker ON offers(worker_user_id);
CREATE INDEX IF NOT EXISTS idx_offers_company ON offers(company_user_id);

-- Internal messages between the two parties
CREATE TABLE IF NOT EXISTS messages (
  id                TEXT PRIMARY KEY,
  offer_id          TEXT REFERENCES offers(id) ON DELETE CASCADE,
  sender_user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  read              INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_offer ON messages(offer_id);

-- Ratings (1-5 stars) left after a completed engagement
CREATE TABLE IF NOT EXISTS ratings (
  id            TEXT PRIMARY KEY,
  offer_id      TEXT REFERENCES offers(id) ON DELETE SET NULL,
  rater_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ratee_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars         INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),  -- overall (avg of criteria)
  comment       TEXT NOT NULL DEFAULT '',
  criteria      TEXT NOT NULL DEFAULT '{}',   -- JSON: per-criterion stars
  badges        TEXT NOT NULL DEFAULT '[]',   -- JSON array of earned badges
  rehire        TEXT NOT NULL DEFAULT '',     -- definitely | yes | maybe | no
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee ON ratings(ratee_user_id);

-- Follows: a user follows a company to get notified of its new jobs
CREATE TABLE IF NOT EXISTS follows (
  follower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at       INTEGER NOT NULL,
  seen_at          INTEGER NOT NULL DEFAULT 0,   -- last time follower viewed the jobs feed
  PRIMARY KEY (follower_user_id, company_user_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_company ON follows(company_user_id);

-- Applications: a worker (الكويتي) applies to a posted job
CREATE TABLE IF NOT EXISTS applications (
  id             TEXT PRIMARY KEY,
  job_id         TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message        TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at     INTEGER NOT NULL,
  UNIQUE (job_id, worker_user_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications(worker_user_id);

-- Contact-us messages from the public form
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  delivered  INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at);
