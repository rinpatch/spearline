"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getProcessedStories, ProcessedStory } from "@/lib/service/story-service"

// Replace the BiasBadges component with:
const BiasBadges = ({
  breakdown,
  size = "default",
}: { breakdown: Record<string, number>; size?: "default" | "small" }) => (
  <div className={`flex flex-wrap ${size === "small" ? "gap-1" : "gap-2"}`}>
    {Object.entries(breakdown)
      .filter(([, percentage]) => percentage > 0)
      .sort(([, a], [, b]) => b - a) // Sort by percentage descending
      .map(([bias, percentage]) => (
        <span
          key={bias}
          className={`inline-flex items-center rounded-full font-medium ${
            size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
          } ${
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

// New component to show sources with clickable links
const SourcesList = ({
  sources,
  size = "default",
  linkable = true,
}: {
  sources: Array<{
    name: string;
    bias: string;
    slug: string;
  }>;
  size?: "default" | "small"
  linkable?: boolean
}) => (
  <div className={`flex flex-wrap ${size === "small" ? "gap-1" : "gap-2"} items-center`}>
    <span className={`${size === "small" ? "text-xs" : "text-sm"} text-gray-500 font-medium`}>Sources:</span>
    {sources.slice(0, 3).map((source, index) =>
      linkable ? (
        <Link key={index} href={`/source/${source.slug}`}>
          <span
            className={`${size === "small" ? "text-xs" : "text-sm"} text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ${
              index < sources.length - 1 ? "after:content-[','] after:text-gray-500 after:ml-1" : ""
            }`}
          >
            {source.name}
          </span>
        </Link>
      ) : (
        <span
          key={index}
          className={`${size === "small" ? "text-xs" : "text-sm"} text-gray-700 ${
            index < sources.length - 1 ? "after:content-[','] after:text-gray-500 after:ml-1" : ""
          }`}
        >
          {source.name}
        </span>
      ),
    )}
    {sources.length > 3 && (
      <span className={`${size === "small" ? "text-xs" : "text-sm"} text-gray-500`}>+{sources.length - 3} more</span>
    )}
  </div>
)

export default function SpearlineHomepage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stories, setStories] = useState<ProcessedStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStories() {
      try {
        setLoading(true)
        const fetchedStories = await getProcessedStories(10)
        setStories(fetchedStories)
      } catch (err) {
        console.error('Error fetching stories:', err)
        setError('Failed to load stories')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const featuredStory = stories[0]
  const topStories = stories.slice(1, 4)
  const remainingStories = stories.slice(4)

  // Mock blindspot data - this would come from the backend later
  const blindspotArticles = [
    {
      title: "Rural Internet Infrastructure Gaps",
      missedBy: ["Pro-Government", "Pro-Malay/Bumiputera"],
      coveredBy: ["Pro-Opposition", "Multicultural"],
      impact: "High",
      sources: 12,
    },
    {
      title: "Youth Unemployment in Urban Areas",
      missedBy: ["Pro-Islam", "Pro-Government"],
      coveredBy: ["Secular-Leaning", "Pro-Opposition"],
      impact: "Medium",
      sources: 8,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <img src="/spearline-logo.png" alt="Spearline Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Spearline</h1>
                <p className="text-xs text-gray-500 leading-tight">Piercing Bias. Truth in the Line.</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/about"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1 rounded hover:bg-gray-50"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Top Stories - Show above main content on mobile */}
        <div className="lg:hidden mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top News Stories</h2>
          <div className="space-y-3">
            {topStories.map((story) => (
              <Link key={story.id} href={`/article/${story.id}`}>
                <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 cursor-pointer">
                    {story.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{story.totalSources} sources</span>
                    <span>{story.date}</span>
                  </div>
                  <SourcesList sources={story.sources} size="small" linkable={false} />
                  <div className="mt-2">
                    <BiasBadges breakdown={story.biasBreakdown} size="small" />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{story.coverage}% coverage</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Desktop Left Sidebar - Top Stories */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Top News Stories</h2>
              <div className="space-y-4">
                {topStories.map((story) => (
                  <Link key={story.id} href={`/article/${story.id}`}>
                    <div className="border-b border-gray-200 pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded -m-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 cursor-pointer">
                        {story.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{story.totalSources} sources</span>
                        <span>{story.date}</span>
                      </div>
                      <SourcesList sources={story.sources} size="small" linkable={false} />
                      <div className="mt-2">
                        <BiasBadges breakdown={story.biasBreakdown} size="small" />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">{story.coverage}% coverage</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Featured Story - More Compact */}
            {featuredStory && (
              <Link href={`/article/${featuredStory.id}`}>
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img
                        src="/ringgit-banknotes.jpg"
                        alt="Featured story"
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5 p-5">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <span className="font-medium">{featuredStory.totalSources} sources</span>
                        <span>•</span>
                        <span>{featuredStory.date}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-blue-600">
                        {featuredStory.title}
                      </h2>
                      <p className="text-gray-700 mb-4 text-sm leading-relaxed">{featuredStory.summary}</p>

                      {/* Sources List */}
                      <div className="mb-3">
                        <SourcesList sources={featuredStory.sources} linkable={false} />
                      </div>

                      {/* Bias Analysis */}
                      <div className="mb-3">
                        <BiasBadges breakdown={featuredStory.biasBreakdown} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Search Bar - More Compact */}
            <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Malaysian news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Story Grid - More Compact */}
            <div className="grid md:grid-cols-2 gap-4">
              {remainingStories.map((story) => (
                <Link key={story.id} href={`/article/${story.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="font-medium">{story.totalSources} sources</span>
                        <span>{story.date}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 leading-tight text-sm hover:text-blue-600">
                        {story.title}
                      </h3>
                      <p className="text-gray-700 mb-3 text-xs leading-relaxed">{story.summary}</p>

                      {/* Sources */}
                      <div className="mb-2">
                        <SourcesList sources={story.sources} size="small" linkable={false} />
                      </div>

                      {/* Bias Analysis */}
                      <div className="mb-2">
                        <BiasBadges breakdown={story.biasBreakdown} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{story.coverage}% coverage</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Blindspot Section - Improved */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">BLINDSPOT</div>
                <h2 className="text-lg font-bold text-gray-900">Coverage Gaps</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {blindspotArticles.map((item, index) => (
                  <div key={index} className="bg-white rounded border border-red-200 p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-medium">Missing:</span>
                        <span className="text-gray-700">{item.missedBy.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">Covered:</span>
                        <span className="text-gray-700">{item.coveredBy.join(", ")}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className={
                            item.impact === "High"
                              ? "border-red-500 text-red-700 bg-red-50"
                              : "border-yellow-500 text-yellow-700 bg-yellow-50"
                          }
                        >
                          {item.impact} Impact
                        </Badge>
                        <span className="text-gray-500">{item.sources} sources</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <img src="/spearline-logo.png" alt="Spearline" className="h-6 w-6" />
              <span className="text-gray-700 font-medium">Spearline Malaysia</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
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
