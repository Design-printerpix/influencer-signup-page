-- Remove duplicate entries keeping only the latest one per email
DELETE FROM public.influencer_applications a1 
USING public.influencer_applications a2 
WHERE a1.id < a2.id 
  AND a1.email = a2.email;

-- Add unique constraint to prevent duplicate email submissions
ALTER TABLE public.influencer_applications 
ADD CONSTRAINT unique_email_constraint UNIQUE (email);