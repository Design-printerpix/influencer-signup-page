-- Change products_to_promote from array to text since we now only allow one product selection
ALTER TABLE public.influencer_applications 
ALTER COLUMN products_to_promote TYPE text;