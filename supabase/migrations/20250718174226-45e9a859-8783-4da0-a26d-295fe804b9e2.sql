-- Create influencer applications table
CREATE TABLE public.influencer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_username TEXT NOT NULL,
  follower_count INTEGER NOT NULL,
  traffic_range TEXT NOT NULL,
  email TEXT NOT NULL,
  products_to_promote TEXT[] NOT NULL,
  country_of_residence TEXT NOT NULL,
  followers_location TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (though this will be public data)
ALTER TABLE public.influencer_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for form submissions)
CREATE POLICY "Anyone can submit applications" 
ON public.influencer_applications 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow reading applications (for admin review)
CREATE POLICY "Anyone can view applications" 
ON public.influencer_applications 
FOR SELECT 
TO anon
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_influencer_applications_updated_at
BEFORE UPDATE ON public.influencer_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_influencer_applications_created_at ON public.influencer_applications(created_at DESC);
CREATE INDEX idx_influencer_applications_email ON public.influencer_applications(email);