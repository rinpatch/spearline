import { supabase } from '@/lib/supabase';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ArticlesPage() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, full_text_content');

  if (error) {
    return <p>Could not fetch articles.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Articles</h1>
      <div className="space-y-4">
        {articles?.map((article) => (
          <div key={article.id} className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            {article.full_text_content && (
              <p className="mt-2 text-gray-700">
                {article.full_text_content.substring(0, 250)}...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 