import React from 'react';
import { List, ChevronRight, Hash, Pin, PinOff } from 'lucide-react';
import { HeadingItem } from '../utils/text';
import { Theme } from '../types';

interface OutlinePanelProps {
  headings: HeadingItem[];
  theme: Theme;
  onHeadingClick: (id: string) => void;
  isOpen: boolean;
  isPinned: boolean;
  onPinToggle: () => void;
  activeHeadingId?: string | null;
}

export const OutlinePanel: React.FC<OutlinePanelProps> = ({
  headings,
  theme,
  onHeadingClick,
  isOpen,
  isPinned,
  onPinToggle,
  activeHeadingId
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case 'charcoal':
        return {
          bg: 'bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-md shadow-2xl',
          hoverItem: 'hover:bg-zinc-900/80 hover:text-emerald-400',
          activeItem: 'bg-emerald-500/15 text-emerald-400 font-semibold border-l-2 border-emerald-500',
          titleColor: 'text-zinc-400',
          bulletColor: 'text-zinc-600',
          scrollbar: 'scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent'
        };
      case 'darkblue':
        return {
          bg: 'bg-[#060a16]/95 border-slate-900 text-slate-100 backdrop-blur-md shadow-2xl',
          hoverItem: 'hover:bg-slate-900/80 hover:text-cyan-400',
          activeItem: 'bg-cyan-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-500',
          titleColor: 'text-slate-400',
          bulletColor: 'text-slate-700',
          scrollbar: 'scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent'
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ebe1]/95 border-[#e8dac7] text-[#2c1d0f] backdrop-blur-md shadow-xl',
          hoverItem: 'hover:bg-[#efe4d6] hover:text-[#8e6239]',
          activeItem: 'bg-[#8e6239]/10 text-[#8e6239] font-semibold border-l-2 border-[#8e6239]',
          titleColor: 'text-[#8a755d]',
          bulletColor: 'text-[#d7c4aa]',
          scrollbar: 'scrollbar-thin scrollbar-thumb-[#ebd6bb] scrollbar-track-transparent'
        };
      case 'light':
      default:
        return {
          bg: 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-xl',
          hoverItem: 'hover:bg-slate-100 hover:text-indigo-700',
          activeItem: 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-500',
          titleColor: 'text-slate-500',
          bulletColor: 'text-slate-300',
          scrollbar: 'scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent'
        };
    }
  };

  const s = getThemeStyles();

  if (!isOpen) {
    return (
      <button
        onClick={onPinToggle}
        className={`fixed right-6 bottom-24 z-40 p-3.5 rounded-full shadow-2xl border flex items-center justify-center transition-all ${s.bg} hover:scale-110 active:scale-95 group`}
        title="Show Document Outline"
      >
        <List className="h-5 w-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  // Helper to determine heading indentation classes
  const getIndentationClass = (level: number) => {
    switch (level) {
      case 1: return 'pl-1 text-sm';
      case 2: return 'pl-4 text-xs';
      case 3: return 'pl-7 text-[11px]';
      case 4: return 'pl-10 text-[11px] opacity-85';
      case 5: return 'pl-12 text-[10px] opacity-75';
      case 6: return 'pl-14 text-[10px] opacity-65';
      default: return 'pl-1';
    }
  };

  return (
    <aside
      id="outline-sidebar"
      className={`w-76 md:w-80 flex flex-col max-h-[70vh] rounded-2xl border transition-all duration-300 overflow-hidden ${s.bg}`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-inherit flex items-center justify-between flex-shrink-0 select-none">
        <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${s.titleColor}`}>
          <List className="h-3.5 w-3.5 text-indigo-500" /> Outline
        </span>
        
        <div className="flex items-center gap-1">
          {/* Pinned Status Lock Button */}
          <button
            onClick={onPinToggle}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 opacity-75 hover:opacity-100`}
            title={isPinned ? "Unpin (Enable Hover Peek Mode)" : "Pin (Keep Always Visible)"}
          >
            {isPinned ? (
              <Pin className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
            ) : (
              <PinOff className="h-3.5 w-3.5" />
            )}
          </button>
          
          <button
            onClick={onPinToggle}
            className="p-1 rounded-lg hover:bg-slate-500/10 transition-colors opacity-75 hover:opacity-100 text-xs flex items-center gap-1"
            title="Collapse Outline"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Heading List */}
      <div className={`flex-1 overflow-y-auto p-3.5 ${s.scrollbar}`}>
        {headings.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4">
            <Hash className="h-8 w-8 mb-2 opacity-25" />
            <p className="text-xs opacity-60">No headings detected</p>
            <p className="text-[10px] opacity-40 mt-1">Use # symbols in markdown to generate document navigators.</p>
          </div>
        ) : (
          <nav className="space-y-1">
            {headings.map((heading, idx) => {
              const indent = getIndentationClass(heading.level);
              const isActive = activeHeadingId === heading.id;
              
              return (
                <button
                  key={`${heading.id}-${idx}`}
                  onClick={() => onHeadingClick(heading.id)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-all flex items-start gap-1.5 ${indent} ${
                    isActive ? s.activeItem : `${s.hoverItem} text-inherit opacity-85 hover:opacity-100`
                  }`}
                >
                  <span className={`text-[10px] mt-0.5 select-none opacity-50 ${s.bulletColor}`}>
                    {'#'.repeat(heading.level)}
                  </span>
                  <span className="truncate leading-normal">{heading.text}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
};
