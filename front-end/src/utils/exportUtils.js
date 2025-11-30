/**
 * Export utilities for generating and downloading files
 */

import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { highlightsAPI, articlesAPI, tagsAPI, usersAPI } from '../services/api.js';

/**
 * Generate content for exporting notes and highlights
 * @param {Object} article - Article object with notes and highlights
 * @param {string} format - Export format (markdown, pdf, txt)
 * @returns {Promise<string>} - Formatted content
 */
export async function generateExportContent(article, format) {
  const title = article.title || 'Untitled Article';
  const author = article.author || 'Unknown Author';
  const url = article.url || '';
  const dateAdded = article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '';
  const tags = article.tags && article.tags.length > 0 ? article.tags : [];
  
  // Fetch real highlights and notes data from the API
  let highlights = [];
  let notes = [];
  
  try {
    console.log('🔄 Fetching highlights for article:', article.id);
    const response = await highlightsAPI.getByArticle(article.id);
    
    if (response.success && response.data) {
      const highlightData = response.data;
      console.log('✅ Retrieved highlights:', highlightData.length);
      
      // Extract highlights text and notes
      highlights = highlightData.map(h => h.text).filter(text => text);
      notes = highlightData
        .map(h => h.annotations?.note || h.note)
        .filter(note => note && note.trim())
        .map(note => note.trim());
      
      console.log('📝 Processed highlights:', highlights.length, 'notes:', notes.length);
    } else {
      console.log('⚠️ No highlights found for article:', article.id);
    }
  } catch (error) {
    console.error('❌ Failed to fetch highlights:', error);
    // Fallback to empty arrays if API call fails
    highlights = [];
    notes = [];
  }

  switch (format) {
    case 'markdown':
      return generateMarkdownContent(title, author, url, dateAdded, tags, notes, highlights);
    case 'txt':
      return generatePlainTextContent(title, author, url, dateAdded, tags, notes, highlights);
    case 'csv':
      return generateCSVContent(title, author, url, dateAdded, tags, notes, highlights);
    case 'html':
      return generateHTMLContent(title, author, url, dateAdded, tags, notes, highlights);
    case 'pdf':
      // For PDF, we'll generate the PDF directly using jsPDF
      return null; // We don't need content string for PDF, we'll generate it directly
    default:
      return generatePlainTextContent(title, author, url, dateAdded, tags, notes, highlights);
  }
}

/**
 * Generate Markdown formatted content
 */
function generateMarkdownContent(title, author, url, dateAdded, tags, notes, highlights) {
  let content = `# ${title}\n\n`;
  
  if (author) content += `**Author:** ${author}\n\n`;
  if (url) content += `**URL:** ${url}\n\n`;
  if (dateAdded) content += `**Date Added:** ${dateAdded}\n\n`;
  
  if (tags.length > 0) {
    content += `**Tags:** ${tags.map(tag => `#${tag}`).join(' ')}\n\n`;
  }
  
  content += `---\n\n`;
  
  if (highlights.length > 0) {
    content += `## Highlights\n\n`;
    highlights.forEach((highlight, index) => {
      content += `> ${highlight}\n\n`;
    });
  }
  
  if (notes.length > 0) {
    content += `## Notes\n\n`;
    notes.forEach((note, index) => {
      content += `- ${note}\n\n`;
    });
  }
  
  content += `---\n\n`;
  content += `*Exported from Random Grandeeism on ${new Date().toLocaleDateString()}*`;
  
  return content;
}

/**
 * Generate Plain Text content
 */
function generatePlainTextContent(title, author, url, dateAdded, tags, notes, highlights) {
  let content = `${title}\n`;
  content += '='.repeat(title.length) + '\n\n';
  
  if (author) content += `Author: ${author}\n`;
  if (url) content += `URL: ${url}\n`;
  if (dateAdded) content += `Date Added: ${dateAdded}\n`;
  
  if (tags.length > 0) {
    content += `Tags: ${tags.join(', ')}\n`;
  }
  
  content += '\n' + '-'.repeat(50) + '\n\n';
  
  if (highlights.length > 0) {
    content += 'HIGHLIGHTS\n\n';
    highlights.forEach((highlight, index) => {
      content += `${index + 1}. ${highlight}\n\n`;
    });
  }
  
  if (notes.length > 0) {
    content += 'NOTES\n\n';
    notes.forEach((note, index) => {
      content += `• ${note}\n\n`;
    });
  }
  
  content += '-'.repeat(50) + '\n';
  content += `Exported from Random Grandeeism on ${new Date().toLocaleDateString()}`;
  
  return content;
}

