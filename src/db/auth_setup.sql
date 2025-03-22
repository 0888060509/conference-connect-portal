
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  preferences JSONB
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);

-- Create some demo users (passwords are 'password' hashed with bcrypt)
INSERT INTO users (id, email, password, first_name, last_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2a$10$KVfLF.mH8z1CWwXZd2HTe.Y.zRLMLDY7RB0JoK3Mtc7.vEKdpkzE2', 'Admin', 'User', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com', '$2a$10$KVfLF.mH8z1CWwXZd2HTe.Y.zRLMLDY7RB0JoK3Mtc7.vEKdpkzE2', 'Regular', 'User', 'user')
ON CONFLICT (email) DO NOTHING;
