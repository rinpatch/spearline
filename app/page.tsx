"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Updated data structure with only the 6 specified Malaysian news sources
const featuredArticle = {
  id: 1,
  title: "Malaysia's Digital Economy Initiative Receives Mixed Reception",
  image: "/ringgit-banknotes.jpg",
  summary:
    "Government announces RM50 billion digital transformation plan focusing on AI and blockchain adoption across public sectors, drawing varied reactions across political spectrum.",
  biasBreakdown: {
    "Pro-Government": 40,
    "Secular-Leaning": 25,
    Multicultural: 20,
    "Pro-Malay/Bumiputera": 15,
  },
  sources: [
    { name: "Malay Mail", bias: "Pro-Government", slug: "malay-mail" },
    { name: "The Sun", bias: "Secular-Leaning", slug: "the-sun" },
    { name: "Sin Chew Daily", bias: "Multicultural", slug: "sin-chew-daily" },
    { name: "Utusan Malaysia", bias: "Pro-Malay/Bumiputera", slug: "utusan-malaysia" },
  ],
  date: "2024-01-15",
  totalSources: 4,
}

// Updated articles with the 6 specified sources
const articles = [
  {
    id: 2,
    title: "Education Reform Bill Sparks Debate Across Communities",
    summary:
      "New legislation aims tostandardize curriculum across vernacular schools while maintaining cultural identity, generating diverse reactions.",
    biasBreakdown: {
      Multicultural: 45,
      "Pro-Government": 30,
      "Pro-Islam": 25,
    },
    sources: [
      { name: "Sin Chew Daily", bias: "Multicultural", slug: "sin-chew-daily" },
      { name: "China Press", bias: "Multicultural", slug: "china-press" },
      { name: "Malay Mail", bias: "Pro-Government", slug: "malay-mail" },
      { name: "HarakahDaily", bias: "Pro-Islam", slug: "harakah-daily" },
    ],
    date: "2024-01-14",
    totalSources: 4,
    coverage: 85,
  },
  {
    id: 3,
    title: "Infrastructure Transparency Demands Gain Momentum",
    summary: "Calls for public disclosure of contractor selection processes intensify across political divide.",
    biasBreakdown: {
      "Secular-Leaning": 50,
      Multicultural: 30,
      "Pro-Government": 20,
    },
    sources: [
      { name: "The Sun", bias: "Secular-Leaning", slug: "the-sun" },
      { name: "China Press", bias: "Multicultural", slug: "china-press" },
      { name: "Malay Mail", bias: "Pro-Government", slug: "malay-mail" },
    ],
    date: "2024-01-14",
    totalSources: 3,
    coverage: 70,
  },
  {
    id: 4,
    title: "Islamic Banking Sector Shows Resilience Amid Global Uncertainty",
    summary:
      "Shariah-compliant financial institutions report strong growth, with analysis varying across different media perspectives.",
    biasBreakdown: {
      "Pro-Islam": 45,
      "Pro-Government": 30,
      "Secular-Leaning": 25,
    },
    sources: [
      { name: "HarakahDaily", bias: "Pro-Islam", slug: "harakah-daily" },
      { name: "Utusan Malaysia", bias: "Pro-Malay/Bumiputera", slug: "utusan-malaysia" },
      { name: "Malay Mail", bias: "Pro-Government", slug: "malay-mail" },
      { name: "The Sun", bias: "Secular-Leaning", slug: "the-sun" },
    ],
    date: "2024-01-13",
    totalSources: 4,
    coverage: 90,
  },
  {
    id: 5,
    title: "Vernacular Schools Funding Debate Intensifies",
    summary: "Education allocation discussions reveal complex perspectives across Malaysia's diverse media landscape.",
    biasBreakdown: {
      Multicultural: 50,
      "Pro-Malay/Bumiputera": 35,
      "Pro-Government": 15,
    },
    sources: [
      { name: "Sin Chew Daily", bias: "Multicultural", slug: "sin-chew-daily" },
      { name: "China Press", bias: "Multicultural", slug: "china-press" },
      { name: "Utusan Malaysia", bias: "Pro-Malay/Bumiputera", slug: "utusan-malaysia" },
      { name: "Malay Mail", bias: "Pro-Government", slug: "malay-mail" },
    ],
    date: "2024-01-13",
    totalSources: 4,
    coverage: 65,
  },
]

// Update blindspot articles
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

// Replace the BiasBadges component with:
const BiasBadges = ({
  breakdown,
  size = "default",
}: { breakdown: Record<string, number>; size?: "default" | "small" }) => (
  <div className={`flex flex-wrap ${size === "small" ? "gap-1" : "gap-2"}`}>
    {Object.entries(breakdown)
      .filter(([_, percentage]) => percentage > 0)
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
                    : "Multi"}{" "}
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
  sources: any[]
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
            {articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 cursor-pointer">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{article.totalSources} sources</span>
                    <span>{article.date}</span>
                  </div>
                  <SourcesList sources={article.sources} size="small" linkable={false} />
                  <div className="mt-2">
                    <BiasBadges breakdown={article.biasBreakdown} size="small" />
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{article.coverage}% coverage</div>
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
                {articles.slice(0, 3).map((article) => (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <div className="border-b border-gray-200 pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded -m-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 cursor-pointer">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{article.totalSources} sources</span>
                        <span>{article.date}</span>
                      </div>
                      <SourcesList sources={article.sources} size="small" linkable={false} />
                      <div className="mt-2">
                        <BiasBadges breakdown={article.biasBreakdown} size="small" />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">{article.coverage}% coverage</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Featured Article - More Compact */}
            <Link href={`/article/${featuredArticle.id}`}>
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="md:flex">
                  <div className="md:w-2/5">
                    <img
                      src={featuredArticle.image || "/placeholder.svg"}
                      alt="Featured article"
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-3/5 p-5">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <span className="font-medium">{featuredArticle.totalSources} sources</span>
                      <span>•</span>
                      <span>{featuredArticle.date}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-blue-600">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">{featuredArticle.summary}</p>

                    {/* Sources List */}
                    <div className="mb-3">
                      <SourcesList sources={featuredArticle.sources} linkable={false} />
                    </div>

                    {/* Bias Analysis */}
                    <div className="mb-3">
                      <BiasBadges breakdown={featuredArticle.biasBreakdown} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

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

            {/* Article Grid - More Compact */}
            <div className="grid md:grid-cols-2 gap-4">
              {articles.slice(1).map((article) => (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="font-medium">{article.totalSources} sources</span>
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 leading-tight text-sm hover:text-blue-600">
                        {article.title}
                      </h3>
                      <p className="text-gray-700 mb-3 text-xs leading-relaxed">{article.summary}</p>

                      {/* Sources */}
                      <div className="mb-2">
                        <SourcesList sources={article.sources} size="small" linkable={false} />
                      </div>

                      {/* Bias Analysis */}
                      <div className="mb-2">
                        <BiasBadges breakdown={article.biasBreakdown} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{article.coverage}% coverage</span>
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
