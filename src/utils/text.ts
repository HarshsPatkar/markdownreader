/**
 * Simple slugify helper to generate clean, URL-safe and element-ID-safe strings from text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except space and hyphen
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with a single hyphen
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens
}

export interface HeadingItem {
  text: string;
  level: number;
  id: string;
}

/**
 * Parses markdown content to extract only genuine headings (# to ######),
 * ignoring normal text, bold, italics, tables, and code blocks.
 */
export function parseMarkdownHeadings(content: string): HeadingItem[] {
  if (!content) return [];
  
  const lines = content.split('\n');
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if entering/exiting code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // Matches lines starting with 1 to 6 hash marks followed by space
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const hashes = match[1];
      const text = match[2].trim();
      
      // Clean up any trailing hashes often used in some markdown styles (e.g. # Header #)
      const cleanText = text.replace(/\s+#+$/, '');
      
      headings.push({
        text: cleanText,
        level: hashes.length,
        id: slugify(cleanText)
      });
    }
  }

  return headings;
}

/**
 * Normalizes markdown content to ensure GitHub Flavored Markdown (GFM) tables
 * render cleanly and reliably across all input formats:
 * 1. Guarantees a blank newline before table rows when preceded by text, list items, or blockquotes
 * 2. Un-indents tables indented by 4+ spaces or tabs (which would otherwise parse as code blocks)
 * 3. Normalizes line breaks (CRLF / CR -> LF)
 * 4. Ensures table delimiters without outer pipes are wrapped cleanly so they do not conflict with list syntax
 */
export function normalizeMarkdownTables(content: string): string {
  if (!content) return '';

  // Convert <kbd>Key</kbd> into styled code badge `Key` so it renders as a styled keycap rather than literal escaped HTML
  const withKbdConverted = content.replace(/<kbd>([^<]+)<\/kbd>/gi, '`$1`');

  // Normalize CRLF and classic Mac CR line breaks to LF
  const lines = withKbdConverted.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code fence boundaries (``` or ~~~)
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Inspect if next line is a table delimiter row (e.g. |---| or :---:| or ---|---)
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
    const isDelimiterRow = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(nextLine);
    const isCurrentRowTable = (trimmed.startsWith('|') || trimmed.includes('|')) && isDelimiterRow;

    // If current line begins a table and preceding line is not blank, add blank line
    if (isCurrentRowTable && result.length > 0) {
      const prev = result[result.length - 1].trim();
      if (prev.length > 0 && !prev.startsWith('|') && !prev.endsWith('|')) {
        result.push('');
      }
    }

    let processedLine = line;

    // Check if table line is indented with 2+ spaces or tabs outside of code blocks
    if (/^(\s{2,}|\t+)\|.*\|/.test(line) || /^(\s{2,}|\t+)((:?-+:?\s*\|)+)/.test(line)) {
      processedLine = line.trimStart();
    }

    // Fix delimiter row without outer pipes (e.g. " - | - ") so CommonMark doesn't treat it as a bullet list
    const isDelimiterItself = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(trimmed);
    if (isDelimiterItself && (!trimmed.startsWith('|') || !trimmed.endsWith('|'))) {
      processedLine = '|' + (trimmed.startsWith('|') ? '' : ' ') + trimmed + (trimmed.endsWith('|') ? '' : ' ') + '|';
    }

    result.push(processedLine);
  }

  return result.join('\n');
}

