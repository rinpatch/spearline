import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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

      {/* About Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img src="/spearline-logo.png" alt="Spearline Logo" className="h-32 w-32 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Spearline</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A digital news transparency platform that cuts through media bias in Malaysia.
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              In a landscape where news can often reflect political, racial, or ideological leanings, Spearline was
              built to bring clarity. We aggregate news from diverse Malaysian sources and use AI to identify and
              classify ideological bias across six key categories:
            </p>

            {/* Bias Categories */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                  Pro-Government
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Pro-Opposition
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  Pro-Malay
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  Multicultural
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                  Secular
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                  Pro-Islam
                </span>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Our system generates concise summaries and reveals the underlying narratives behind each story, helping
              readers see beyond the headlines.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We believe that truth isn't one-sided — it's found in the full spectrum. By surfacing the biases behind
              the news, we aim to empower Malaysians to think critically, stay informed, and demand better.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="text-center bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Piercing Bias. Truth in the Line.</h2>
            <p className="text-gray-300 text-lg">Our commitment to transparency in Malaysian media</p>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Spearline Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aggregate</h3>
                <p className="text-gray-600">
                  We collect news from diverse Malaysian sources across the political and ideological spectrum.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze</h3>
                <p className="text-gray-600">
                  AI analyzes each article to identify bias patterns and generate objective summaries.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Illuminate</h3>
                <p className="text-gray-600">
                  We present the full picture, showing you all perspectives and potential blind spots.
                </p>
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
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
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
