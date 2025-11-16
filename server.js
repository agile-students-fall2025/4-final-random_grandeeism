const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, 'mockDatabase.json');

// Fetch all articles
app.get('/api/articles', (req, res) => {
    const data = fs.readFileSync(dbPath, 'utf-8');
    let articles = JSON.parse(data);

    // Filter out audio and video files
    const excludedExtensions = ['.mp3', '.mp4', '.wav', '.avi', '.mkv'];
    articles = articles.filter(article => {
        const extension = path.extname(article.fileName || '').toLowerCase();
        return !excludedExtensions.includes(extension);
    });

    console.log('Filtered Articles:', articles); // Debugging: Log filtered articles
    res.json(articles);
});

// Add a new article
app.post('/api/articles', (req, res) => {
    const newArticle = req.body;
    const data = fs.readFileSync(dbPath, 'utf-8');
    const articles = JSON.parse(data);

    // Assign a unique ID to the new article
    newArticle.id = articles.length ? articles[articles.length - 1].id + 1 : 1;

    articles.push(newArticle);
    fs.writeFileSync(dbPath, JSON.stringify(articles, null, 2), 'utf-8');
    res.status(201).json(newArticle);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
