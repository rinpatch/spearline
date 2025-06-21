import { supabase } from "./supabase-client";

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

interface Article {
  id: number;
  title: string;
  published_at: string;
  bias_analysis: BiasAnalysis | string;
  source: {
    id: number;
    name: string;
    perceived_leaning: string;
  };
}

export interface Story {
  id: number;
  representative_title: string;
  summary: string;
  last_article_added_at: string;
  created_at: string;
  articles: Article[];
}

export interface ProcessedStory {
  id: number;
  title: string;
  summary: string;
  date: string;
  biasBreakdown: Record<string, number>;
  sources: Array<{
    name: string;
    bias: string;
    slug: string;
  }>;
  totalSources: number;
  coverage: number;
}

export interface DetailedStory extends ProcessedStory {
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
  }>;
  confidence: number;
}

/**
 * Fetches stories sorted by last article added, with their articles and sources
 */
export async function getStoriesWithArticles(limit: number = 10): Promise<Story[]> {
  const { data, error } = await supabase
    .from("stories")
    .select(`
      id,
      representative_title,
      summary,
      last_article_added_at,
      created_at,
      articles (
        id,
        title,
        published_at,
        bias_analysis,
        source:sources (
          id,
          name,
          perceived_leaning
        )
      )
    `)
    .not('last_article_added_at', 'is', null)
    .order('last_article_added_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching stories:', error);
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  return ((data || []) as unknown) as Story[];
}

/**
 * Fetches a single story by ID with all its articles and sources
 */
export async function getStoryById(id: number): Promise<Story | null> {
  const { data, error } = await supabase
    .from("stories")
    .select(`
      id,
      representative_title,
      summary,
      last_article_added_at,
      created_at,
      articles (
        id,
        title,
        published_at,
        url,
        bias_analysis,
        source:sources (
          id,
          name,
          perceived_leaning
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Story not found
    }
    console.error('Error fetching story:', error);
    throw new Error(`Failed to fetch story: ${error.message}`);
  }

  return (data as unknown) as Story;
}

/**
 * Processes raw stories into the format expected by the frontend
 */
export function processStoriesForFrontend(stories: Story[]): ProcessedStory[] {
  return stories.map(story => {
    const articles = story.articles || [];
    
    // Calculate bias breakdown from sentiment scores
    const sentimentAggregation = {
      government: 0,
      malay_bumiputera: 0,
      islam: 0,
      multicultural: 0,
      secular: 0
    };

    let validAnalysisCount = 0;

    articles.forEach(article => {
      if (article.bias_analysis) {
        try {
          const analysis = typeof article.bias_analysis === 'string' 
            ? JSON.parse(article.bias_analysis) 
            : article.bias_analysis;
          
          sentimentAggregation.government += analysis.sentiment_towards_government?.score || 0;
          sentimentAggregation.malay_bumiputera += analysis["sentiment_towards_Malay and Bumiputera"]?.score || 0;
          sentimentAggregation.islam += analysis.sentiment_towards_Islam?.score || 0;
          sentimentAggregation.multicultural += analysis.sentiment_towards_Multicultural?.score || 0;
          sentimentAggregation.secular += analysis.sentiment_towards_Secular_learning?.score || 0;
          
          validAnalysisCount++;
        } catch (error) {
          console.warn('Failed to parse bias analysis for article:', article.id, error);
        }
      }
    });

    // Calculate average sentiments and convert to bias breakdown
    const biasBreakdown: Record<string, number> = {};
    
    if (validAnalysisCount > 0) {
      const avgSentiments = {
        government: sentimentAggregation.government / validAnalysisCount,
        malay_bumiputera: sentimentAggregation.malay_bumiputera / validAnalysisCount,
        islam: sentimentAggregation.islam / validAnalysisCount,
        multicultural: sentimentAggregation.multicultural / validAnalysisCount,
        secular: sentimentAggregation.secular / validAnalysisCount
      };

      // Get the top 2 sentiment categories (positive or negative)
      const sortedSentiments = Object.entries(avgSentiments)
        .map(([key, value]) => ({ key, value: Math.abs(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2);

      // Convert to percentage breakdown for top 2 sentiments
      const total = sortedSentiments.reduce((sum, item) => sum + item.value, 0);
      
      if (total > 0) {
        sortedSentiments.forEach(({ key, value }) => {
          const percentage = Math.round((value / total) * 100);
          if (percentage > 0) {
            const label = key === 'government' ? 'Pro-Government' :
              key === 'malay_bumiputera' ? 'Pro-Malay/Bumiputera' :
              key === 'islam' ? 'Pro-Islam' :
              key === 'multicultural' ? 'Multicultural' :
              key === 'secular' ? 'Secular-Leaning' : key;
            biasBreakdown[label] = percentage;
          }
        });
      }
    }

    // If no bias breakdown calculated, use a default
    if (Object.keys(biasBreakdown).length === 0) {
      biasBreakdown["Neutral"] = 100;
    }

    // Get unique sources
    const uniqueSources = Array.from(
      new Map(
        articles
          .filter(article => article.source)
          .map(article => [
            article.source.id,
            {
              name: article.source.name,
              bias: article.source.perceived_leaning || 'Independent',
              slug: article.source.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
          ])
      ).values()
    );

    return {
      id: story.id,
      title: story.representative_title,
      summary: story.summary || `Story about: ${story.representative_title}`,
      date: new Date(story.last_article_added_at || story.created_at).toISOString().split('T')[0],
      biasBreakdown,
      sources: uniqueSources,
      totalSources: uniqueSources.length,
      coverage: Math.min(100, Math.max(50, uniqueSources.length * 25)) // Simple coverage calculation
    };
  });
}

/**
 * Processes a single story for the detail page
 */
export function processStoryForDetail(story: Story): DetailedStory {
  const processed = processStoriesForFrontend([story])[0];
  const articles = story.articles || [];
  
  // Calculate confidence based on number of sources and articles
  const confidence = Math.min(95, Math.max(60, 50 + (articles.length * 5) + (processed.totalSources * 3)));
  
  return {
    ...processed,
    articles: articles.map(article => {
      // Parse bias analysis if it exists
      let biasAnalysis: BiasAnalysis | undefined;
      if (article.bias_analysis) {
        try {
          biasAnalysis = typeof article.bias_analysis === 'string' 
            ? JSON.parse(article.bias_analysis) 
            : article.bias_analysis;
        } catch (error) {
          console.warn('Failed to parse bias analysis for article:', article.id, error);
        }
      }

      return {
        id: article.id,
        title: article.title,
        published_at: article.published_at,
        url: (article as Article & { url?: string }).url,
        bias_analysis: biasAnalysis,
        source: {
          name: article.source.name,
          bias: article.source.perceived_leaning || 'Independent',
          slug: article.source.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }
      };
    }),
    confidence
  };
}

/**
 * Gets processed stories for the homepage
 */
export async function getProcessedStories(limit: number = 10): Promise<ProcessedStory[]> {
  const stories = await getStoriesWithArticles(limit);
  return processStoriesForFrontend(stories);
}

/**
 * Gets a single processed story for the detail page
 */
export async function getProcessedStoryById(id: number): Promise<DetailedStory | null> {
  const story = await getStoryById(id);
  if (!story) return null;
  return processStoryForDetail(story);
} 