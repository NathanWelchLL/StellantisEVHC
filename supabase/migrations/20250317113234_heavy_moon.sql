/*
  # Update form_submissions table with additional questions

  1. Changes to existing tables
    - `form_submissions`: Adding new fields for detailed eVHC questionnaire
      - `current_process` (text): How users currently manage eVHC follow-ups
      - `process_effectiveness` (integer): Rating of current follow-up process effectiveness (1-5)
      - `challenges` (text): Biggest challenges with eVHC follow-ups
      - `missed_opportunities` (text): Frequency of missed service/repair opportunities
      - `automation_interest` (text): Interest in an automated solution
      - `automation_interest_comments` (text): Optional comments about automation interest
      - `valuable_features` (text): Most valuable features for an automated system
      - `expected_benefits` (text): Expected benefits from an automated system
      - `investment_willingness` (text): Willingness to invest in automation
      - `concerns` (text): Concerns about implementing an automated system
      - `additional_feedback` (text): Any other suggestions or feedback
*/

-- Add new columns to form_submissions table
DO $$ 
BEGIN
  -- Current Process & Efficiency
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'current_process') THEN
    ALTER TABLE form_submissions ADD COLUMN current_process text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'process_effectiveness') THEN
    ALTER TABLE form_submissions ADD COLUMN process_effectiveness integer;
  END IF;

  -- Challenges & Pain Points
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'challenges') THEN
    ALTER TABLE form_submissions ADD COLUMN challenges text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'missed_opportunities') THEN
    ALTER TABLE form_submissions ADD COLUMN missed_opportunities text;
  END IF;

  -- Interest & Readiness for Automation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'automation_interest') THEN
    ALTER TABLE form_submissions ADD COLUMN automation_interest text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'automation_interest_comments') THEN
    ALTER TABLE form_submissions ADD COLUMN automation_interest_comments text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'valuable_features') THEN
    ALTER TABLE form_submissions ADD COLUMN valuable_features text;
  END IF;

  -- Expected Benefits & ROI
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'expected_benefits') THEN
    ALTER TABLE form_submissions ADD COLUMN expected_benefits text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'investment_willingness') THEN
    ALTER TABLE form_submissions ADD COLUMN investment_willingness text;
  END IF;

  -- Additional Feedback
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'concerns') THEN
    ALTER TABLE form_submissions ADD COLUMN concerns text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'additional_feedback') THEN
    ALTER TABLE form_submissions ADD COLUMN additional_feedback text;
  END IF;

END $$;