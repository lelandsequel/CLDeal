/**
 * Format converter for acquisition reports
 * Converts HTML reports to PDF, Markdown, and plain text formats
 */

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(html: string): string {
  // Remove HTML tags and convert to markdown-style formatting
  let markdown = html;
  
  // Remove style tags and their content
  markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove script tags
  markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  
  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Convert divs to line breaks
  markdown = markdown.replace(/<div[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/div>/gi, '\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");
  
  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

/**
 * Convert HTML to plain text
 */
export function htmlToText(html: string): string {
  let text = html;
  
  // Remove style and script tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Add line breaks for block elements
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.trim();
  
  return text;
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: 'html' | 'pdf' | 'md' | 'txt'): string {
  const extensions = {
    html: '.html',
    pdf: '.pdf',
    md: '.md',
    txt: '.txt'
  };
  return extensions[format];
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: 'html' | 'pdf' | 'md' | 'txt'): string {
  const mimeTypes = {
    html: 'text/html',
    pdf: 'application/pdf',
    md: 'text/markdown',
    txt: 'text/plain'
  };
  return mimeTypes[format];
}

/**
 * Convert report to specified format
 */
export function convertReport(html: string, format: 'html' | 'pdf' | 'md' | 'txt'): string {
  switch (format) {
    case 'html':
      return html;
    case 'md':
      return htmlToMarkdown(html);
    case 'txt':
      return htmlToText(html);
    case 'pdf':
      // For PDF, we return HTML and let the client handle conversion
      // (browser print to PDF or server-side PDF generation)
      return html;
    default:
      return html;
  }
}

