-- Create the database schema for GenAI Local Business Marketing Tool

-- Users profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  business_type TEXT,
  location TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  monthly_generations_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  target_audience TEXT,
  preferred_languages TEXT[] DEFAULT ARRAY['Hindi'],
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Generated content table
CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('social_media_post', 'product_description', 'ad_copy', 'whatsapp_message', 'email_campaign')),
  product_service TEXT NOT NULL,
  key_message TEXT,
  target_audience TEXT,
  tone TEXT NOT NULL CHECK (tone IN ('friendly', 'professional', 'exciting', 'urgent', 'warm')),
  language TEXT NOT NULL CHECK (language IN ('Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada')),
  generated_text TEXT NOT NULL,
  festival_context TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sample_input JSONB,
  language TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Usage analytics table
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_count INTEGER DEFAULT 0,
  month_year TEXT NOT NULL, -- Format: "YYYY-MM"
  subscription_tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses" 
ON public.businesses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own businesses" 
ON public.businesses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses" 
ON public.businesses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses" 
ON public.businesses 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for generated_content
CREATE POLICY "Users can view their own content" 
ON public.generated_content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content" 
ON public.generated_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" 
ON public.generated_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" 
ON public.generated_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for templates (public read access)
CREATE POLICY "Anyone can view templates" 
ON public.templates 
FOR SELECT 
USING (true);

-- RLS Policies for usage_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.usage_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.usage_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.usage_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample templates
INSERT INTO public.templates (business_type, content_type, template_name, sample_input, language, prompt_template) VALUES
('restaurant', 'social_media_post', 'Diwali Special Post', '{"product": "Special Thali", "offer": "20% off"}', 'Hindi', 'Write a festive social media post in Hindi for a restaurant''s Diwali special thali with 20% discount. Make it warm, inviting and culturally relevant for Indian customers.'),
('electronics', 'ad_copy', 'Festival Sale Ad', '{"product": "Smartphones", "discount": "30% off"}', 'Tamil', 'Create an exciting advertisement in Tamil for smartphone festival sale with 30% discount. Make it urgent and appealing for tech-savvy customers.'),
('clothing', 'whatsapp_message', 'New Collection Launch', '{"product": "Ethnic Wear", "occasion": "Wedding Season"}', 'Bengali', 'Write a WhatsApp business message in Bengali announcing new ethnic wear collection for wedding season. Keep it personal and engaging.'),
('beauty', 'product_description', 'Skincare Product', '{"product": "Face Cream", "benefits": "Natural ingredients"}', 'Marathi', 'Create a compelling product description in Marathi for natural face cream highlighting its benefits and ingredients.'),
('services', 'email_campaign', 'Service Promotion', '{"service": "Home Cleaning", "offer": "First booking free"}', 'Gujarati', 'Write an email campaign in Gujarati promoting home cleaning service with first booking free offer. Make it trustworthy and professional.');