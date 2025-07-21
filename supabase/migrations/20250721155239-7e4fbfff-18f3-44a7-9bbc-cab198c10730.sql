-- Add unique constraint to prevent duplicate email submissions
ALTER TABLE public.influencer_applications 
ADD CONSTRAINT unique_email_constraint UNIQUE (email);