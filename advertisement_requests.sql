
-- Create advertisement_requests table
CREATE TABLE advertisement_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  user_ip INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_ip and created_at for rate limiting
CREATE INDEX idx_advertisement_requests_ip_created_at ON advertisement_requests(user_ip, created_at);

-- Create index on created_at for admin dashboard
CREATE INDEX idx_advertisement_requests_created_at ON advertisement_requests(created_at DESC);

-- Add RLS policy (if using Row Level Security)
ALTER TABLE advertisement_requests ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from anyone
CREATE POLICY "Allow insert advertisement requests" ON advertisement_requests
FOR INSERT WITH CHECK (true);

-- Policy to allow admin to select all
CREATE POLICY "Allow admin select advertisement requests" ON advertisement_requests
FOR SELECT USING (true);

-- Policy to allow admin to delete
CREATE POLICY "Allow admin delete advertisement requests" ON advertisement_requests
FOR DELETE USING (true);
