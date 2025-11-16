/**
 * Export utilities for generating and downloading files
 */

import jsPDF from 'jspdf';
import { highlightsAPI } from '../services/api.js';

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

// HTML generation function removed - now using direct PDF generation with jsPDF

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