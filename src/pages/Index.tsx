import { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import ContentGenerator from '@/components/ContentGenerator';
import { Sparkles, Globe, Heart, LogOut, BookOpen, User } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-green-600 rounded-full text-white shadow-xl">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              GenAI Local <span className="text-orange-500">बिज़नेस</span> Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              🇮🇳 Create compelling marketing content in 7 Indian languages. 
              Perfect for restaurants, shops, services, and all local businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white px-8 py-3"
              >
                <Link to="/auth">
                  <Globe className="mr-2 h-5 w-5" />
                  Start Creating Content
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Globe className="h-5 w-5" />
                  7 Indian Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">
                  Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, and Kannada. 
                  Create authentic content for your local audience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  Social media posts, WhatsApp messages, product descriptions, 
                  ads, and email campaigns - all culturally relevant.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Heart className="h-5 w-5" />
                  Festival Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  Special content for Diwali, Holi, Eid, and other Indian festivals. 
                  Perfect timing for seasonal marketing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sample Languages */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Supporting All Major Indian Languages</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { lang: 'Hindi', text: 'हिंदी', flag: '🇮🇳' },
                { lang: 'Tamil', text: 'தமிழ்', flag: '🇮🇳' },
                { lang: 'Telugu', text: 'తెలుగు', flag: '🇮🇳' },
                { lang: 'Marathi', text: 'मराठी', flag: '🇮🇳' },
                { lang: 'Bengali', text: 'বাংলা', flag: '🇮🇳' },
                { lang: 'Gujarati', text: 'ગુજરાતી', flag: '🇮🇳' },
                { lang: 'Kannada', text: 'ಕನ್ನಡ', flag: '🇮🇳' },
              ].map((item) => (
                <div key={item.lang} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-orange-400">
                  <div className="text-lg font-bold text-gray-900">{item.flag} {item.text}</div>
                  <div className="text-sm text-gray-600">{item.lang}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GenAI बिज़नेस</h1>
                <p className="text-sm text-gray-600">Marketing Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Content
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="generate">
            <ContentGenerator />
          </TabsContent>

          <TabsContent value="library">
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Library</h2>
              <p className="text-gray-600 mb-4">
                Browse and manage all your generated content
              </p>
              <Button asChild variant="outline">
                <Link to="/library">View Full Library</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
