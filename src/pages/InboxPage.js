// ...existing code...
async function handleAddArticle(newArticle) {
    try {
        const response = await api.createArticle(newArticle); // API call to create the article
        if (response.message === "Article created successfully") {
            setArticles((prevArticles) => [...prevArticles, response.data]); // Update the state with the new article
        }
    } catch (error) {
        console.error("Failed to add article:", error);
    }
}
// ...existing code...
