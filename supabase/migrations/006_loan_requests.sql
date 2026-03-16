-- Loan requests table for async book lending
CREATE TYPE loan_request_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE loan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  message TEXT,
  status loan_request_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous/anon key) can create loan requests
CREATE POLICY "Anyone can create loan requests"
  ON loan_requests FOR INSERT
  WITH CHECK (true);

-- Only the book owner can view their requests
CREATE POLICY "Owners can view their loan requests"
  ON loan_requests FOR SELECT
  USING (auth.uid() = owner_id);

-- Only the book owner can update (accept/decline)
CREATE POLICY "Owners can update their loan requests"
  ON loan_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_loan_requests_owner_id ON loan_requests(owner_id);
CREATE INDEX idx_loan_requests_user_book_id ON loan_requests(user_book_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);

-- Reuse the existing updated_at trigger function
CREATE TRIGGER update_loan_requests_updated_at
  BEFORE UPDATE ON loan_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
