-- Create the GenAI marketing tool tables (skipping profiles table which already exists)

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
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Add business columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_generations_used INTEGER DEFAULT 0;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses" ON public.businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own businesses" ON public.businesses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own businesses" ON public.businesses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for generated_content
CREATE POLICY "Users can view their own content" ON public.generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content" ON public.generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON public.generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON public.generated_content FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for templates (public read access)
CREATE POLICY "Anyone can view templates" ON public.templates FOR SELECT USING (true);

-- RLS Policies for usage_analytics
CREATE POLICY "Users can view their own analytics" ON public.usage_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analytics" ON public.usage_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analytics" ON public.usage_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample templates
INSERT INTO public.templates (business_type, content_type, template_name, sample_input, language, prompt_template) VALUES
('restaurant', 'social_media_post', 'Diwali Special Post', '{"product": "Special Thali", "offer": "20% off"}', 'Hindi', 'Write a festive social media post in Hindi for a restaurant''s Diwali special thali with 20% discount. Make it warm, inviting and culturally relevant for Indian customers.'),
('electronics', 'ad_copy', 'Festival Sale Ad', '{"product": "Smartphones", "discount": "30% off"}', 'Tamil', 'Create an exciting advertisement in Tamil for smartphone festival sale with 30% discount. Make it urgent and appealing for tech-savvy customers.'),
('clothing', 'whatsapp_message', 'New Collection Launch', '{"product": "Ethnic Wear", "occasion": "Wedding Season"}', 'Bengali', 'Write a WhatsApp business message in Bengali announcing new ethnic wear collection for wedding season. Keep it personal and engaging.'),
('beauty', 'product_description', 'Skincare Product', '{"product": "Face Cream", "benefits": "Natural ingredients"}', 'Marathi', 'Create a compelling product description in Marathi for natural face cream highlighting its benefits and ingredients.'),
('services', 'email_campaign', 'Service Promotion', '{"service": "Home Cleaning", "offer": "First booking free"}', 'Gujarati', 'Write an email campaign in Gujarati promoting home cleaning service with first booking free offer. Make it trustworthy and professional.');