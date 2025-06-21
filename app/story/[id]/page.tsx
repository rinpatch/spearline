"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, ExternalLink, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getProcessedStoryById, DetailedStory } from "@/lib/service/story-service"

// BiasAnalysis interface for typing
interface BiasAnalysis {
  summary: string;
  sentiment_overall: {
    score: number;
    label: 'Positive' | 'Negative' | 'Neutral';
  };
  sentiment_towards_government: {
    score: number;
    explanation: string;
  };
  "sentiment_towards_Malay and Bumiputera": {
    score: number;
    explanation: string;
  };
  sentiment_towards_Islam: {
    score: number;
    explanation: string;
  };
  sentiment_towards_Multicultural: {
    score: number;
    explanation: string;
  };
  sentiment_towards_Secular_learning: {
    score: number;
    explanation: string;
  };
  topics_detected: string[];
}

// Bias configuration object for cleaner code
const BIAS_CONFIG = {
  'Pro-Government': {
    label: 'Gov',
    className: 'bg-red-50 text-red-700'
  },
  'Pro-Opposition': {
    label: 'Opp',
    className: 'bg-blue-50 text-blue-700'
  },
  'Pro-Malay/Bumiputera': {
    label: 'Malay',
    className: 'bg-amber-50 text-amber-700'
  },
  'Pro-Islam': {
    label: 'Islam',
    className: 'bg-green-50 text-green-700'
  },
  'Secular-Leaning': {
    label: 'Secular',
    className: 'bg-yellow-50 text-yellow-700'
  },
  'Multicultural': {
    label: 'Multi',
    className: 'bg-orange-50 text-orange-700'
  },
  'Neutral': {
    label: 'Neutral',
    className: 'bg-gray-50 text-gray-700'
  }
} as const;

// Helper function to determine the primary bias from bias analysis
const getArticleBias = (biasAnalysis?: BiasAnalysis) => {
  if (!biasAnalysis) return { bias: 'Neutral', justification: 'No bias analysis available' };
  
  const sentiments = {
    'Pro-Government': biasAnalysis.sentiment_towards_government?.score || 0,
    'Pro-Malay/Bumiputera': biasAnalysis["sentiment_towards_Malay and Bumiputera"]?.score || 0,
    'Pro-Islam': biasAnalysis.sentiment_towards_Islam?.score || 0,
    'Multicultural': biasAnalysis.sentiment_towards_Multicultural?.score || 0,
    'Secular-Leaning': biasAnalysis.sentiment_towards_Secular_learning?.score || 0,
  };
  
  // Find the sentiment with the highest absolute value
  let primaryBias: keyof typeof BIAS_CONFIG = 'Neutral';
  let maxScore = 0;
  let justification = 'Neutral analysis with no strong bias detected';
  
  Object.entries(sentiments).forEach(([bias, score]) => {
    if (Math.abs(score) > Math.abs(maxScore)) {
      maxScore = score;
      primaryBias = bias as keyof typeof BIAS_CONFIG;
      
      // Get the explanation from the bias analysis
      if (bias === 'Pro-Government') {
        justification = biasAnalysis.sentiment_towards_government?.explanation || 'Government sentiment detected';
      } else if (bias === 'Pro-Malay/Bumiputera') {
        justification = biasAnalysis["sentiment_towards_Malay and Bumiputera"]?.explanation || 'Malay/Bumiputera sentiment detected';
      } else if (bias === 'Pro-Islam') {
        justification = biasAnalysis.sentiment_towards_Islam?.explanation || 'Islamic sentiment detected';
      } else if (bias === 'Multicultural') {
        justification = biasAnalysis.sentiment_towards_Multicultural?.explanation || 'Multicultural sentiment detected';
      } else if (bias === 'Secular-Leaning') {
        justification = biasAnalysis.sentiment_towards_Secular_learning?.explanation || 'Secular sentiment detected';
      }
    }
  });
  
  // If no strong bias detected (all scores close to 0), keep as Neutral
  if (Math.abs(maxScore) < 0.3) {
    primaryBias = 'Neutral';
    justification = 'Neutral analysis with no strong bias detected';
  }
  
  return { bias: primaryBias, justification };
};

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

const ArticlesList = ({ 
  articles 
}: { 
  articles: Array<{
    id: number;
    title: string;
    published_at: string;
    url?: string;
    bias_analysis?: BiasAnalysis;
    source: {
      name: string;
      bias: string;
      slug: string;
    };
  }> 
}) => (
  <TooltipProvider>
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Individual Articles ({articles.length})</h4>
      {articles.map((article) => {
        const { bias, justification } = getArticleBias(article.bias_analysis);
        const biasConfig = BIAS_CONFIG[bias as keyof typeof BIAS_CONFIG] || BIAS_CONFIG['Neutral'];
        
        return (
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium cursor-help ${biasConfig.className}`}
                    >
                      {biasConfig.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{justification}</p>
                  </TooltipContent>
                </Tooltip>
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
        );
      })}
    </div>
  </TooltipProvider>
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
                      Analysis based on language patterns, source selection, and framing techniques across {story.articles.length} articles.</div>
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