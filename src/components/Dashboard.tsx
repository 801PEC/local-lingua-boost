import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Globe, Heart, TrendingUp, Calendar, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GeneratedContent {
  id: string;
  content_type: string;
  product_service: string;
  language: string;
  generated_text: string;
  tone: string;
  created_at: string;
  is_favorite: boolean;
  festival_context?: string;
}

interface UsageStats {
  generation_count: number;
  month_year: string;
  subscription_tier: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentContent, setRecentContent] = useState<GeneratedContent[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent content
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) throw contentError;
      setRecentContent(contentData || []);

      // Fetch current month usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageData, error: usageError } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month_year', currentMonth)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Usage error:', usageError);
      } else {
        setUsageStats(usageData);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (contentId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ is_favorite: !currentFavorite })
        .eq('id', contentId);

      if (error) throw error;

      setRecentContent(prev =>
        prev.map(item =>
          item.id === contentId ? { ...item, is_favorite: !currentFavorite } : item
        )
      );

      toast({
        title: !currentFavorite ? "Added to Favorites ❤️" : "Removed from Favorites",
        description: !currentFavorite ? "Content saved to your favorites" : "Content removed from favorites",
      });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const copyContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const formatContentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getContentTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'social_media_post': '📱',
      'product_description': '📦',
      'ad_copy': '📢',
      'whatsapp_message': '💬',
      'email_campaign': '📧',
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const generationsUsed = usageStats?.generation_count || 0;
  const generationsLimit = usageStats?.subscription_tier === 'premium' ? 'Unlimited' : 10;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to GenAI Marketing Assistant! 🇮🇳
        </h1>
        <p className="text-gray-600">Create amazing multilingual content for your business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {generationsUsed}/{generationsLimit}
            </div>
            <p className="text-xs text-orange-600">
              Generations used
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {recentContent.length}
            </div>
            <p className="text-xs text-green-600">
              Pieces created
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {recentContent.filter(item => item.is_favorite).length}
            </div>
            <p className="text-xs text-blue-600">
              Saved content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Content
          </CardTitle>
          <CardDescription>
            Your latest generated marketing content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No content generated yet. Start creating amazing multilingual content!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentContent.map((content) => (
                <div
                  key={content.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-orange-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getContentTypeIcon(content.content_type)}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {content.product_service}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(content.id, content.is_favorite)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart
                          className={`h-4 w-4 ${content.is_favorite ? 'fill-current' : ''}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContent(content.generated_text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                      {content.language}
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-800">
                      {formatContentType(content.content_type)}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {content.tone}
                    </Badge>
                    {content.festival_context && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        {content.festival_context}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 line-clamp-3 bg-white p-3 rounded border-l-4 border-orange-400">
                    {content.generated_text}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Generated on {new Date(content.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}