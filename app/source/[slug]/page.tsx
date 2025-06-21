"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { use } from "react"

// Source data with detailed information
const sourceData = {
  "malay-mail": {
    name: "Malay Mail",
    language: "English",
    bias: "Pro-Government",
    founded: "1896 (Digital since 2019)",
    owner: "Malay Mail Sdn Bhd (Redberry Media consortium)",
    description:
      "Malay Mail is an English-language online news outlet in Malaysia, known for its centrist to mildly pro-establishment stance. Once a historic tabloid founded in 1896, it is now fully digital and owned by Malay Mail Sdn Bhd, under a consortium linked to Redberry Media and business figure Dato' Siew Ka Wei. Formerly owned by Media Prima and affiliated with NSTP, its transition reflects broader shifts in Malaysian media ownership. Malay Mail covers politics, current affairs, and social issues with moderate language and generally factual reporting. While it avoids overt partisanship, its bias often leans subtly conservative, especially in political framing. It is considered credible, but its neutrality is best understood by reading it alongside more progressive or opposition-aligned sources for a balanced perspective.",
    characteristics: [
      "Centrist to mildly pro-establishment",
      "Moderate language and factual reporting",
      "Subtly conservative political framing",
      "Digital-first approach",
      "Urban English-speaking readership",
    ],
    credibility: "High",
    readership: "Urban English speakers",
  },
  "the-sun": {
    name: "The Sun",
    language: "English",
    bias: "Secular-Leaning",
    founded: "1993",
    owner: "Berjaya Media Berhad (Vincent Tan)",
    description:
      "The Sun is a free, English-language daily newspaper in Malaysia, known for its urban readership, straightforward reporting style, and relatively neutral editorial tone. Owned by Berjaya Media Berhad, a subsidiary of the Berjaya Group founded by tycoon Vincent Tan, the paper reflects a pragmatic, business-friendly outlook with occasional leanings toward centrist or mildly pro-establishment views. Unlike more traditional or partisan outlets, The Sun often focuses on concise news summaries, lifestyle content, and business reporting. Its editorial stance is cautious, avoiding strong ideological positions, though its ownership ties may subtly influence coverage priorities. The Sun is generally considered reliable and fact-based, though its limited depth in political critique makes it best read alongside more investigative or independent outlets for a fuller view of national issues.",
    characteristics: [
      "Business-friendly outlook",
      "Straightforward reporting style",
      "Cautious editorial stance",
      "Focus on lifestyle and business",
      "Free distribution model",
    ],
    credibility: "High",
    readership: "Urban professionals and business community",
  },
  "sin-chew-daily": {
    name: "Sin Chew Daily",
    language: "Chinese",
    bias: "Multicultural",
    founded: "1929",
    owner: "Media Chinese International Limited (Tiong Hiew King)",
    description:
      "Sin Chew Daily (星洲日报) is a leading Chinese-language newspaper in Malaysia, known for its pro-Chinese community stance and cautious pro-establishment tone. Owned by Media Chinese International Limited (MCIL)—a Hong Kong and Malaysia dual-listed media group founded by tycoon Tiong Hiew King—it shares ownership with China Press, Nanyang Siang Pau, and Ming Pao. Sin Chew strongly supports Chinese education and culture, while maintaining a mild pro-Beijing approach in international news. Its bias is subtle, often seen in what it chooses not to cover or criticize, making it reliable but best read alongside other sources for a balanced view.",
    characteristics: [
      "Pro-Chinese community stance",
      "Supports Chinese education and culture",
      "Cautious pro-establishment tone",
      "Mild pro-Beijing international coverage",
      "Subtle editorial bias",
    ],
    credibility: "High",
    readership: "Chinese-speaking community",
  },
  "china-press": {
    name: "China Press",
    language: "Chinese",
    bias: "Multicultural",
    founded: "1946",
    owner: "Media Chinese International Limited (Tiong Hiew King)",
    description:
      "China Press (中国报) is a long-established Chinese-language newspaper in Malaysia, recognized for its bold headlines, grassroots reporting, and populist tone. It is owned by Media Chinese International Limited (MCIL)—a Hong Kong and Malaysia dual-listed media group founded by tycoon Tiong Hiew King—which also owns Sin Chew, Nanyang Siang Pau, and Ming Pao. China Press appeals strongly to urban and working-class Chinese readers, often covering sensational crime, entertainment, and public interest stories. While it supports Chinese cultural and educational causes, its political stance is less restrained, sometimes publishing critical views based on public sentiment. Its China-related coverage tends to be neutral to mildly positive, and its bias is more stylistic and tonal, making it engaging but best read with critical awareness.",
    characteristics: [
      "Bold headlines and populist tone",
      "Grassroots reporting approach",
      "Appeals to working-class readers",
      "Less restrained political stance",
      "Sensational crime and entertainment coverage",
    ],
    credibility: "Medium-High",
    readership: "Urban and working-class Chinese community",
  },
  "utusan-malaysia": {
    name: "Utusan Malaysia",
    language: "Malay",
    bias: "Pro-Malay/Bumiputera",
    founded: "1939 (Relaunched 2020)",
    owner: "Media Mulia Sdn Bhd (Syed Mokhtar Al-Bukhary)",
    description:
      "Utusan Malaysia is a long-standing Malay-language newspaper, historically known for its strong pro-Malay, pro-UMNO (United Malays National Organisation) stance. Founded in 1939 and relaunched in 2020 under Media Mulia Sdn Bhd—a company linked to Aurora Mulia, associated with tycoon Syed Mokhtar Al-Bukhary—Utusan has served as a key voice for Malay nationalism and conservative Islamic values. For decades, it operated as a mouthpiece for UMNO, especially during the Barisan Nasional era, and its content often reflects pro-government narratives, ethnocentric framing, and critiques of opposition parties. While its tone has become slightly more moderated post-relaunch, Utusan remains ideologically driven, with clear editorial preferences. Its reliability depends on topic, and it is best read critically—alongside more neutral or alternative sources—for a well-rounded perspective.",
    characteristics: [
      "Strong pro-Malay stance",
      "Conservative Islamic values",
      "Historically pro-UMNO",
      "Malay nationalism focus",
      "Ideologically driven content",
    ],
    credibility: "Medium",
    readership: "Malay-speaking community, UMNO supporters",
  },
  "harakah-daily": {
    name: "HarakahDaily",
    language: "Malay/English",
    bias: "Pro-Islam",
    founded: "2010s (Digital extension of Harakah)",
    owner: "Parti Islam Se-Malaysia (PAS)",
    description:
      "HarakahDaily is the official online news portal of Parti Islam Se-Malaysia (PAS), known for its strong Islamist perspective and consistent support for PAS's political ideology. Launched as the digital extension of the Harakah newspaper, it serves as a platform for promoting Islamic values, conservative social views, and political messaging aligned with PAS's goals. HarakahDaily frequently critiques secularism, liberal ideologies, and opposition groups not aligned with its religious vision. Its content blends religious discourse with political commentary, often featuring speeches, statements, and interpretations from PAS leaders. While it offers insight into the Islamic political narrative in Malaysia, its coverage is highly partisan and best read as a reflection of PAS's worldview rather than an independent journalistic source. For balanced understanding, it should be read alongside more neutral or pluralistic media.",
    characteristics: [
      "Strong Islamist perspective",
      "Official PAS party portal",
      "Conservative social views",
      "Critiques secular ideologies",
      "Highly partisan coverage",
    ],
    credibility: "Low-Medium",
    readership: "PAS supporters, Islamic conservatives",
  },
}

