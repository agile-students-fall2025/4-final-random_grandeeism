import React from 'react';

const ArticleList = ({ articles }) => {
    return (
        <div>
            {articles.map((article) => (
                <div key={article.id} className="article-card">
                    <h3>{article.title}</h3>
                    <p>{article.author}</p>
                    {/* ...existing code... */}
                </div>
            ))}
        </div>
    );
};

export default ArticleList;
