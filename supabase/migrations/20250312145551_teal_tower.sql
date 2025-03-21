/*
  # Create form submissions table

  1. New Tables
    - `form_submissions`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `role` (text, not null)
      - `retailer_id` (uuid, foreign key to retailers.id)
      - `email` (text, not null)
      - `interested_in_evhc` (boolean, not null)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `form_submissions` table
    - Add policy for authenticated users to read all submissions
    - Add policy for anonymous users to insert submissions
*/

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  retailer_id uuid REFERENCES retailers(id),
  email text NOT NULL,
  interested_in_evhc boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all form submissions
CREATE POLICY "Authenticated users can read form submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to insert submissions (for the public form)
CREATE POLICY "Anonymous users can insert form submissions"
  ON form_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);