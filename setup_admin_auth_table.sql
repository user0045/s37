
-- Create admin_auth table for storing admin credentials
CREATE TABLE admin_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_login_attempts table for tracking login attempts and IP restrictions
CREATE TABLE admin_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    admin_name VARCHAR(50) NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_successful BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO admin_auth (admin_name, password) VALUES ('admin', 'admin123');

-- Create index for better performance
CREATE INDEX idx_admin_login_attempts_ip ON admin_login_attempts(ip_address);
CREATE INDEX idx_admin_login_attempts_time ON admin_login_attempts(attempt_time);

-- Row Level Security (RLS) policies
ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to admin_auth
CREATE POLICY "Allow read admin_auth" ON admin_auth
FOR SELECT USING (true);

-- Policy to allow all operations on admin_login_attempts
CREATE POLICY "Allow all admin_login_attempts" ON admin_login_attempts
FOR ALL USING (true);
