// ...existing code...
async function createArticle(articleData) {
    const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
    });
    return await response.json(); // Ensure the response includes the article data
}
// ...existing code...
