"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, ExternalLink, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProcessedStoryById, DetailedStory } from "@/lib/service/story-service"

const BiasBadges = ({ breakdown }: { breakdown: Record<string, number> }) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(breakdown)
      .filter(([, percentage]) => percentage > 0)
      .sort(([, a], [, b]) => b - a) // Sort by percentage descending
      .map(([bias, percentage]) => (
        <span
          key={bias}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            bias === "Pro-Government"
              ? "bg-red-50 text-red-700 border border-red-100"
              : bias === "Pro-Opposition"
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : bias === "Pro-Malay/Bumiputera"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : bias === "Pro-Islam"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : bias === "Secular-Leaning"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                      : bias === "Multicultural"
                        ? "bg-orange-50 text-orange-700 border border-orange-100"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
          }`}
        >
          {bias === "Pro-Government"
            ? "Gov"
            : bias === "Pro-Opposition"
              ? "Opp"
              : bias === "Pro-Malay/Bumiputera"
                ? "Malay"
                : bias === "Pro-Islam"
                  ? "Islam"
                  : bias === "Secular-Leaning"
                    ? "Secular"
                    : bias === "Multicultural"
                      ? "Multi"
                      : "Neutral"}{" "}
          {percentage}%
        </span>
      ))}
  </div>
)

const SourcesList = ({ 
  sources, 
  showUrls = false 
}: { 
  sources: Array<{
    name: string;
    bias: string;
    slug: string;
  }>; 
  showUrls?: boolean 
}) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-900">Coverage Sources ({sources.length})</h4>
    <div className="grid grid-cols-1 gap-2">
      {sources.map((source, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            <Link href={`/source/${source.slug}`}>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                {source.name}
              </span>
            </Link>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                source.bias === "Pro-Government"
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : source.bias === "Pro-Opposition"
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : source.bias === "Pro-Malay/Bumiputera"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : source.bias === "Pro-Islam"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : source.bias === "Secular-Leaning"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : source.bias === "Multicultural"
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-gray-50 text-gray-700 border border-gray-100"
              }`}
            >
              {source.bias === "Pro-Government"
                ? "Gov"
                : source.bias === "Pro-Opposition"
                  ? "Opp"
                  : source.bias === "Pro-Malay/Bumiputera"
                    ? "Malay"
                    : source.bias === "Pro-Islam"
                      ? "Islam"
                      : source.bias === "Secular-Leaning"
                        ? "Secular"
                        : source.bias === "Multicultural"
                          ? "Multi"
                          : "Independent"}
            </span>
          </div>
          {showUrls && (
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Read
            </Button>
          )}
        </div>
      ))}
    </div>
  </div>
)

const ArticlesList = ({ 
  articles 
}: { 
  articles: Array<{
    id: number;
    title: string;
    published_at: string;
    url?: string;
    source: {
      name: string;
      bias: string;
      slug: string;
    };
  }> 
}) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-900">Individual Articles ({articles.length})</h4>
    {articles.map((article) => (
      <div key={article.id} className="border border-gray-200 rounded-lg p-3">
        <h5 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
          {article.title}
        </h5>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            <Link href={`/source/${article.source.slug}`}>
              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                {article.source.name}
              </span>
            </Link>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                article.source.bias === "Pro-Government"
                  ? "bg-red-50 text-red-700"
                  : article.source.bias === "Pro-Opposition"
                    ? "bg-blue-50 text-blue-700"
                    : article.source.bias === "Pro-Malay/Bumiputera"
                      ? "bg-amber-50 text-amber-700"
                      : article.source.bias === "Pro-Islam"
                        ? "bg-green-50 text-green-700"
                        : article.source.bias === "Secular-Leaning"
                          ? "bg-yellow-50 text-yellow-700"
                          : article.source.bias === "Multicultural"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-gray-50 text-gray-700"
              }`}
            >
              {article.source.bias === "Pro-Government"
                ? "Gov"
                : article.source.bias === "Pro-Opposition"
                  ? "Opp"
                  : article.source.bias === "Pro-Malay/Bumiputera"
                    ? "Malay"
                    : article.source.bias === "Pro-Islam"
                      ? "Islam"
                      : article.source.bias === "Secular-Leaning"
                        ? "Secular"
                        : article.source.bias === "Multicultural"
                          ? "Multi"
                          : "Independent"}
            </span>
          </div>
          <span>{new Date(article.published_at).toLocaleDateString()}</span>
        </div>
        {article.url && (
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Read Original
            </a>
          </Button>
        )}
      </div>
    ))}
  </div>
)

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<DetailedStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStory() {
      try {
        setLoading(true)
        const storyId = parseInt(params.id)
        if (isNaN(storyId)) {
          setError('Invalid story ID')
          return
        }
        
        const fetchedStory = await getProcessedStoryById(storyId)
        if (!fetchedStory) {
          setError('Story not found')
          return
        }
        
        setStory(fetchedStory)
      } catch (err) {
        console.error('Error fetching story:', err)
        setError('Failed to load story')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/spearline-logo.png" alt="Spearline Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Spearline</h1>
                <p className="text-xs text-gray-500 leading-tight">Piercing Bias. Truth in the Line.</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1 rounded hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to News</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span className="font-medium">{story.totalSources} sources</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{story.date}</span>
            </div>
            <span>•</span>
            <span>{story.coverage}% coverage</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">{story.title}</h1>

          {/* Featured Image */}
          <div className="mb-6">
            <img
              src="/ringgit-banknotes.jpg"
              alt={story.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Sources
              </Button>
            </div>

            {/* Sources List */}
            <div className="bg-gray-50 rounded-lg p-4">
              <SourcesList sources={story.sources} showUrls={true} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Summary</h2>
                <p className="text-gray-700 leading-relaxed">{story.summary}</p>
              </div>
              
              {/* Individual Articles */}
              <div className="mb-8">
                <ArticlesList articles={story.articles} />
              </div>
            </div>
          </div>

          {/* Sidebar - AI Analysis */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* AI Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">AI ANALYSIS</div>
                    <Badge variant="outline" className="text-xs">
                      {story.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{story.summary}</p>
                </CardContent>
              </Card>

              {/* Bias Analysis */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                      BIAS ANALYSIS
                    </div>
                  </div>
                  <div className="space-y-4">
                    <BiasBadges breakdown={story.biasBreakdown} />
                    <div className="text-xs text-gray-500">
                      <p>Analysis based on language patterns, source selection, and framing techniques across {story.articles.length} articles.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coverage Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">COVERAGE</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Sources</span>
                      <span className="font-semibold">{story.totalSources}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Articles</span>
                      <span className="font-semibold">{story.articles.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Coverage Score</span>
                      <span className="font-semibold">{story.coverage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Perspectives</span>
                      <span className="font-semibold">{Object.keys(story.biasBreakdown).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Stories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Stories</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Related stories will be shown here based on topic similarity.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <img src="/spearline-logo.png" alt="Spearline" className="h-6 w-6" />
              <span className="text-gray-700 font-medium">Spearline Malaysia</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
              <Link href="/about" className="hover:text-gray-900">
                About
              </Link>
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2024 Spearline. AI-powered bias transparency for Malaysian news.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 