/**
 * Generate CSV formatted content
 */
function generateCSVContent(title, author, url, dateAdded, tags, notes, highlights) {
  // CSV Header
  let content = 'Article Metadata\n';
  content += 'Field,Value\n';
  content += `"Title","${escapeCSV(title)}"\n`;
  content += `"Author","${escapeCSV(author)}"\n`;
  content += `"URL","${escapeCSV(url)}"\n`;
  content += `"Date Added","${escapeCSV(dateAdded)}"\n`;
  content += `"Tags","${escapeCSV(tags.join(', '))}"\n`;
  content += '\n';
  
  // Highlights section
  if (highlights.length > 0) {
    content += 'Highlights\n';
    content += 'Number,Text\n';
    highlights.forEach((highlight, index) => {
      content += `"${index + 1}","${escapeCSV(highlight)}"\n`;
    });
    content += '\n';
  }
  
  // Notes section
  if (notes.length > 0) {
    content += 'Notes\n';
    content += 'Number,Text\n';
    notes.forEach((note, index) => {
      content += `"${index + 1}","${escapeCSV(note)}"\n`;
    });
    content += '\n';
  }
  
  content += '\n';
  content += `"Exported from Random Grandeeism on ${new Date().toLocaleDateString()}"\n`;
  
  return content;
}

/**
 * Generate HTML formatted content
 */
