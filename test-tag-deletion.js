/**
 * Test script to verify that deleting a tag also removes it from all articles
 */

const BASE_URL = 'http://localhost:7001/api';

async function testTagDeletion() {
  console.log('🧪 Testing tag deletion with article cleanup...\n');

  try {
    // Step 1: Get all articles before deletion
    console.log('1️⃣ Fetching all articles...');
    const articlesResponse = await fetch(`${BASE_URL}/articles`);
    const articlesData = await articlesResponse.json();
    const articles = articlesData.data || articlesData.articles || [];
    console.log(`   Found ${articles.length} articles\n`);

    // Step 2: Get all tags
    console.log('2️⃣ Fetching all tags...');
    const tagsResponse = await fetch(`${BASE_URL}/tags`);
    const tagsData = await tagsResponse.json();
    const tags = tagsData.data || [];
    console.log(`   Found ${tags.length} tags\n`);

    if (tags.length === 0) {
      console.log('❌ No tags found to test deletion');
      return;
    }

    // Step 3: Find a tag that's used by at least one article
    console.log('3️⃣ Finding a tag used by articles...');
    let tagToDelete = null;
    let articlesWithTag = [];

    for (const tag of tags) {
      const articlesWithThisTag = articles.filter(article => 
        article.tags && Array.isArray(article.tags) && article.tags.includes(tag.id)
      );
      
      if (articlesWithThisTag.length > 0) {
        tagToDelete = tag;
        articlesWithTag = articlesWithThisTag;
        break;
      }
    }

    if (!tagToDelete) {
      console.log('⚠️  No tags found that are used by articles. Creating a test scenario...');
      
      // Create a new tag
      const createTagResponse = await fetch(`${BASE_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test-tag-deletion-' + Date.now() })
      });
      const createTagData = await createTagResponse.json();
      tagToDelete = createTagData.data;
      
      // Add the tag to an article
      if (articles.length > 0) {
        const testArticle = articles[0];
        await fetch(`${BASE_URL}/articles/${testArticle.id}/tags/${tagToDelete.id}`, {
          method: 'POST'
        });
        articlesWithTag = [testArticle];
      }
    }

    console.log(`   Selected tag: "${tagToDelete.name}" (ID: ${tagToDelete.id})`);
    console.log(`   This tag is used by ${articlesWithTag.length} article(s):`);
    articlesWithTag.forEach(article => {
      console.log(`     - ${article.title} (ID: ${article.id})`);
    });
    console.log();

    // Step 4: Delete the tag
    console.log('4️⃣ Deleting the tag...');
    const deleteResponse = await fetch(`${BASE_URL}/tags/${tagToDelete.id}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteResponse.json();
    
    if (!deleteData.success) {
      console.log(`❌ Failed to delete tag: ${deleteData.error}`);
      return;
    }
    console.log('   ✅ Tag deleted successfully\n');

    // Step 5: Verify the tag was removed from articles
    console.log('5️⃣ Verifying tag was removed from articles...');
    
    for (const article of articlesWithTag) {
      const articleResponse = await fetch(`${BASE_URL}/articles/${article.id}`);
      const articleData = await articleResponse.json();
      const updatedArticle = articleData.data || articleData;
      
      const stillHasTag = updatedArticle.tags && updatedArticle.tags.includes(tagToDelete.id);
      
      if (stillHasTag) {
        console.log(`   ❌ FAILED: Article "${article.title}" still has the deleted tag!`);
        console.log(`      Article tags: ${JSON.stringify(updatedArticle.tags)}`);
        return;
      } else {
        console.log(`   ✅ Article "${article.title}" no longer has the deleted tag`);
      }
    }

    console.log('\n🎉 SUCCESS! All articles were cleaned up when the tag was deleted.\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testTagDeletion();