export default function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const source = sourceData[slug as keyof typeof sourceData]

  if (!source) {
    return <div>Source not found</div>
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "Pro-Government":
        return "bg-red-50 text-red-700 border border-red-100"
      case "Pro-Opposition":
        return "bg-blue-50 text-blue-700 border border-blue-100"
      case "Pro-Malay/Bumiputera":
        return "bg-amber-50 text-amber-700 border border-amber-100"
      case "Pro-Islam":
        return "bg-green-50 text-green-700 border border-green-100"
      case "Secular-Leaning":
        return "bg-yellow-50 text-yellow-700 border border-yellow-100"
      case "Multicultural":
        return "bg-orange-50 text-orange-700 border border-orange-100"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-100"
    }
  }

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium-High":
        return "bg-lime-100 text-lime-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low-Medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

      {/* Source Profile */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{source.name}</h1>
            <Badge className={`${getBiasColor(source.bias)} font-medium`}>{source.bias}</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Facts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{source.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{source.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium text-right max-w-xs">{source.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credibility:</span>
                    <Badge className={`${getCredibilityColor(source.credibility)} text-xs`}>{source.credibility}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Key Characteristics</h3>
                <div className="space-y-1">
                  {source.characteristics.map((char, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{char}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About {source.name}</h2>
            <p className="text-gray-700 leading-relaxed">{source.description}</p>
          </CardContent>
        </Card>

        {/* Readership */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Target Readership</h2>
            <p className="text-gray-700">{source.readership}</p>
          </CardContent>
        </Card>
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
