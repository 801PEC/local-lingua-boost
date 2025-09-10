import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Heart, 
  Copy, 
  Share, 
  Calendar,
  ArrowLeft,
  Trash2,
  Globe,
  Sparkles 
} from 'lucide-react';

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
  key_message?: string;
  target_audience?: string;
}

export default function ContentLibrary() {
  const { user, loading } = useAuth();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<GeneratedContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  useEffect(() => {
    filterContent();
  }, [content, searchQuery, selectedLanguage, selectedContentType, showFavoritesOnly]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Fetch content error:', error);
      toast({
        title: "Error",
        description: "Failed to load content library",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.product_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.generated_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key_message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(item => item.language === selectedLanguage);
    }

    if (selectedContentType !== 'all') {
      filtered = filtered.filter(item => item.content_type === selectedContentType);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.is_favorite);
    }

    setFilteredContent(filtered);
  };

  const toggleFavorite = async (contentId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ is_favorite: !currentFavorite })
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev =>
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

  const deleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev => prev.filter(item => item.id !== contentId));
      toast({
        title: "Content Deleted",
        description: "Content has been permanently removed",
      });
    } catch (error) {
      console.error('Delete content error:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
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

  const shareToWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Content Library</h1>
                  <p className="text-sm text-gray-600">Manage your generated content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <CardDescription>
              Search and filter your content library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                  <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                  <SelectItem value="Gujarati">ગુજરાતી (Gujarati)</SelectItem>
                  <SelectItem value="Kannada">ಕನ್ನಡ (Kannada)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Content Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content Types</SelectItem>
                  <SelectItem value="social_media_post">📱 Social Media Post</SelectItem>
                  <SelectItem value="product_description">📦 Product Description</SelectItem>
                  <SelectItem value="ad_copy">📢 Advertisement Copy</SelectItem>
                  <SelectItem value="whatsapp_message">💬 WhatsApp Message</SelectItem>
                  <SelectItem value="email_campaign">📧 Email Campaign</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly ? "bg-red-500 hover:bg-red-600" : "border-red-200 text-red-600 hover:bg-red-50"}
              >
                <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {content.length === 0 ? "No Content Yet" : "No Content Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {content.length === 0 
                ? "Start creating amazing multilingual content for your business!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {content.length === 0 && (
              <Button asChild className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700">
                <Link to="/">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getContentTypeIcon(item.content_type)}
                      </span>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">
                          {item.product_service}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {item.key_message && `${item.key_message} • `}
                          {item.target_audience}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(item.id, item.is_favorite)}
                      className="text-red-500 hover:text-red-600 shrink-0"
                    >
                      <Heart className={`h-4 w-4 ${item.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                      {item.language}
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-800">
                      {formatContentType(item.content_type)}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {item.tone}
                    </Badge>
                    {item.festival_context && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.festival_context}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                    <p className="text-gray-700 line-clamp-4 text-sm leading-relaxed">
                      {item.generated_text}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContent(item.generated_text)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareToWhatsApp(item.generated_text)}
                        className="h-8 w-8 p-0 text-green-600"
                      >
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContent(item.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredContent.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredContent.length} of {content.length} content pieces
          </div>
        )}
      </main>
    </div>
  );
}