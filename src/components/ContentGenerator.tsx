import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Copy, Heart, Share, Loader2 } from 'lucide-react';

const LANGUAGES = [
  { value: 'Hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { value: 'Marathi', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { value: 'Bengali', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
];

const CONTENT_TYPES = [
  { value: 'social_media_post', label: 'Social Media Post', icon: '📱' },
  { value: 'product_description', label: 'Product Description', icon: '📦' },
  { value: 'ad_copy', label: 'Advertisement Copy', icon: '📢' },
  { value: 'whatsapp_message', label: 'WhatsApp Message', icon: '💬' },
  { value: 'email_campaign', label: 'Email Campaign', icon: '📧' },
];

const TONES = [
  { value: 'friendly', label: 'Friendly & Warm', icon: '😊' },
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'exciting', label: 'Exciting & Fun', icon: '🎉' },
  { value: 'urgent', label: 'Urgent & Action', icon: '⚡' },
  { value: 'warm', label: 'Warm & Personal', icon: '🤗' },
];

const FESTIVALS = [
  'Diwali', 'Holi', 'Eid', 'Durga Puja', 'Ganesh Chaturthi', 'Karva Chauth', 'Dussehra', 'Christmas', 'New Year'
];

interface GeneratedContent {
  id: string;
  content_type: string;
  product_service: string;
  language: string;
  generated_text: string;
  tone: string;
  created_at: string;
  is_favorite: boolean;
}

export default function ContentGenerator() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    productService: '',
    keyMessage: '',
    targetAudience: '',
    contentType: '',
    language: '',
    tone: '',
    festivalContext: '',
  });
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!formData.productService || !formData.contentType || !formData.language || !formData.tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketing-content', {
        body: {
          productService: formData.productService,
          keyMessage: formData.keyMessage,
          targetAudience: formData.targetAudience,
          contentType: formData.contentType,
          language: formData.language,
          tone: formData.tone,
          festivalContext: formData.festivalContext,
        },
      });

      if (error) throw error;

      setGeneratedText(data.generatedText);
      toast({
        title: "Content Generated! ✨",
        description: `Your ${formData.language} ${formData.contentType.replace('_', ' ')} is ready!`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedText || !user) return;

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('generated_content')
        .insert({
          user_id: user.id,
          content_type: formData.contentType,
          product_service: formData.productService,
          key_message: formData.keyMessage,
          target_audience: formData.targetAudience,
          tone: formData.tone,
          language: formData.language,
          generated_text: generatedText,
          festival_context: formData.festivalContext,
          is_favorite: false,
        });

      if (error) throw error;

      toast({
        title: "Content Saved! 💾",
        description: "Your generated content has been saved to your library.",
      });

      // Update usage analytics
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      await supabase
        .from('usage_analytics')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          generation_count: 1,
          subscription_tier: 'free',
        }, {
          onConflict: 'user_id,month_year',
        });

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied! 📋",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content.",
        variant: "destructive",
      });
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generatedText);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-orange-500" />
            AI Marketing Content Generator
          </CardTitle>
          <CardDescription>
            Create compelling marketing content in regional Indian languages for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Product/Service Name *</Label>
                <Input
                  id="product"
                  placeholder="e.g., Special Diwali Thali, iPhone 15, Handmade Jewelry"
                  value={formData.productService}
                  onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="message">Key Message/Offer</Label>
                <Input
                  id="message"
                  placeholder="e.g., 20% off, Free delivery, Limited time offer"
                  value={formData.keyMessage}
                  onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Young professionals, Families, College students"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <Label>Festival/Occasion Context</Label>
                <Select value={formData.festivalContext} onValueChange={(value) => setFormData({ ...formData, festivalContext: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select festival (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {FESTIVALS.map((festival) => (
                      <SelectItem key={festival} value={festival}>
                        {festival}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Content Type *</Label>
                <Select value={formData.contentType} onValueChange={(value) => setFormData({ ...formData, contentType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          {type.icon} {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language *</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                          {lang.flag} {lang.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone *</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <span className="flex items-center gap-2">
                          {tone.icon} {tone.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedText && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content</span>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {formData.language}
                </Badge>
                <Badge variant="outline" className="border-green-200 text-green-800">
                  {formData.contentType.replace('_', ' ')}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="min-h-[120px] border-0 bg-transparent resize-none text-lg leading-relaxed"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              
              <Button onClick={shareToWhatsApp} variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                <Share className="mr-2 h-4 w-4" />
                Share on WhatsApp
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                Save to Library
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}