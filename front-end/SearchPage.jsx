import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchPage = () => {
    const [tags, setTags] = useState([]);
    const [randomTags, setRandomTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [inputTag, setInputTag] = useState('');
    const [articles, setArticles] = useState([]);
    const [sortOption, setSortOption] = useState('Date Added (Newest)'); // Default sort option

    useEffect(() => {
        // Fetch available tags from the server
        axios.get('/api/tags').then(response => {
            setTags(response.data);
            setRandomTags(response.data.sort(() => 0.5 - Math.random()).slice(0, 5)); // Select 5 random tags
        });
    }, []);

    const handleTagSelection = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleInputTag = () => {
        if (inputTag && !selectedTags.includes(inputTag)) {
            setSelectedTags([...selectedTags, inputTag]);
            setInputTag('');
        }
    };

    useEffect(() => {
        // Fetch articles based on selected tags and sort option
        axios.get('/api/articles', { params: { tags: selectedTags, sort: sortOption } })
            .then(response => setArticles(response.data));
    }, [selectedTags, sortOption]);

    return (
        <div>
            <div className="filter-tags">
                <input 
                    type="text" 
                    value={inputTag} 
                    onChange={(e) => setInputTag(e.target.value)} 
                    placeholder="Enter a tag..."
                />
                <button onClick={handleInputTag}>Add Tag</button>
                <div>
                    {randomTags.map(tag => (
                        <button 
                            key={tag} 
                            className={selectedTags.includes(tag) ? 'selected' : ''}
                            onClick={() => handleTagSelection(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
            <div className="sort-options">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option>Date Added (Newest)</option>
                    <option>Date Added (Oldest)</option>
                </select>
            </div>
            <div className="articles">
                {articles.map(article => (
                    <div key={article.id} className="article-card">
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;