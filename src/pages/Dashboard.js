import React, { useState, useEffect } from 'react';
import ArticleList from '../components/ArticleList';
import { createArticle, fetchArticles } from '../api/articles';

const Dashboard = () => {
    const [articles, setArticles] = useState([]); // Initial articles
    const [formData, setFormData] = useState({ title: '', author: '' }); // Form state
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

    useEffect(() => {
        const loadArticles = async () => {
            try {
                const response = await fetchArticles();
                setArticles(response.data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };
        loadArticles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleAddArticle = async (e) => {
        e.preventDefault(); // Prevent form submission from reloading the page
        try {
            const response = await createArticle(formData); // API call
            setArticles((prevArticles) => [...prevArticles, response.data]); // Update articles state
            setFormData({ title: '', author: '' }); // Reset form
            setIsModalOpen(false); // Close modal
        } catch (error) {
            console.error('Error adding article:', error);
        }
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Add Article</button>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add New Article</h2>
                        <form onSubmit={handleAddArticle}>
                            <label>
                                Title:
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Article Title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Author:
                                <input
                                    type="text"
                                    name="author"
                                    placeholder="Author Name"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <div className="modal-actions">
                                <button type="submit">Save Article</button>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ArticleList articles={articles} /> {/* Pass updated articles directly */}
        </div>
    );
};

export default Dashboard;
