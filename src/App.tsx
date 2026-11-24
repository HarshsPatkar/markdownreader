import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Download, 
  RotateCcw, 
  Menu, 
  X, 
  Info,
  Check,
  Book,
  Maximize2,
  Search,
  List,
  HelpCircle
} from 'lucide-react';
import { Chapter, Theme, ReadingMode } from './types';
import { SAMPLE_CHAPTERS } from './sampleData';
import { Sidebar } from './components/Sidebar';
import { Reader } from './components/Reader';
import { OutlinePanel } from './components/OutlinePanel';
import { SeoContent } from './components/SeoContent';
import { searchChapters } from './searchUtils';
import { parseMarkdownHeadings } from './utils/text';

export default function App() {
  // --- Core States ---
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('md-reader-chapters');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved) as Chapter[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const introIdx = parsed.findIndex((c) => c.id === 'intro');
          if (introIdx !== -1 && (parsed[introIdx].content.includes('### Feature & Data Tables') || parsed[introIdx].content.includes('Scenario Simulation')) && SAMPLE_CHAPTERS[0]) {
            parsed[introIdx].content = SAMPLE_CHAPTERS[0].content;
          }
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing cached chapters', e);
      }
    }
    return SAMPLE_CHAPTERS;
  });

  const [activeChapterId, setActiveChapterId] = useState<string | null>(() => {
    const savedActiveId = localStorage.getItem('md-reader-active-id');
    if (savedActiveId) return savedActiveId;
    
    // Fallback to first chapter of loaded list
    const savedChapters = localStorage.getItem('md-reader-chapters');
    if (savedChapters !== null) {
      try {
        const parsed = JSON.parse(savedChapters) as Chapter[];
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return SAMPLE_CHAPTERS[0]?.id || null;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const userSelected = localStorage.getItem('md-reader-theme-selected');
    const saved = localStorage.getItem('md-reader-theme') as Theme;
    if (userSelected && saved) {
      return saved;
    }
    if (saved && (saved === 'charcoal' || saved === 'darkblue')) {
      return saved;
    }
    return 'light';
  });

  const handleThemeChange = (newTheme: Theme) => {
    localStorage.setItem('md-reader-theme-selected', 'true');
    setTheme(newTheme);
  };

  const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
    const saved = localStorage.getItem('md-reader-mode') as ReadingMode;
    return (saved as ReadingMode) || 'chapter';
  });
  
  // --- UI Layout States ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);

  // --- Resizable and Collapsible Sidebar States ---
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('md-reader-sidebar-width');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('md-reader-sidebar-collapsed');
    return saved === 'true';
  });

  // --- Document Outline Panel States ---
  const [outlineOpen, setOutlineOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('md-reader-outline-open');
    return saved !== 'false';
  });

  // --- Notion-style Sidebar Hover Peek State ---
  const [isHoverPeeking, setIsHoverPeeking] = useState<boolean>(false);
  const [isOutlineHovered, setIsOutlineHovered] = useState<boolean>(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // --- Search & Scroll Target States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScrollTrigger, setSearchScrollTrigger] = useState<{
    text: string;
    chapterId: string;
    timestamp: number;
  } | null>(null);

  // --- Custom Confirmation Dialog State ---
  const [confirmAction, setConfirmAction] = useState<{
    type: 'clear' | 'reset';
    title: string;
    message: string;
  } | null>(null);

  // Set the first chapter as active if the active chapter is deleted or is null
  useEffect(() => {
    if (chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    localStorage.setItem('md-reader-chapters', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    if (activeChapterId) {
      localStorage.setItem('md-reader-active-id', activeChapterId);
    } else {
      localStorage.removeItem('md-reader-active-id');
    }
  }, [activeChapterId]);

  useEffect(() => {
    localStorage.setItem('md-reader-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('md-reader-mode', readingMode);
  }, [readingMode]);

  useEffect(() => {
    localStorage.setItem('md-reader-sidebar-width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('md-reader-sidebar-collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('md-reader-outline-open', outlineOpen.toString());
  }, [outlineOpen]);

  // --- Drag-to-Resize Handler ---
  const isResizing = useRef(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 240 && newWidth <= 480) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up resizing on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Global Keyboard Shortcuts (Escape to dismiss search / modals / peeking, / or Cmd+K to focus search)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (confirmAction) {
          setConfirmAction(null);
          return;
        }
        if (isHoverPeeking) {
          setIsHoverPeeking(false);
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          const searchInput = document.getElementById('toolbar-search-input');
          if (searchInput) {
            (searchInput as HTMLInputElement).blur();
          }
          return;
        }
      }

      // Quick search shortcut: press '/' or 'Ctrl+K' / 'Cmd+K' when outside inputs
      if (!isInput) {
        if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
          e.preventDefault();
          const searchInput = document.getElementById('toolbar-search-input');
          if (searchInput) {
            (searchInput as HTMLInputElement).focus();
            (searchInput as HTMLInputElement).select();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [confirmAction, isHoverPeeking, searchQuery]);

  // --- Handlers ---
  const handleSelectChapter = (id: string) => {
    setActiveChapterId(id);
    // Auto-close sidebar on mobile after selecting
    setSidebarOpen(false);
    // Auto-close Notion-style peek on selection
    setIsHoverPeeking(false);
  };

  const handleReorderChapter = (id: string, direction: 'up' | 'down') => {
    const idx = chapters.findIndex((c) => c.id === id);
    if (idx === -1) return;

    const newChapters = [...chapters];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx >= 0 && targetIdx < newChapters.length) {
      // Swap chapters
      const temp = newChapters[idx];
      newChapters[idx] = newChapters[targetIdx];
      newChapters[targetIdx] = temp;

      // Update sequence orders
      const updated = newChapters.map((ch, index) => ({
        ...ch,
        order: index + 1
      }));

      setChapters(updated);
    }
  };

  const handleDeleteChapter = (id: string) => {
    const updated = chapters.filter((c) => c.id !== id);
    setChapters(updated);

    // If active was deleted, choose another one
    if (activeChapterId === id) {
      if (updated.length > 0) {
        setActiveChapterId(updated[0].id);
      } else {
        setActiveChapterId(null);
      }
    }
  };

  const handleRenameChapter = (id: string, newName: string) => {
    const updated = chapters.map((c) => {
      if (c.id === id) {
        return { ...c, name: newName };
      }
      return c;
    });
    setChapters(updated);
  };

  const handleUploadChapters = (newFiles: { name: string; content: string }[]) => {
    const startingOrder = chapters.length + 1;
    const formatted: Chapter[] = newFiles.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      content: file.content,
      order: startingOrder + index
    }));

    const combined = [...chapters, ...formatted];
    setChapters(combined);

    // Automatically activate the uploaded file so the user immediately sees it in the reader
    if (formatted.length > 0) {
      setActiveChapterId(formatted[0].id);
    }
  };

  const handleResetToSample = () => {
    setConfirmAction({
      type: 'reset',
      title: 'Reload Sample Chapters',
      message: 'Are you sure you want to reload the default sample chapters? This will replace all your current custom files in this workspace.'
    });
  };

  const handleClearAll = () => {
    setConfirmAction({
      type: 'clear',
      title: 'Clear Workspace',
      message: 'Are you sure you want to clear all chapters? This will completely remove all files and content from your local workspace.'
    });
  };

  const handleExportBook = () => {
    if (chapters.length === 0) return;

    // Concatenate all files into one structured Markdown string
    const mergedContent = chapters
      .map((ch, idx) => {
        return `<!-- CHAPTER START: ${ch.name} -->\n\n${ch.content}`;
      })
      .join('\n\n---\n\n');

    // Create file blob and trigger click download
    const blob = new Blob([mergedContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'book.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Dynamic Theme Styles for Outer Wrapper ---
  const getAppThemeClasses = () => {
    switch (theme) {
      case 'charcoal':
        return {
          bg: 'bg-[#2b2b2b] text-[#e3e3e3]',
          header: 'bg-[#1f1f1f] border-neutral-800 text-[#e3e3e3]',
          segmentedBg: 'bg-[#1f1f1f] text-neutral-400',
          segmentActive: 'bg-[#333333] text-emerald-400 font-semibold border border-neutral-700/40 rounded-full shadow-sm',
          accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          alertBg: 'bg-[#1f1f1f] border-emerald-500/30 text-neutral-300',
          subtext: 'text-neutral-500',
        };
      case 'darkblue':
        return {
          bg: 'bg-[#0f172a] text-[#cbd5e1]',
          header: 'bg-[#060a16] border-slate-900 text-slate-100',
          segmentedBg: 'bg-[#0f172a] text-slate-400',
          segmentActive: 'bg-[#1e293b] text-cyan-400 font-semibold border border-slate-800/40 rounded-full shadow-sm',
          accentBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
          alertBg: 'bg-[#060a16] border-cyan-500/30 text-slate-300',
          subtext: 'text-slate-500',
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ede0] text-[#2c1810]',
          header: 'bg-[#eadfc8] border-[#dfcca4] text-[#2c1810]',
          segmentedBg: 'bg-[#efe5d5] text-[#8a755d]',
          segmentActive: 'bg-[#f4ede0] text-[#5c3a21] font-semibold border border-[#dfcca4]/35 rounded-full shadow-sm',
          accentBtn: 'bg-[#8e6239] hover:bg-[#7a512c] text-white',
          alertBg: 'bg-[#fcf9f4]/80 border-[#dfcca4] text-[#4d3c2a]',
          subtext: 'text-[#8e6239]',
        };
      case 'light':
      default:
        return {
          bg: 'bg-white text-slate-800',
          header: 'bg-white border-slate-200 text-slate-800',
          segmentedBg: 'bg-slate-100 text-slate-500',
          segmentActive: 'bg-white text-indigo-700 font-semibold border border-slate-200 rounded-full shadow-sm',
          accentBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          alertBg: 'bg-indigo-50/50 border-indigo-150 text-slate-600',
          subtext: 'text-slate-400',
        };
    }
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId);
  const activeContent = readingMode === 'chapter' 
    ? (activeChapter?.content || '') 
    : chapters.map((c) => c.content).join('\n\n');
  
  const headings = parseMarkdownHeadings(activeContent);

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const searchResults = searchChapters(chapters, searchQuery);

  const showPeekingSidebar = sidebarCollapsed && isHoverPeeking;

  const a = getAppThemeClasses();

  return (
    <div id="app-root" className={`min-h-screen w-full flex flex-col font-sans overflow-x-hidden transition-colors duration-300 ${theme} ${a.bg}`}>
      
      {/* 1. Header Toolbar */}
      <header className={`h-16 border-b px-4 md:px-6 flex items-center justify-between z-30 shadow-sm flex-shrink-0 sticky top-0 transition-colors duration-300 ${a.header}`}>
        
        {/* Left: Branding, Sidebar Toggle, & Reading Mode Pill */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hidden md:flex opacity-80 hover:opacity-100 hover:bg-slate-500/10 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg md:hidden opacity-80 hover:opacity-100 hover:bg-slate-500/10 transition-colors"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2 mr-1">
            <div className={`p-1.5 rounded-lg ${theme === 'sepia' ? 'bg-[#ebd6bb]' : 'bg-indigo-500/10'}`}>
              <BookOpen className={`h-4.5 w-4.5 ${theme === 'sepia' ? 'text-[#8e6239]' : 'text-indigo-600'}`} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight block">Markdown Reader</span>
              <span className={`text-[9px] uppercase tracking-wider font-semibold block -mt-0.5 ${a.subtext}`}>
                Offline • Fast • Private
              </span>
            </div>
          </div>

          {/* Reading Mode Pill inside left section to tighten layout */}
          <div className="hidden lg:flex p-0.5 rounded-full text-xs font-medium transition-all" style={{ backgroundColor: theme === 'sepia' ? '#dfcca4' : 'rgba(100,100,120,0.1)' }}>
            <div className={`flex rounded-full p-0.5 ${a.segmentedBg}`}>
              <button
                onClick={() => setReadingMode('chapter')}
                className={`px-3 py-1 rounded-full transition-all duration-200 text-[11px] flex items-center gap-1 ${
                  readingMode === 'chapter' ? a.segmentActive : 'hover:opacity-80'
                }`}
              >
                <Book className="h-3 w-3" />
                Chapter
              </button>
              <button
                onClick={() => setReadingMode('continuous')}
                className={`px-3 py-1 rounded-full transition-all duration-200 text-[11px] flex items-center gap-1 ${
                  readingMode === 'continuous' ? a.segmentActive : 'hover:opacity-80'
                }`}
              >
                <Maximize2 className="h-3 w-3" />
                Continuous
              </button>
            </div>
          </div>
        </div>

        {/* Center: Search input in the toolbar */}
        <div className="flex-1 max-w-sm md:max-w-md relative mx-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="toolbar-search-input"
              type="text"
              className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-opacity-50 transition-all ${
                theme === 'charcoal' ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-700' :
                theme === 'darkblue' ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-slate-700' :
                theme === 'sepia' ? 'bg-[#fdf9f4] border-[#dfcca4] text-[#2c1d0f] placeholder-[#a6927d] focus:border-[#c5af8a]' :
                'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'
              }`}
              placeholder="Search headings, code, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  e.currentTarget.blur();
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-60 hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Floating Search Results Dropdown */}
          {searchQuery && (
            <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 p-2 max-h-80 overflow-y-auto ${
              theme === 'charcoal' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' :
              theme === 'darkblue' ? 'bg-[#060a16] border-slate-800 text-slate-100' :
              theme === 'sepia' ? 'bg-[#fbf6ec] border-[#e8dac7] text-[#2c1d0f]' :
              'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex justify-between items-center px-2 py-1 border-b border-inherit mb-1">
                <span className="text-[10px] font-bold opacity-60">
                  Found {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                </span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] opacity-60 hover:opacity-100 font-semibold"
                >
                  Close
                </button>
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs opacity-60">No matching text found</div>
              ) : (
                <div className="space-y-1">
                  {searchResults.slice(0, 10).map((match, idx) => (
                    <button
                      key={`${match.chapterId}-${idx}`}
                      onClick={() => {
                        handleSelectChapter(match.chapterId);
                        // Clean up snippet dots for scrolling/matching
                        const cleanSnippet = match.snippet
                          .replace(/^\.\.\.|\.\.\.$/g, '')
                          .trim()
                          .slice(0, 40); // Grab a nice chunk
                        setSearchScrollTrigger({
                          text: cleanSnippet || searchQuery,
                          chapterId: match.chapterId,
                          timestamp: Date.now()
                        });
                        setSearchQuery('');
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-xs transition-colors hover:bg-slate-500/10 flex flex-col gap-0.5 ${
                        activeChapterId === match.chapterId ? 'bg-indigo-500/5 font-medium' : ''
                      }`}
                    >
                      <div className="font-semibold truncate flex items-center gap-1 opacity-90 text-[11px]">
                        <span>📘</span>
                        <span>{match.chapterName}</span>
                      </div>
                      <div className="text-[10px] opacity-65 font-mono line-clamp-1 leading-snug">
                        {match.snippet}
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 10 && (
                    <div className="text-[9px] opacity-50 text-center py-1 border-t border-inherit mt-1">
                      Showing top 10 matches
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme Swatches, Reset & Export */}
        <div className="flex items-center gap-3">
          
          {/* Labeled Swatches - Enlarged 28px */}
          <div className="hidden md:flex items-center gap-2 mr-1">
            <span className={`text-[11px] font-bold tracking-tight uppercase ${a.subtext}`}>Theme:</span>
            
            {/* Swatch Light */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-[28px] h-[28px] rounded-full bg-white border-2 border-slate-400 relative transition-all shadow-sm ${
                theme === 'light' ? 'scale-110 shadow-md ring-2 ring-indigo-500 border-white' : 'hover:scale-105 hover:border-slate-600'
              }`}
              title="Light Theme"
            >
              {theme === 'light' && <Check className="h-3.5 w-3.5 text-slate-900 absolute inset-0 m-auto font-extrabold" />}
            </button>
 
            {/* Swatch Sepia */}
            <button
              onClick={() => handleThemeChange('sepia')}
              className={`w-[28px] h-[28px] rounded-full bg-[#f4ede0] border-2 border-[#dfcca4] relative transition-all shadow-sm ${
                theme === 'sepia' ? 'scale-110 shadow-md ring-2 ring-[#8e6239] border-white' : 'hover:scale-105 hover:border-[#8e6239]'
              }`}
              title="Sepia Theme"
            >
              {theme === 'sepia' && <Check className="h-3.5 w-3.5 text-[#5c3a21] absolute inset-0 m-auto font-extrabold" />}
            </button>
 
            {/* Swatch Charcoal */}
            <button
              onClick={() => handleThemeChange('charcoal')}
              className={`w-[28px] h-[28px] rounded-full bg-[#2b2b2b] border-2 border-neutral-600 relative transition-all shadow-sm ${
                theme === 'charcoal' ? 'scale-110 shadow-md ring-2 ring-emerald-500 border-white' : 'hover:scale-105 hover:border-neutral-400'
              }`}
              title="Charcoal Theme"
            >
              {theme === 'charcoal' && <Check className="h-3.5 w-3.5 text-emerald-400 absolute inset-0 m-auto font-extrabold" />}
            </button>
 
            {/* Swatch Dark Blue */}
            <button
              onClick={() => handleThemeChange('darkblue')}
              className={`w-[28px] h-[28px] rounded-full bg-[#0f172a] border-2 border-slate-700 relative transition-all shadow-sm ${
                theme === 'darkblue' ? 'scale-110 shadow-md ring-2 ring-cyan-500 border-white' : 'hover:scale-105 hover:border-slate-500'
              }`}
              title="Dark Blue Theme"
            >
              {theme === 'darkblue' && <Check className="h-3.5 w-3.5 text-cyan-400 absolute inset-0 m-auto font-extrabold" />}
            </button>
          </div>
 
          {/* Simple Swatches for mobile */}
          <div className="md:hidden flex items-center gap-1.5 mr-0.5">
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as Theme)}
              className="text-xs p-1.5 rounded-lg bg-inherit border border-inherit font-medium outline-none"
            >
              <option value="light">☀ Light</option>
              <option value="sepia">📖 Sepia</option>
              <option value="charcoal">⬛ Charcoal</option>
              <option value="darkblue">🌙 Dark</option>
            </select>
          </div>
 
          {/* Core App Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const el = document.getElementById('seo-content');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors opacity-80 hover:opacity-100 hidden sm:flex items-center"
              title="Guide & FAQ"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors opacity-80 hover:opacity-100"
              title="Clear Book & Workspace"
            >
              <X className="h-4 w-4 text-rose-500" />
            </button>
            <button
              onClick={handleResetToSample}
              className="p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors opacity-80 hover:opacity-100"
              title="Reset to Sample Chapters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleExportBook}
              disabled={chapters.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 ${a.accentBtn}`}
              title="Export Compiled book.md"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Book</span>
            </button>
          </div>
        </div>
      </header>
 
      {/* 2. Main Content Frame (Split Screen / Desktop layout) */}
      <div id="main-content-frame" className="h-[calc(100vh-4rem)] min-h-[600px] flex-shrink-0 flex overflow-hidden relative">
        
        {/* Mobile Segmented Mode bar (Sticky below header for smaller screens) */}
        <div className="sm:hidden absolute top-0 left-0 right-0 h-11 px-4 flex items-center border-b z-20 transition-all border-inherit bg-inherit">
          <div className="flex-1 flex p-0.5 rounded-lg bg-slate-500/10">
            <button
              onClick={() => setReadingMode('chapter')}
              className={`flex-1 text-center py-1 rounded text-xs font-medium ${
                readingMode === 'chapter' ? a.segmentActive : 'opacity-70'
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setReadingMode('continuous')}
              className={`flex-1 text-center py-1 rounded text-xs font-medium ${
                readingMode === 'continuous' ? a.segmentActive : 'opacity-70'
              }`}
            >
              Continuous
            </button>
          </div>
        </div>
 
        {/* Invisible Notion-Style hover peek trigger strip */}
        {sidebarCollapsed && !sidebarOpen && (
          <div
            onMouseEnter={() => setIsHoverPeeking(true)}
            className="hidden md:block absolute left-0 top-16 bottom-0 w-3 z-50 cursor-pointer group"
          >
            {/* Subtle floating peek indicator bar */}
            <div className="w-1 h-24 rounded-full bg-indigo-500/25 group-hover:bg-indigo-500/50 absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
        )}

        {/* Sidebar Left (Desktop: dynamic width or collapsed/peeking, Mobile: drawer overlay) */}
        <div 
          className={`
            md:block transition-all duration-300 z-40 h-full flex-shrink-0 border-r border-inherit overflow-hidden
            ${showPeekingSidebar ? 'fixed shadow-2xl border-r' : 'relative'}
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
          style={{
            width: (sidebarCollapsed && !isHoverPeeking) ? '0px' : `${sidebarWidth}px`,
            borderRightWidth: (sidebarCollapsed && !isHoverPeeking) ? '0px' : '1px',
            position: showPeekingSidebar ? 'absolute' : undefined,
            top: showPeekingSidebar ? '64px' : undefined,
            bottom: showPeekingSidebar ? '0px' : undefined,
            left: showPeekingSidebar ? '0px' : undefined,
          }}
          onMouseLeave={() => {
            if (sidebarCollapsed) {
              setIsHoverPeeking(false);
            }
          }}
        >
          <Sidebar
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={handleSelectChapter}
            onReorderChapter={handleReorderChapter}
            onDeleteChapter={handleDeleteChapter}
            onRenameChapter={handleRenameChapter}
            onUploadChapters={handleUploadChapters}
            onResetToSample={handleResetToSample}
            theme={theme}
            onResizeStart={handleResizeStart}
          />
        </div>
 
        {/* Mobile Sidebar backdrop overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}
 
        {/* Reader Right (Main body canvas) with Floating Outline support */}
        <main className="flex-1 h-full pt-11 sm:pt-0 overflow-hidden flex relative">
          
          {/* Reader Core viewport */}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative">
            {/* Welcome Info Board inside reader (can be closed) */}
            {showWelcomeAlert && chapters.length > 0 && (
              <div className="p-4 border-b flex-shrink-0 transition-all duration-300">
                <div className={`max-w-2xl mx-auto rounded-xl border p-4 pr-10 flex items-start gap-3 relative shadow-sm ${a.alertBg}`}>
                  <Info className="h-5 w-5 flex-shrink-0 opacity-80 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">Offline-First Workspace ready!</h4>
                    <p className="text-xs opacity-80 mt-1 leading-relaxed">
                      Upload multiple Markdown documents (like documentation pages or books) and assemble them. Use the sidebar quick-actions to reorder, rename, or remove chapters. Once finished, download your customized book as a unified Markdown file.
                    </p>
                    <button
                      onClick={() => setShowWelcomeAlert(false)}
                      className="mt-2 text-[11px] font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                    >
                      Dismiss notice
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowWelcomeAlert(false)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-500/10 transition-colors opacity-60 hover:opacity-100 flex-shrink-0"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
 
            <Reader
              chapters={chapters}
              activeChapterId={activeChapterId}
              readingMode={readingMode}
              theme={theme}
              onSelectChapter={handleSelectChapter}
              searchScrollTrigger={searchScrollTrigger}
              onActiveHeadingChange={setActiveHeadingId}
            />

            {/* Collapsible/Floating Notion-Style Document Outline Panel with Mini-Scrollmap Dash Track */}
            {!(outlineOpen || isOutlineHovered) && (
              <div
                onMouseEnter={() => setIsOutlineHovered(true)}
                className="hidden md:flex absolute right-0 top-16 bottom-0 w-8 z-45 cursor-pointer flex-col justify-center items-center select-none"
                title="Hover to peek Document Outline"
              >
                {/* Visual Dash Track like ChatGPT/Notion minimap */}
                <div className="flex flex-col gap-2 p-1.5 rounded-lg transition-all">
                  {headings.length > 0 ? (
                    headings.slice(0, 15).map((heading, idx) => {
                      const isActive = activeHeadingId === heading.id;
                      return (
                        <div
                          key={`minimap-${heading.id}-${idx}`}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            isActive
                              ? theme === 'charcoal' ? 'w-6 bg-emerald-400' :
                                theme === 'darkblue' ? 'w-6 bg-cyan-400' :
                                theme === 'sepia' ? 'w-6 bg-[#8e6239]' :
                                'w-6 bg-indigo-500'
                              : theme === 'charcoal' ? 'w-3.5 bg-zinc-700/80 hover:bg-zinc-600' :
                                theme === 'darkblue' ? 'w-3.5 bg-slate-800 hover:bg-slate-700' :
                                theme === 'sepia' ? 'w-3.5 bg-[#dfcca4] hover:bg-[#c5b28d]' :
                                'w-3.5 bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      );
                    })
                  ) : (
                    // Fallback visual dashes if no headings exist to show it is a hoverable zone
                    Array.from({ length: 8 }).map((_, idx) => (
                      <div
                        key={`minimap-placeholder-${idx}`}
                        className={`h-1 w-3.5 rounded-full ${
                          theme === 'charcoal' ? 'bg-zinc-800' :
                          theme === 'darkblue' ? 'bg-slate-850' :
                          theme === 'sepia' ? 'bg-[#dfcca4]/40' :
                          'bg-slate-200'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Collapsible/Floating Notion-Style Document Outline Panel */}
            <div 
              className={`
                hidden md:block absolute right-6 top-20 z-40 transition-all duration-300
                ${(outlineOpen || isOutlineHovered) ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-12 opacity-0 pointer-events-none'}
              `}
              onMouseEnter={() => setIsOutlineHovered(true)}
              onMouseLeave={() => setIsOutlineHovered(false)}
            >
              <OutlinePanel
                headings={headings}
                theme={theme}
                onHeadingClick={handleHeadingClick}
                isOpen={outlineOpen || isOutlineHovered}
                isPinned={outlineOpen}
                onPinToggle={() => setOutlineOpen(!outlineOpen)}
                activeHeadingId={activeHeadingId}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 3. SEO Content Section (Useful Guide, Features, Value Pillars, and FAQ) */}
      <SeoContent 
        theme={theme} 
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      />

      {/* 4. Custom Theme-Aware Confirmation Dialog Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-scale-up ${
              theme === 'charcoal' ? 'bg-zinc-950 border-zinc-800 text-zinc-100' :
              theme === 'darkblue' ? 'bg-[#060a16] border-slate-900 text-slate-100' :
              theme === 'sepia' ? 'bg-[#f4ebe1] border-[#e8dac7] text-[#2c1d0f]' :
              'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-base font-bold tracking-tight mb-2 flex items-center gap-2">
              <span>⚠️</span> {confirmAction.title}
            </h3>
            <p className="text-xs opacity-80 leading-relaxed mb-6">
              {confirmAction.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  theme === 'charcoal' ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' :
                  theme === 'darkblue' ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' :
                  theme === 'sepia' ? 'bg-[#efe4d6] hover:bg-[#ebd6bb] text-[#433422]' :
                  'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'clear') {
                    setChapters([]);
                    setActiveChapterId(null);
                  } else if (confirmAction.type === 'reset') {
                    setChapters(SAMPLE_CHAPTERS);
                    setActiveChapterId(SAMPLE_CHAPTERS[0]?.id || null);
                  }
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors text-white ${
                  confirmAction.type === 'clear' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
