import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chapter, Theme, ReadingMode } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  Clock, 
  FileText 
} from 'lucide-react';
import { slugify, normalizeMarkdownTables } from '../utils/text';

// Helper to extract nested string text from React elements
function getChildrenText(children: any): string {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(getChildrenText).join('');
  }
  if (children.props && children.props.children) {
    return getChildrenText(children.props.children);
  }
  return '';
}

interface ReaderProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  readingMode: ReadingMode;
  theme: Theme;
  onSelectChapter: (id: string) => void;
  searchScrollTrigger?: {
    text: string;
    chapterId: string;
    timestamp: number;
  } | null;
  onActiveHeadingChange?: (id: string | null) => void;
}

export const Reader: React.FC<ReaderProps> = ({
  chapters,
  activeChapterId,
  readingMode,
  theme,
  onSelectChapter,
  searchScrollTrigger,
  onActiveHeadingChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const lastProcessedScrollRef = useRef<number | null>(null);

  // Find active chapter index
  const activeIndex = chapters.findIndex((c) => c.id === activeChapterId);
  const activeChapter = activeIndex !== -1 ? chapters[activeIndex] : null;

  // Handle scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      const indicator = scrollIndicatorRef.current;
      if (!el || !indicator) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      indicator.style.width = `${progress}%`;

      // Track active heading element for outline panel
      if (onActiveHeadingChange) {
        const headingElements = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentHeadingId: string | null = null;
        const containerRect = el.getBoundingClientRect();

        for (const headingEl of Array.from(headingElements)) {
          const rect = headingEl.getBoundingClientRect();
          // If heading is above/near the top of reader view (within 120px)
          if (rect.top - containerRect.top <= 120) {
            currentHeadingId = headingEl.id;
          }
        }
        onActiveHeadingChange(currentHeadingId);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Run once initially to reset
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeChapterId, readingMode, chapters, onActiveHeadingChange]);

  // Handle scrolling to chapter in Continuous Mode
  useEffect(() => {
    if (readingMode === 'continuous' && activeChapterId) {
      const element = document.getElementById(`chapter-section-${activeChapterId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Scroll to top when active chapter changes in Chapter Mode
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [activeChapterId, readingMode]);

  // Handle scrolling to search matching text block
  useEffect(() => {
    if (!searchScrollTrigger) return;
    if (searchScrollTrigger.timestamp === lastProcessedScrollRef.current) return;

    lastProcessedScrollRef.current = searchScrollTrigger.timestamp;

    // Use a short delay to allow ReactMarkdown to finish mounting/rendering the active chapter content
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const targetText = searchScrollTrigger.text.toLowerCase();
      
      // Select all readable elements in the reader
      const elements = container.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, pre');
      
      let matchedElement: HTMLElement | null = null;
      let highestSimilarity = 0;

      for (const el of Array.from(elements) as HTMLElement[]) {
        const textContent = el.textContent?.toLowerCase() || '';
        
        if (textContent.includes(targetText)) {
          matchedElement = el;
          break; // Perfect match found!
        }
        
        // If not a perfect match, check for partial token overlap
        const queryWords = targetText.split(/\s+/).filter(w => w.length > 2);
        if (queryWords.length > 0) {
          const matchCount = queryWords.filter(word => textContent.includes(word)).length;
          const similarity = matchCount / queryWords.length;
          if (similarity > 0.5 && similarity > highestSimilarity) {
            highestSimilarity = similarity;
            matchedElement = el;
          }
        }
      }

      if (matchedElement) {
        // Scroll the matching element to center of screen
        matchedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a premium highlight animation
        matchedElement.style.transition = 'all 0.5s ease';
        
        // Theme specific highlight colors
        const highlightColor = 
          theme === 'charcoal' ? 'rgba(52, 211, 153, 0.25)' : // Emerald
          theme === 'darkblue' ? 'rgba(34, 211, 238, 0.25)' : // Cyan
          theme === 'sepia' ? 'rgba(142, 98, 57, 0.2)' : // Sepia accent
          'rgba(99, 102, 241, 0.15)'; // Indigo
          
        const originalBg = matchedElement.style.backgroundColor || '';
        const originalBorder = matchedElement.style.borderLeft || '';
        const originalPadding = matchedElement.style.paddingLeft || '';
        const originalRadius = matchedElement.style.borderRadius || '';
        
        matchedElement.style.backgroundColor = highlightColor;
        matchedElement.style.borderLeft = theme === 'sepia' ? '4px solid #8e6239' : '4px solid #6366f1';
        matchedElement.style.paddingLeft = '8px';
        matchedElement.style.borderRadius = '4px';

        // Fade out highlight after a few seconds
        setTimeout(() => {
          if (matchedElement) {
            matchedElement.style.backgroundColor = originalBg;
            matchedElement.style.borderLeft = originalBorder;
            matchedElement.style.paddingLeft = originalPadding;
            matchedElement.style.borderRadius = originalRadius;
          }
        }, 3000);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchScrollTrigger, activeChapterId, theme]);

  // Pagination navigation
  const goToPrevious = () => {
    if (activeIndex > 0) {
      onSelectChapter(chapters[activeIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (activeIndex < chapters.length - 1) {
      onSelectChapter(chapters[activeIndex + 1].id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when the user is typing in form inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (readingMode === 'chapter') {
        if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, readingMode, chapters]);

  // Compute Word Count / Read time for entire reader selection
  const getReaderStats = () => {
    if (readingMode === 'chapter') {
      if (!activeChapter) return { words: 0, time: 0 };
      const words = activeChapter.content.trim().split(/\s+/).filter(Boolean).length;
      return { words, time: Math.max(1, Math.ceil(words / 200)) };
    } else {
      const words = chapters.reduce((acc, c) => acc + c.content.trim().split(/\s+/).filter(Boolean).length, 0);
      return { words, time: Math.max(1, Math.ceil(words / 200)) };
    }
  };

  const stats = getReaderStats();

  // Color configurations per theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'charcoal':
        return {
          wrapper: 'bg-[#2b2b2b] text-[#e3e3e3]',
          scrollbar: 'scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent',
          headerBg: 'bg-[#2b2b2b]/95 border-neutral-800',
          progressBar: 'bg-emerald-500',
          md: {
            h1: 'text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b border-neutral-800 pb-2 text-neutral-100',
            h2: 'text-2xl font-bold tracking-tight mt-6 mb-3 text-neutral-200 border-b border-neutral-800 pb-1',
            h3: 'text-xl font-semibold tracking-tight mt-5 mb-2 text-neutral-200',
            p: 'text-[#e3e3e3] leading-relaxed mb-4 text-[16px]',
            ul: 'list-disc pl-6 mb-4 space-y-1 text-[#e3e3e3]',
            ol: 'list-decimal pl-6 mb-4 space-y-1 text-[#e3e3e3]',
            li: 'leading-relaxed',
            blockquote: 'border-l-4 border-emerald-500 bg-neutral-900/50 pl-4 py-2 italic my-4 text-neutral-400 rounded-r-lg',
            codeInline: 'bg-neutral-800 text-emerald-400 font-mono text-sm px-1.5 py-0.5 rounded border border-neutral-700',
            codeBlock: 'bg-[#1a1a1a] text-[#e3e3e3] p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm border border-neutral-800 shadow-inner',
            a: 'text-emerald-400 hover:text-emerald-300 hover:underline transition-colors',
            hr: 'my-8 border-t border-neutral-800',
            tableWrapper: 'border border-neutral-800 bg-[#222222] rounded-xl overflow-hidden shadow-sm',
            table: 'w-full border-collapse text-sm text-[#e3e3e3]',
            thead: 'bg-neutral-900 border-b border-neutral-800 text-neutral-100',
            tbody: 'divide-y divide-neutral-800/80',
            tr: 'transition-colors hover:bg-neutral-800/50 even:bg-neutral-850/40',
            th: 'px-4 py-3 text-left font-semibold border-r border-neutral-800 last:border-r-0 text-neutral-100',
            td: 'px-4 py-3 border-r border-neutral-800 last:border-r-0 text-[#e3e3e3] leading-relaxed',
          },
          navBtn: 'bg-neutral-800 hover:bg-neutral-700 text-[#e3e3e3] border border-neutral-700 disabled:opacity-40',
          indicator: 'bg-neutral-900 border border-neutral-800 text-neutral-400',
        };
      case 'darkblue':
        return {
          wrapper: 'bg-[#0f172a] text-[#e2e8f0]',
          scrollbar: 'scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent',
          headerBg: 'bg-[#0f172a]/90 border-slate-800',
          progressBar: 'bg-cyan-500',
          md: {
            h1: 'text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b border-slate-800 pb-2 text-slate-50',
            h2: 'text-2xl font-bold tracking-tight mt-6 mb-3 text-slate-100 border-b border-slate-900 pb-1',
            h3: 'text-xl font-semibold tracking-tight mt-5 mb-2 text-slate-200',
            p: 'text-[#cbd5e1] leading-relaxed mb-4 text-[16px]',
            ul: 'list-disc pl-6 mb-4 space-y-1 text-[#cbd5e1]',
            ol: 'list-decimal pl-6 mb-4 space-y-1 text-[#cbd5e1]',
            li: 'leading-relaxed',
            blockquote: 'border-l-4 border-cyan-500 bg-[#070b14]/50 pl-4 py-2 italic my-4 text-slate-400 rounded-r-lg',
            codeInline: 'bg-[#1e293b] text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded border border-slate-800',
            codeBlock: 'bg-[#060a13] text-[#f1f5f9] p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm border border-[#1e293b] shadow-inner',
            a: 'text-cyan-400 hover:text-cyan-300 hover:underline transition-colors',
            hr: 'my-8 border-t border-slate-800',
            tableWrapper: 'border border-slate-800 bg-[#091124] rounded-xl overflow-hidden shadow-sm',
            table: 'w-full border-collapse text-sm text-[#cbd5e1]',
            thead: 'bg-[#060a16] border-b border-slate-800 text-slate-100',
            tbody: 'divide-y divide-slate-800/80',
            tr: 'transition-colors hover:bg-slate-800/50 even:bg-slate-900/40',
            th: 'px-4 py-3 text-left font-semibold border-r border-slate-800 last:border-r-0 text-slate-100',
            td: 'px-4 py-3 border-r border-slate-800 last:border-r-0 text-[#cbd5e1] leading-relaxed',
          },
          navBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 disabled:opacity-40',
          indicator: 'bg-[#060a13] border border-slate-800 text-slate-400',
        };
      case 'sepia':
        return {
          wrapper: 'bg-[#f4ede0] text-[#2c1810]',
          scrollbar: 'scrollbar-thin scrollbar-thumb-[#dfcca4] scrollbar-track-transparent',
          headerBg: 'bg-[#f4ede0]/95 border-[#dfcca4]',
          progressBar: 'bg-[#8e6239]',
          md: {
            h1: 'text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b border-[#dfcca4] pb-2 text-[#2c1810]',
            h2: 'text-2xl font-bold tracking-tight mt-6 mb-3 text-[#2c1810] border-b border-[#f4ede0] pb-1',
            h3: 'text-xl font-semibold tracking-tight mt-5 mb-2 text-[#2c1810]',
            p: 'text-[#2c1810] leading-relaxed mb-4 text-[16.5px]',
            ul: 'list-disc pl-6 mb-4 space-y-1 text-[#2c1810]',
            ol: 'list-decimal pl-6 mb-4 space-y-1 text-[#2c1810]',
            li: 'leading-relaxed',
            blockquote: 'border-l-4 border-[#8e6239] bg-[#ebdcb9]/40 pl-4 py-2 italic my-4 text-[#5c3a21] rounded-r-lg',
            codeInline: 'bg-[#ebdcb9]/60 text-[#2c1810] font-mono text-sm px-1.5 py-0.5 rounded border border-[#dfcca4]',
            codeBlock: 'bg-[#2c1810] text-[#f4ede0] p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-inner',
            a: 'text-[#8e6239] hover:text-[#704b28] hover:underline transition-colors font-semibold',
            hr: 'my-8 border-t border-[#dfcca4]',
            tableWrapper: 'border border-[#dfcca4] bg-[#fbf6ec] rounded-xl overflow-hidden shadow-sm',
            table: 'w-full border-collapse text-sm text-[#2c1810]',
            thead: 'bg-[#eadbc8] border-b border-[#dfcca4] text-[#2c1810]',
            tbody: 'divide-y divide-[#dfcca4]/80',
            tr: 'transition-colors hover:bg-[#efe4d6]/60 even:bg-[#f5ebdd]/60',
            th: 'px-4 py-3 text-left font-bold border-r border-[#dfcca4] last:border-r-0 text-[#2c1810]',
            td: 'px-4 py-3 border-r border-[#dfcca4] last:border-r-0 text-[#2c1810] leading-relaxed',
          },
          navBtn: 'bg-[#ebdcb9] hover:bg-[#dfcca4] text-[#2c1810] border border-[#dfcca4] disabled:opacity-40',
          indicator: 'bg-[#ebdcb9] border border-[#dfcca4] text-[#2c1810]',
        };
      case 'light':
      default:
        return {
          wrapper: 'bg-white text-slate-800',
          scrollbar: 'scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent',
          headerBg: 'bg-white/90 border-slate-100',
          progressBar: 'bg-indigo-600',
          md: {
            h1: 'text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b border-slate-150 pb-2 text-slate-900',
            h2: 'text-2xl font-bold tracking-tight mt-6 mb-3 text-slate-800 border-b border-slate-100 pb-1',
            h3: 'text-xl font-semibold tracking-tight mt-5 mb-2 text-slate-800',
            p: 'text-slate-600 leading-relaxed mb-4 text-[16px]',
            ul: 'list-disc pl-6 mb-4 space-y-1 text-slate-600',
            ol: 'list-decimal pl-6 mb-4 space-y-1 text-slate-600',
            li: 'leading-relaxed',
            blockquote: 'border-l-4 border-indigo-500 bg-slate-50 pl-4 py-2 italic my-4 text-slate-500 rounded-r-lg',
            codeInline: 'bg-slate-100 text-indigo-700 font-mono text-sm px-1.5 py-0.5 rounded border border-slate-200',
            codeBlock: 'bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-md',
            a: 'text-indigo-600 hover:text-indigo-700 hover:underline transition-colors',
            hr: 'my-8 border-t border-slate-200',
            tableWrapper: 'border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm',
            table: 'w-full border-collapse text-sm text-slate-700',
            thead: 'bg-slate-50 border-b border-slate-200 text-slate-800',
            tbody: 'divide-y divide-slate-150',
            tr: 'transition-colors hover:bg-slate-50/70 even:bg-slate-50/40',
            th: 'px-4 py-3 text-left font-semibold border-r border-slate-200 last:border-r-0 tracking-tight text-slate-800',
            td: 'px-4 py-3 border-r border-slate-200 last:border-r-0 text-slate-700 leading-relaxed',
          },
          navBtn: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 disabled:opacity-40',
          indicator: 'bg-slate-50 border border-slate-200 text-slate-500',
        };
    }
  };

  const t = getThemeClasses();

  // Override standard components in markdown
  const markdownComponents: Record<string, React.FC<any>> = {
    h1: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h1 id={id} className={t.md.h1}>{children}</h1>;
    },
    h2: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h2 id={id} className={t.md.h2}>{children}</h2>;
    },
    h3: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h3 id={id} className={t.md.h3}>{children}</h3>;
    },
    h4: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h4 id={id} className="text-lg font-semibold tracking-tight mt-4 mb-2">{children}</h4>;
    },
    h5: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h5 id={id} className="text-base font-semibold tracking-tight mt-3 mb-1">{children}</h5>;
    },
    h6: ({ children }) => {
      const text = getChildrenText(children);
      const id = slugify(text);
      return <h6 id={id} className="text-sm font-semibold tracking-tight mt-2 mb-1">{children}</h6>;
    },
    p: ({ children }) => <p className={t.md.p}>{children}</p>,
    ul: ({ children }) => <ul className={t.md.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={t.md.ol}>{children}</ol>,
    li: ({ children }) => <li className={t.md.li}>{children}</li>,
    blockquote: ({ children }) => <blockquote className={t.md.blockquote}>{children}</blockquote>,
    pre: ({ children }) => {
      const clonedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { isBlock: true });
        }
        return child;
      });
      return <pre className={t.md.codeBlock}>{clonedChildren}</pre>;
    },
    code: ({ className, children, isBlock, ...props }: any) => {
      const { node, ...rest } = props;
      return isBlock ? (
        <code className={className} {...rest}>{children}</code>
      ) : (
        <code className={t.md.codeInline} {...rest}>{children}</code>
      );
    },
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className={t.md.a}>{children}</a>,
    hr: () => <hr className={t.md.hr} />,
    table: ({ children, node, ...props }: any) => (
      <div className={`overflow-x-auto my-6 ${t.md.tableWrapper}`}>
        <table className={t.md.table} {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, node, ...props }: any) => <thead className={t.md.thead} {...props}>{children}</thead>,
    tbody: ({ children, node, ...props }: any) => <tbody className={t.md.tbody} {...props}>{children}</tbody>,
    tr: ({ children, node, isHeader, ...props }: any) => <tr className={t.md.tr} {...props}>{children}</tr>,
    th: ({ children, style, node, isHeader, ...props }: any) => (
      <th className={t.md.th} style={style} {...props}>{children}</th>
    ),
    td: ({ children, style, node, isHeader, ...props }: any) => (
      <td className={t.md.td} style={style} {...props}>{children}</td>
    ),
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300 ${t.wrapper}`}>
      
      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-transparent z-40">
        <div 
          ref={scrollIndicatorRef}
          className={`h-full transition-all duration-150 ease-out ${t.progressBar}`}
          style={{ width: '0%' }}
        />
      </div>

      {/* Meta Stats Row (Fixed top bar of content) */}
      <div className={`px-6 py-2.5 border-b flex justify-between items-center text-xs font-medium z-10 flex-shrink-0 ${t.headerBg}`}>
        <div className="flex items-center gap-1.5 opacity-75">
          {readingMode === 'chapter' ? (
            <>
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              <span>Chapter {activeIndex !== -1 ? activeIndex + 1 : 0} of {chapters.length}</span>
            </>
          ) : (
            <>
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Continuous Mode • All Chapters</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 opacity-75">
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>{stats.words.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>~{stats.time} min read</span>
          </div>
        </div>
      </div>

      {/* Main Reading Scroll Container */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-6 py-8 md:py-12 ${t.scrollbar}`}
      >
        <div className="max-w-[900px] mx-auto pb-24">
          {chapters.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto opacity-20 mb-4" />
              <h2 className="text-xl font-bold tracking-tight opacity-75">No Book Loaded</h2>
              <p className="mt-2 text-sm opacity-60">Upload some Markdown files in the sidebar to begin reading!</p>
            </div>
          ) : readingMode === 'chapter' ? (
            /* Single Chapter View */
            activeChapter ? (
              <article className="animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {normalizeMarkdownTables(activeChapter.content)}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm opacity-60">Please select a chapter from the Table of Contents.</p>
              </div>
            )
          ) : (
            /* Continuous View: Concatenated Chapters */
            <div className="space-y-16">
              {chapters.map((chapter, idx) => (
                <section 
                  key={chapter.id} 
                  id={`chapter-section-${chapter.id}`}
                  className="relative group transition-opacity"
                >
                  {idx > 0 && (
                    <div className="flex items-center justify-center gap-4 my-12 opacity-30 select-none">
                      <div className="h-[1px] flex-1 bg-current" />
                      <span className="text-xs font-mono uppercase tracking-widest">End of Chapter {idx}</span>
                      <div className="h-[1px] flex-1 bg-current" />
                    </div>
                  )}
                  <article className="prose-custom">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {normalizeMarkdownTables(chapter.content)}
                    </ReactMarkdown>
                  </article>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chapter Navigation Panel (Chapter Mode Only) */}
      {readingMode === 'chapter' && chapters.length > 0 && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t flex justify-between items-center backdrop-blur bg-opacity-95 z-10 ${t.headerBg}`}>
          <button
            onClick={goToPrevious}
            disabled={activeIndex <= 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${t.navBtn}`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {activeChapter && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.indicator}`}>
              {activeIndex + 1} / {chapters.length} : {activeChapter.name}
            </span>
          )}

          <button
            onClick={goToNext}
            disabled={activeIndex >= chapters.length - 1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${t.navBtn}`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
