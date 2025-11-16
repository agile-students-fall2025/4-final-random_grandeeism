import axios from 'axios';

export const createArticle = async (articleData) => {
    // Save the new article to the mock database
    return await axios.post('/api/articles', articleData); // Adjust endpoint as needed
};

export const fetchArticles = async () => {
    // Fetch all articles from the mock database
    return await axios.get('/api/articles'); // Adjust endpoint as needed
};
