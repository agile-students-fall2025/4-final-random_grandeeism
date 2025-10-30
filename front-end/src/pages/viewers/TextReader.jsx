import React, { useEffect, useState, useCallback } from 'react';
import { mockArticles } from '../../data/mockArticles';

/**
 * TextReader
 * Props:
 *  - onNavigate(page, view) : function to navigate back to pages
 *  - article: optional article object passed from parent navigation
 *  - articleId: optional id string to look up article from mockArticles
 */
const TextReader = ({ onNavigate, article, articleId }) => {
  const [current, setCurrent] = useState(article || null);

  // If parent provided only an id, try to find the article locally
  useEffect(() => {
    if (article) {
      setCurrent(article);
      return;
    }
    if (articleId) {
      const found = mockArticles.find(a => String(a.id) === String(articleId));
      setCurrent(found || null);
      return;
    }
    // no article provided
    setCurrent(null);
  }, [article, articleId]);

  // split content into paragraphs
  const paragraphs = (current && current.content)
    ? String(current.content).split(/\n+/).map(p => p.trim()).filter(Boolean)
    : [];

  const goBack = useCallback(() => {
    if (onNavigate) onNavigate('home');
  }, [onNavigate]);

  // allow Esc to go back
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') goBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={goBack}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back
          </button>

          {current ? (
            <div>
              <h1 className="text-3xl font-bold mb-2">{current.title}</h1>
              <p className="text-muted-foreground mb-4">
                {current.author && <span className="mr-2">{current.author}</span>}
                {current.readingTime && <span className="mr-2">• {current.readingTime}</span>}
                {current.dateAdded && (
                  <span className="mr-2">• {new Date(current.dateAdded).toLocaleDateString()}</span>
                )}
                {current.url && (
                  <a href={current.url} target="_blank" rel="noreferrer" className="underline">
                    Source
                  </a>
                )}
              </p>

              {current.tags && current.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {current.tags.map(t => (
                    <span key={t} className="text-[12px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2">No article selected</h1>
              <p className="text-muted-foreground mb-4">Open an article card to view it here.</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          {current ? (
            <article className="prose prose-invert max-w-none">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p className="text-muted-foreground">No readable content available for this article.</p>
              )}
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No article data. Select an article from a list to read it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextReader;

