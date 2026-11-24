import { Chapter } from './types';

export interface SearchMatch {
  chapterId: string;
  chapterName: string;
  snippet: string;
  position: number;
}

export function searchChapters(chapters: Chapter[], query: string): SearchMatch[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const lowercaseQuery = trimmed.toLowerCase();
  const results: SearchMatch[] = [];

  // Limit to prevent search flooding
  let totalMatches = 0;
  const maxMatches = 50;

  for (const chapter of chapters) {
    if (totalMatches >= maxMatches) break;

    const nameMatch = chapter.name.toLowerCase().includes(lowercaseQuery);
    const content = chapter.content;
    const lowercaseContent = content.toLowerCase();

    let idx = lowercaseContent.indexOf(lowercaseQuery);

    if (idx !== -1) {
      while (idx !== -1 && totalMatches < maxMatches) {
        // Extract surrounding snippet
        const start = Math.max(0, idx - 30);
        const end = Math.min(content.length, idx + lowercaseQuery.length + 30);
        let snippet = content.substring(start, end);

        // Add ellipses if truncated
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';

        results.push({
          chapterId: chapter.id,
          chapterName: chapter.name,
          snippet,
          position: idx,
        });

        totalMatches++;
        idx = lowercaseContent.indexOf(lowercaseQuery, idx + 1);
      }
    } else if (nameMatch) {
      results.push({
        chapterId: chapter.id,
        chapterName: chapter.name,
        snippet: 'Matches chapter title',
        position: -1,
      });
      totalMatches++;
    }
  }

  return results;
}
