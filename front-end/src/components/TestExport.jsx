/**
 * Test Export Functionality
 * This is a temporary test file to verify export functionality works
 */

import React from 'react';
import { 
  generateExportContent, 
  downloadFile, 
  generateFilename, 
  getMimeType,
  convertHTMLToPDF 
} from '../utils/exportUtils.js';

const TestExport = () => {
  const testArticle = {
    id: 'test-1',
    title: 'Test Article for Export',
    author: 'Test Author',
    url: 'https://example.com/test-article',
    createdAt: new Date().toISOString(),
    tags: ['test', 'export', 'functionality'],
    notes: [
      'This is a test note to verify export functionality.',
      'Another note with some important insights.',
      'Final note for testing purposes.'
    ],
    highlights: [
      'This is a highlighted text to test the export feature.',
      'Another important highlight for verification.',
      'Third highlight to ensure everything works correctly.'
    ]
  };

  const testExport = (format) => {
    try {
      console.log(`Testing ${format} export...`);
      
      const content = generateExportContent(testArticle, format);
      const filename = generateFilename(testArticle.title, format);
      const mimeType = getMimeType(format);
      
      if (format === 'pdf') {
        convertHTMLToPDF(content, filename.replace('.pdf', ''));
      } else {
        downloadFile(content, filename, mimeType);
      }
      
      console.log(`✅ ${format} export successful!`);
    } catch (error) {
      console.error(`❌ ${format} export failed:`, error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Export Test Panel</h3>
      <p>Article: {testArticle.title}</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={() => testExport('markdown')}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Markdown Export
        </button>
        <button 
          onClick={() => testExport('txt')}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test TXT Export
        </button>
        <button 
          onClick={() => testExport('pdf')}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test PDF Export
        </button>
      </div>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Check browser console for detailed output and watch for file downloads.
      </p>
    </div>
  );
};

export default TestExport;