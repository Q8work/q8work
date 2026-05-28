-- Q8Work seed data (local/dev)
-- Default admin login: admin@q8work.com / admin1234   (CHANGE in production!)

INSERT OR IGNORE INTO users (id, email, password_hash, role, status, created_at)
VALUES (
  'u_admin_seed',
  'admin@q8work.com',
  'pbkdf2$100000$g1SRWMh7vc4yZu1DeXpl1A==$09QHzwy/fsjGw7zaFfvQe7xdjJ+5xSFh5UFbW7rcQig=',
  'admin',
  'active',
  1748000000000
);
