"use client"

import { ArrowLeft, Calendar, ExternalLink, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Update the mock article data to include the 6 specified sources
const article = {
  id: 1,
  title: "Malaysia's Digital Economy Initiative Receives Mixed Reception",
  image: "/placeholder.svg?height=400&width=800",
  content: `
    <p>The Malaysian government has announced a comprehensive RM50 billion digital transformation plan that aims to accelerate the country's transition into a digital economy powerhouse by 2030.</p>
    
    <p>Prime Minister Datuk Seri Anwar Ibrahim unveiled the initiative during a special parliamentary session, emphasizing that the plan will focus on artificial intelligence, blockchain technology, and digital infrastructure development across both public and private sectors.</p>
    
    <p>"This is not just about technology adoption," the Prime Minister stated. "This is about fundamentally reshaping how Malaysia operates in the digital age, ensuring we remain competitive on the global stage while creating opportunities for all Malaysians."</p>
    
    <p>The initiative includes several key components: a RM20 billion allocation for AI research and development centers, RM15 billion for blockchain infrastructure in government services, and RM15 billion for digital skills training programs targeting 2 million Malaysians over the next five years.</p>
    
    <p>However, the announcement has drawn mixed reactions from various quarters. Opposition leaders have questioned the timeline and feasibility of such an ambitious plan, while business groups have expressed cautious optimism about the potential economic benefits.</p>
    
    <p>Technology industry experts have praised the government's vision but emphasized the need for proper implementation frameworks and regulatory clarity to ensure the initiative's success.</p>
  `,
  summary:
    "Government announces RM50 billion digital transformation plan focusing on AI and blockchain adoption across public sectors, drawing mixed reactions from opposition and business groups.",
  biasBreakdown: {
    "Pro-Government": 40,
    "Secular-Leaning": 25,
    Multicultural: 20,
    "Pro-Malay/Bumiputera": 15,
  },
  sources: [
    { name: "Malay Mail", bias: "Pro-Government", url: "https://malaymail.com/example-article", slug: "malay-mail" },
    { name: "The Sun", bias: "Secular-Leaning", url: "https://thesundaily.my/example-article", slug: "the-sun" },
    {
      name: "Sin Chew Daily",
      bias: "Multicultural",
      url: "https://sinchew.com.my/example-article",
      slug: "sin-chew-daily",
    },
    {
      name: "Utusan Malaysia",
      bias: "Pro-Malay/Bumiputera",
      url: "https://utusan.com.my/example-article",
      slug: "utusan-malaysia",
    },
  ],
  date: "2024-01-15",
  totalSources: 4,
  coverage: 85,
  confidence: 87,
}

// Replace the BiasBadges component with:
const BiasBadges = ({ breakdown }: { breakdown: Record<string, number> }) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(breakdown)
      .filter(([_, percentage]) => percentage > 0)
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
                      : "bg-orange-50 text-orange-700 border border-orange-100"
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
                    : "Multi"}
          {percentage}%
        </span>
      ))}
  </div>
)

// Add the SourcesList component with clickable links
const SourcesList = ({ sources, showUrls = false }: { sources: any[]; showUrls?: boolean }) => (
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
                          : "bg-orange-50 text-orange-700 border border-orange-100"
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
                        : "Multi"}
            </span>
          </div>
          {showUrls && (
            <Button variant="ghost" size="sm" asChild>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Read
              </a>
            </Button>
          )}
        </div>
      ))}
    </div>
  </div>
)

export default function ArticlePage() {
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

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="mb-8">
          {/* Update the article header section to show total sources instead of single source */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span className="font-medium">{article.totalSources} sources</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
            <span>•</span>
            <span>{article.coverage}% coverage</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">{article.title}</h1>

          {/* Featured Image */}
          <div className="mb-6">
            <img
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          {/* Update the Action Buttons section to include sources list */}
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
              <SourcesList sources={article.sources} showUrls={true} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>

          {/* Sidebar - AI Analysis */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* AI Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">AI SUMMARY</div>
                    <Badge variant="outline" className="text-xs">
                      {article.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{article.summary}</p>
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
                    <BiasBadges breakdown={article.biasBreakdown} />
                    <div className="text-xs text-gray-500">
                      <p>Analysis based on language patterns, source selection, and framing techniques.</p>
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
                  {/* Update the Coverage Stats section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Sources</span>
                      <span className="font-semibold">{article.totalSources}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Coverage Score</span>
                      <span className="font-semibold">{article.coverage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Perspectives</span>
                      <span className="font-semibold">{Object.keys(article.biasBreakdown).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Stories</h3>
                  {/* Update the Related Articles section to show multiple sources */}
                  <div className="space-y-3">
                    <Link href="/article/2" className="block hover:bg-gray-50 p-2 rounded -m-2">
                      <h4 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                        Opposition Questions Digital Economy Timeline
                      </h4>
                      <p className="text-xs text-gray-500">4 sources • 2024-01-16</p>
                    </Link>
                    <Link href="/article/3" className="block hover:bg-gray-50 p-2 rounded -m-2">
                      <h4 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                        Tech Industry Welcomes Government Initiative
                      </h4>
                      <p className="text-xs text-gray-500">6 sources • 2024-01-16</p>
                    </Link>
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
