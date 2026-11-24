import React, { useRef, useState } from 'react';
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Check, 
  X, 
  UploadCloud, 
  BookMarked,
  RotateCcw
} from 'lucide-react';
import { Chapter, Theme } from '../types';

interface SidebarProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onReorderChapter: (id: string, direction: 'up' | 'down') => void;
  onDeleteChapter: (id: string) => void;
  onRenameChapter: (id: string, newName: string) => void;
  onUploadChapters: (newChapters: { name: string; content: string }[]) => void;
  onResetToSample: () => void;
  theme: Theme;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onReorderChapter,
  onDeleteChapter,
  onRenameChapter,
  onUploadChapters,
  onResetToSample,
  theme,
  onResizeStart
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = (files: FileList) => {
    const list = Array.from(files);
    const mdFiles = list.filter(
      (f) => f.name.endsWith('.md') || f.name.endsWith('.markdown') || f.name.endsWith('.txt')
    );

    if (mdFiles.length === 0) {
      alert('Please upload .md, .markdown, or .txt files.');
      return;
    }

    const loadedChapters: { name: string; content: string }[] = [];
    let loadedCount = 0;

    mdFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Strip out extension for cleaner default name
        const cleanName = file.name.replace(/\.md$|\.markdown$|\.txt$/, '');
        loadedChapters.push({
          name: cleanName,
          content: text
        });

        loadedCount++;
        if (loadedCount === mdFiles.length) {
          onUploadChapters(loadedChapters);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    });
  };

  // Editing Name handlers
  const startEditing = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chapter.id);
    setEditName(chapter.name);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRenameChapter(id, editName.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Stats
  const calculateWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const calculateReadTime = (content: string) => {
    const words = calculateWordCount(content);
    return Math.max(1, Math.ceil(words / 200));
  };

  // Styling based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'charcoal':
        return {
          bg: 'bg-zinc-950 border-zinc-800 text-zinc-100',
          input: 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600',
          itemActive: 'bg-zinc-800/80 text-emerald-400 border-l-4 border-emerald-500',
          itemInactive: 'hover:bg-zinc-900/60 text-zinc-300',
          uploadArea: 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/50',
          resultsBg: 'bg-zinc-900 border-zinc-800',
          badge: 'bg-zinc-800 text-zinc-400',
        };
      case 'darkblue':
        return {
          bg: 'bg-[#060a16] border-slate-900 text-slate-100',
          input: 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-slate-700',
          itemActive: 'bg-slate-800/70 text-cyan-400 border-l-4 border-cyan-500',
          itemInactive: 'hover:bg-slate-900/60 text-slate-300',
          uploadArea: 'border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-900/50',
          resultsBg: 'bg-slate-900 border-slate-800',
          badge: 'bg-slate-800 text-slate-400',
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ebe1] border-[#e8dac7] text-[#2c1d0f]',
          input: 'bg-[#fdf9f4] border-[#dfcca4] text-[#2c1d0f] placeholder-[#a6927d] focus:border-[#c5af8a]',
          itemActive: 'bg-[#eadbc8] text-[#5c3a21] border-l-4 border-[#8e6239]',
          itemInactive: 'hover:bg-[#efe4d6] text-[#4a3b2c]',
          uploadArea: 'border-[#dfcca4] bg-[#fcf9f4]/50 text-[#6b553e] hover:bg-[#efe4d6]/60',
          resultsBg: 'bg-[#fbf6ec] border-[#e8dac7]',
          badge: 'bg-[#eadbc8] text-[#6b553e]',
        };
      case 'light':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          input: 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400',
          itemActive: 'bg-indigo-50/80 text-indigo-700 border-l-4 border-indigo-500',
          itemInactive: 'hover:bg-slate-200/50 text-slate-600',
          uploadArea: 'border-slate-200 bg-slate-100/50 text-slate-500 hover:bg-slate-100',
          resultsBg: 'bg-white border-slate-200',
          badge: 'bg-slate-100 text-slate-500',
        };
    }
  };

  const s = getThemeStyles();

  return (
    <aside id="app-sidebar" className={`w-full h-full flex flex-col transition-colors duration-300 relative ${s.bg}`}>
      {/* Resizing handle on desktop */}
      {onResizeStart && (
        <div
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/35 active:bg-indigo-500/50 transition-colors z-50 group hidden md:block"
          onMouseDown={onResizeStart}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-12 rounded bg-slate-400/30 group-hover:bg-indigo-500/80 transition-all" />
        </div>
      )}

      {/* Upload Box (Sticky at top of sidebar to avoid cut-off at 100% zoom) */}
      <div className="p-4 border-b border-inherit flex-shrink-0">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            isDragging ? 'border-indigo-500 bg-indigo-50/10' : s.uploadArea
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".md,.markdown,.txt"
            onChange={handleFileChange}
          />
          <div className="flex items-center gap-1.5 text-indigo-500">
            <UploadCloud className="h-4.5 w-4.5" />
            <span className="text-xs font-bold font-sans tracking-tight">+ Add Book / Files</span>
          </div>
          <p className="text-[10px] opacity-50 font-medium">
            or drag markdown files here
          </p>
        </div>
      </div>

      {/* Chapters TOC Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold tracking-wider uppercase opacity-60 flex items-center gap-1.5">
              <BookMarked className="h-3.5 w-3.5" /> Table of Contents
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold opacity-85 bg-opacity-20 bg-slate-500">
              {chapters.length} Ch.
            </span>
          </div>

          {chapters.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-inherit">
              <p className="text-sm opacity-60 mb-2">No chapters loaded</p>
              <button 
                onClick={onResetToSample}
                className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="h-3 w-3" /> Load Sample Book
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {chapters.map((chapter, index) => {
                const words = calculateWordCount(chapter.content);
                const readTime = calculateReadTime(chapter.content);
                const isActive = activeChapterId === chapter.id;

                return (
                  <div
                    key={chapter.id}
                    id={`toc-item-${chapter.id}`}
                    onClick={() => onSelectChapter(chapter.id)}
                    className={`group relative p-3 rounded-xl cursor-pointer border border-transparent transition-all duration-200 ${
                      isActive ? s.itemActive : s.itemInactive
                    }`}
                  >
                    {editingId === chapter.id ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="w-full text-sm font-medium px-2 py-1 rounded border border-indigo-400 bg-inherit text-inherit outline-none"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing(chapter.id, e as any);
                            if (e.key === 'Escape') cancelEditing(e as any);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={(e) => saveEditing(chapter.id, e)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save Name"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-start gap-2 pr-10">
                          <span className="text-base select-none flex-shrink-0 -mt-0.5" aria-hidden="true">📘</span>
                          <span className="text-sm font-medium leading-snug truncate">
                            {chapter.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2.5 mt-1.5 text-[10px] opacity-60">
                          <span className="font-medium">{words.toLocaleString()} words</span>
                          <span>•</span>
                          <span>{readTime} min read</span>
                        </div>

                        {/* Hover Quick Actions */}
                        <div 
                          className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 p-1 rounded-lg backdrop-blur bg-opacity-70 shadow-sm border border-inherit bg-inherit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onReorderChapter(chapter.id, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:text-indigo-500 rounded disabled:opacity-30 disabled:hover:text-inherit"
                            title="Move Up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onReorderChapter(chapter.id, 'down')}
                            disabled={index === chapters.length - 1}
                            className="p-1 hover:text-indigo-500 rounded disabled:opacity-30 disabled:hover:text-inherit"
                            title="Move Down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => startEditing(chapter, e)}
                            className="p-1 hover:text-yellow-600 rounded"
                            title="Rename"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteChapter(chapter.id)}
                            className="p-1 hover:text-red-500 rounded"
                            title="Delete Chapter"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