function generateHTMLContent(title, author, url, dateAdded, tags, notes, highlights) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)} - Notes</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #4a5568;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .metadata {
      background: #f7fafc;
      padding: 15px;
      border-left: 4px solid #4a5568;
      margin-bottom: 30px;
    }
    .metadata p {
      margin: 5px 0;
      color: #4a5568;
    }
    .metadata strong {
      color: #2d3748;
    }
    .tag {
      display: inline-block;
      background: #edf2f7;
      color: #4a5568;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 5px;
      font-size: 0.875rem;
    }
    h2 {
      color: #2d3748;
      margin-top: 30px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .highlight {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 15px;
      margin: 10px 0;
      font-style: italic;
    }
    .note {
      background: #e0e7ff;
      border-left: 4px solid #6366f1;
      padding: 12px 15px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #718096;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHTML(title)}</h1>
    
    <div class="metadata">
      ${author ? `<p><strong>Author:</strong> ${escapeHTML(author)}</p>` : ''}
      ${url ? `<p><strong>URL:</strong> <a href="${escapeHTML(url)}" target="_blank">${escapeHTML(url)}</a></p>` : ''}
      ${dateAdded ? `<p><strong>Date Added:</strong> ${escapeHTML(dateAdded)}</p>` : ''}
      ${tags.length > 0 ? `<p><strong>Tags:</strong> ${tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</p>` : ''}
    </div>`;
  
  if (highlights.length > 0) {
    html += `
    <h2>Highlights</h2>`;
    highlights.forEach(highlight => {
      html += `
    <div class="highlight">${escapeHTML(highlight)}</div>`;
    });
  }
  
  if (notes.length > 0) {
    html += `
    <h2>Notes</h2>`;
    notes.forEach(note => {
      html += `
    <div class="note">${escapeHTML(note)}</div>`;
    });
  }
  
  html += `
    <div class="footer">
      <p>Exported from Random Grandeeism on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Escape CSV special characters
 */
function escapeCSV(str) {
  if (!str) return '';
  // Escape double quotes by doubling them
  return String(str).replace(/"/g, '""');
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate filename based on article title and format
 * @param {string} title - Article title
 * @param {string} format - File format
 * @returns {string} - Sanitized filename
 */
export function generateFilename(title, format) {
  // Sanitize title for filename
  const sanitizedTitle = title
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
  
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${sanitizedTitle || 'article'}-notes-${timestamp}.${format}`;
}

/**
 * Get MIME type for format
 * @param {string} format - File format
 * @returns {string} - MIME type
 */
export function getMimeType(format) {
  switch (format) {
    case 'markdown':
    case 'md':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'html':
      return 'text/html';
    case 'pdf':
      return 'application/pdf'; // Direct PDF generation
    default:
      return 'text/plain';
  }
}

/**
 * Generate PDF file directly and download it
 * @param {Object} article - Article object with notes and highlights
 * @param {string} filename - Filename for PDF
 */
export async function generatePDFFile(article, filename) {
  // Fetch real highlights and notes data from the API
  let highlights = [];
  let notes = [];
  
  try {
    console.log('🔄 Fetching highlights for PDF export:', article.id);
    const response = await highlightsAPI.getByArticle(article.id);
    
    if (response.success && response.data) {
      const highlightData = response.data;
      console.log('✅ Retrieved highlights for PDF:', highlightData.length);
      
      // Extract highlights text and notes
      highlights = highlightData.map(h => h.text).filter(text => text);
      notes = highlightData
        .map(h => h.annotations?.note || h.note)
        .filter(note => note && note.trim())
        .map(note => note.trim());
      
      console.log('📝 Processed for PDF - highlights:', highlights.length, 'notes:', notes.length);
    } else {
      console.log('⚠️ No highlights found for PDF export:', article.id);
    }
  } catch (error) {
    console.error('❌ Failed to fetch highlights for PDF:', error);
    // Fallback to empty arrays if API call fails
    highlights = [];
    notes = [];
  }
  
  const doc = new jsPDF();
  
  // Set up document styling
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let currentY = margin;
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text, fontSize = 12, isBold = false, isItalic = false) => {
    doc.setFontSize(fontSize);
    
    // Set font style
    if (isBold && isItalic) {
      doc.setFont(undefined, 'bolditalic');
    } else if (isBold) {
      doc.setFont(undefined, 'bold');
    } else if (isItalic) {
      doc.setFont(undefined, 'italic');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    if (currentY + (lines.length * fontSize * 0.6) > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.text(lines, margin, currentY);
    currentY += lines.length * fontSize * 0.6 + 5;
    
    return currentY;
  };
  
  // Add title
  addWrappedText(article.title || 'Untitled Article', 18, true);
  currentY += 5;
  
  // Add metadata
  if (article.author) {
    addWrappedText(`Author: ${article.author}`, 11, false, true);
  }
  if (article.url) {
    addWrappedText(`URL: ${article.url}`, 10, false, true);
  }
  if (article.createdAt) {
    const dateAdded = new Date(article.createdAt).toLocaleDateString();
    addWrappedText(`Date Added: ${dateAdded}`, 10, false, true);
  }
  if (article.tags && article.tags.length > 0) {
    addWrappedText(`Tags: ${article.tags.join(', ')}`, 10, false, true);
  }
  
  currentY += 10;
  
  // Add separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 15;
  
  // Add highlights section (using fetched data)
  if (highlights.length > 0) {
    addWrappedText('Highlights', 14, true);
    currentY += 5;
    
    highlights.forEach((highlight, index) => {
      // Add highlight with quotation styling
      addWrappedText(`"${highlight}"`, 11, false, true);
      currentY += 3;
    });
    
    currentY += 10;
  }
  
  // Add notes section (using fetched data)
  if (notes.length > 0) {
    addWrappedText('Notes', 14, true);
    currentY += 5;
    
    notes.forEach((note, index) => {
      addWrappedText(`• ${note}`, 11);
      currentY += 3;
    });
  }
  
  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const footerText = `Exported from Random Grandeeism on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
  }
  
  // Download the PDF
  doc.save(filename);
}

/**
 * Export all notes and highlights from all articles as a ZIP file
 * @param {string} format - Export format (markdown, html, csv)
 * @returns {Promise<void>}
 */
export async function exportAllNotesAsZip(format) {
  try {
    console.log('🔄 Starting bulk export in', format, 'format');
    
    // Fetch all articles
    const articlesResponse = await articlesAPI.getAll();
    if (!articlesResponse.success || !articlesResponse.data) {
      throw new Error('Failed to fetch articles');
    }
    
    const articles = articlesResponse.data;
    console.log(`📚 Found ${articles.length} articles`);
    
    if (articles.length === 0) {
      throw new Error('No articles found to export');
    }
    
    // Create a new ZIP file
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let exportedCount = 0;
    
    // Process each article
    for (const article of articles) {
      try {
        // Fetch highlights for this article
        const highlightsResponse = await highlightsAPI.getByArticle(article.id);
        
        // Skip articles without highlights
        if (!highlightsResponse.success || !highlightsResponse.data || highlightsResponse.data.length === 0) {
          console.log(`⏭️ Skipping article "${article.title}" - no highlights`);
          continue;
        }
        
        const highlightData = highlightsResponse.data;
        const highlights = highlightData.map(h => h.text).filter(text => text);
        const notes = highlightData
          .map(h => h.annotations?.note || h.note)
          .filter(note => note && note.trim())
          .map(note => note.trim());
        
        // Skip if no content to export
        if (highlights.length === 0 && notes.length === 0) {
          console.log(`⏭️ Skipping article "${article.title}" - no content`);
          continue;
        }
        
        // Generate content based on format
        const content = await generateExportContent(article, format);
        
        if (content) {
          // Sanitize filename
          const sanitizedTitle = (article.title || 'Untitled')
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
          
          const filename = `${sanitizedTitle}.${format === 'markdown' ? 'md' : format}`;
          
          // Add file to ZIP
          zip.file(filename, content);
          exportedCount++;
          
          console.log(`✅ Added "${article.title}" to ZIP`);
        }
      } catch (error) {
        console.error(`❌ Failed to export article "${article.title}":`, error);
        // Continue with other articles
      }
    }
    
    if (exportedCount === 0) {
      throw new Error('No articles with notes or highlights found to export');
    }
    
    console.log(`📦 Generated ZIP with ${exportedCount} files`);
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP file
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-notes-${timestamp}.zip`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`✅ Successfully exported ${exportedCount} articles as ZIP`);
  } catch (error) {
    console.error('❌ Bulk export failed:', error);
    throw error;
  }
}

/**
 * Export all user data (articles, tags, highlights, reading progress) as JSON
 * @returns {Promise<void>}
 */
export async function exportAllUserData() {
  try {
    console.log('🔄 Starting full user data export');
    
    const userId = 1; // TODO: replace with authenticated user id
    
    // Fetch all data in parallel
    const [articlesResponse, tagsResponse, userResponse] = await Promise.all([
      articlesAPI.getAll(),
      tagsAPI.getAll(),
      usersAPI.getProfile(userId)
    ]);
    
    // Validate responses
    if (!articlesResponse.success || !articlesResponse.data) {
      throw new Error('Failed to fetch articles');
    }
    if (!tagsResponse.success || !tagsResponse.data) {
      throw new Error('Failed to fetch tags');
    }
    
    const articles = articlesResponse.data;
    const tags = tagsResponse.data;
    const userProfile = userResponse?.data || {};
    
    console.log(`📊 Fetched ${articles.length} articles, ${tags.length} tags`);
    
    // Fetch all highlights for all articles
    const highlightsPromises = articles.map(article => 
      highlightsAPI.getByArticle(article.id)
        .then(res => ({
          articleId: article.id,
          highlights: res.success && res.data ? res.data : []
        }))
        .catch(err => {
          console.error(`Failed to fetch highlights for article ${article.id}:`, err);
          return { articleId: article.id, highlights: [] };
        })
    );
    
    const highlightsData = await Promise.all(highlightsPromises);
    
    // Organize highlights by article
    const highlightsByArticle = {};
    highlightsData.forEach(({ articleId, highlights }) => {
      highlightsByArticle[articleId] = highlights;
    });
    
    const totalHighlights = Object.values(highlightsByArticle)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    console.log(`💡 Fetched ${totalHighlights} total highlights`);
    
    // Create export data structure
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        preferences: userProfile.preferences,
        stats: userProfile.stats,
        createdAt: userProfile.createdAt
      },
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        author: article.author,
        source: article.source,
        status: article.status,
        mediaType: article.mediaType,
        content: article.content,
        contentNoImages: article.contentNoImages,
        textContent: article.textContent,
        summary: article.summary,
        imageUrl: article.imageUrl,
        wordCount: article.wordCount,
        readingTime: article.readingTime,
        readingProgress: article.readingProgress,
        publishedDate: article.publishedDate,
        addedDate: article.addedDate,
        tags: article.tags,
        isFavorite: article.isFavorite,
        isHidden: article.isHidden,
        feedId: article.feedId,
        feedName: article.feedName,
        highlights: highlightsByArticle[article.id] || []
      })),
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        articlesCount: tag.articlesCount,
        createdAt: tag.createdAt
      })),
      statistics: {
        totalArticles: articles.length,
        totalTags: tags.length,
        totalHighlights: totalHighlights,
        articlesByStatus: {
          inbox: articles.filter(a => a.status === 'inbox').length,
          continue: articles.filter(a => a.status === 'continue').length,
          daily: articles.filter(a => a.status === 'daily').length,
          rediscovery: articles.filter(a => a.status === 'rediscovery').length,
          archived: articles.filter(a => a.status === 'archived').length
        },
        articlesByMediaType: {
          text: articles.filter(a => a.mediaType === 'text').length,
          video: articles.filter(a => a.mediaType === 'video').length,
          audio: articles.filter(a => a.mediaType === 'audio').length
        },
        favoriteArticles: articles.filter(a => a.isFavorite).length
      }
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `user-data-export-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`✅ Successfully exported all user data as ${filename}`);
    console.log(`📦 Export contains: ${articles.length} articles, ${tags.length} tags, ${totalHighlights} highlights`);
  } catch (error) {
    console.error('❌ User data export failed:', error);
    throw error;
  }
}