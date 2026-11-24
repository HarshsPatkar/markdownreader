import React, { useState } from 'react';
import { Theme } from '../types';
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Search, 
  Sliders, 
  Download, 
  ChevronDown, 
  HelpCircle,
  Sparkles,
  ArrowUp
} from 'lucide-react';

interface SeoContentProps {
  theme: Theme;
  onScrollToTop?: () => void;
}

export const SeoContent: React.FC<SeoContentProps> = ({ theme, onScrollToTop }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'charcoal':
        return {
          wrapper: 'bg-[#18181b] text-zinc-200 border-zinc-800',
          card: 'bg-zinc-900/90 border-zinc-800 text-zinc-100',
          cardMuted: 'bg-zinc-900/50 border-zinc-800 text-zinc-300',
          subtext: 'text-zinc-400',
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          faqOpen: 'bg-zinc-900 border-zinc-700',
          faqClosed: 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          divider: 'border-zinc-800',
          highlight: 'text-emerald-400 font-semibold',
          footerBg: 'bg-zinc-950 text-zinc-400 border-zinc-800',
        };
      case 'darkblue':
        return {
          wrapper: 'bg-[#0b1329] text-slate-200 border-slate-800',
          card: 'bg-slate-900/90 border-slate-800 text-slate-100',
          cardMuted: 'bg-slate-900/50 border-slate-800 text-slate-300',
          subtext: 'text-slate-400',
          accent: 'text-cyan-400',
          accentBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          faqOpen: 'bg-slate-900 border-slate-700',
          faqClosed: 'bg-slate-900/60 border-slate-800 hover:border-slate-700',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          divider: 'border-slate-800',
          highlight: 'text-cyan-400 font-semibold',
          footerBg: 'bg-[#060a17] text-slate-400 border-slate-800',
        };
      case 'sepia':
        return {
          wrapper: 'bg-[#f4eee2] text-[#3d2b1f] border-[#dfcca4]',
          card: 'bg-[#fcf8f2] border-[#e2d2b8] text-[#3d2b1f]',
          cardMuted: 'bg-[#f8f1e5] border-[#dfcca4] text-[#4d3b2e]',
          subtext: 'text-[#6e5847]',
          accent: 'text-[#8e6239]',
          accentBg: 'bg-[#ebd6bb] text-[#5c3a21] border-[#dfcca4]',
          faqOpen: 'bg-[#fcf8f2] border-[#c8b493]',
          faqClosed: 'bg-[#f9f4ec] border-[#e5d8c3] hover:border-[#cfbd9f]',
          badge: 'bg-[#ebd9c1] text-[#4a3424] border-[#d8c4a9]',
          divider: 'border-[#dfcca4]',
          highlight: 'text-[#8e6239] font-semibold',
          footerBg: 'bg-[#ebd9c1] text-[#5c4735] border-[#dfcca4]',
        };
      case 'light':
      default:
        return {
          wrapper: 'bg-slate-50 text-slate-800 border-slate-200',
          card: 'bg-white border-slate-200 text-slate-900 shadow-sm',
          cardMuted: 'bg-slate-100/70 border-slate-200 text-slate-700',
          subtext: 'text-slate-600',
          accent: 'text-indigo-600',
          accentBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          faqOpen: 'bg-white border-indigo-300 shadow-sm',
          faqClosed: 'bg-white border-slate-200 hover:border-slate-300',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          divider: 'border-slate-200',
          highlight: 'text-indigo-600 font-semibold',
          footerBg: 'bg-slate-100 text-slate-600 border-slate-200',
        };
    }
  };

  const s = getThemeStyles();

  const faqs = [
    {
      question: 'What is Markdown Reader and how does it work?',
      answer:
        'Markdown Reader is a free online Markdown reader and markdown viewer designed to render and read .md files with book-like typography. It functions as an in-browser md reader online, parsing Markdown documents entirely on the client side with continuous reading, chapter-by-chapter pagination, full-text search, and real-time word count metrics.'
    },
    {
      question: 'How do I open .md files online using Markdown Reader?',
      answer:
        'You can open .md files online by dragging and dropping one or more Markdown files directly onto the browser window or clicking the "Upload .md Files" button in the sidebar. The built-in markdown file opener immediately arranges your files into structured, readable chapters.'
    },
    {
      question: 'Can I use Markdown Reader as a README file viewer for GitHub projects?',
      answer:
        'Yes! Markdown Reader serves as a convenient readme file viewer and readme viewer. You can easily drop in repository README.md files or software documentation sets to preview and read them in a clean, formatted layout without needing to open a code editor.'
    },
    {
      question: 'Are my markdown documents private and secure?',
      answer:
        'Yes, completely. Markdown Reader operates with an offline-first, client-side architecture. As a private .md viewer, your files are processed locally in your browser memory and never uploaded, stored, or transmitted to any external server.'
    },
    {
      question: 'Can I read multi-chapter books or large documentation sets?',
      answer:
        'Yes. Our md file reader lets you load dozens of markdown files simultaneously. The sidebar lets you reorder chapters via drag-and-drop or rename sections. You can switch between Single Chapter mode and Continuous mode to read through everything seamlessly.'
    },
    {
      question: 'Can I export my compiled markdown book back into a single file?',
      answer:
        'Yes. With the "Export Book" button in the top toolbar, you can compile and download all your loaded chapters into a single, unified Markdown (.md) file with proper chapter separation.'
    },
    {
      question: 'Does this md viewer support syntax highlighting for code blocks and tables?',
      answer:
        'Yes. This md file viewer cleanly renders code blocks, inline code, formatted tables, blockquotes, lists, hyperlinks, and typographic emphasis with high contrast and readable line heights.'
    },
    {
      question: 'Can I use this markdown file viewer offline without internet?',
      answer:
        'Yes. Because Markdown Reader is a client-side web application that caches state locally in your browser, you can continue viewing and navigating your opened documents even when disconnected from the internet.'
    }
  ];

  return (
    <section 
      id="seo-content" 
      aria-label="Markdown Reader Information and Guide" 
      className={`border-t transition-colors duration-300 ${s.wrapper}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
        
        {/* Section 1: Hero & What is Markdown Reader? */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${s.accentBg}`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Online Markdown Reader & Viewer</span>
            </div>
            
            {/* Primary SEO H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Markdown Reader – Read Markdown Files Online
            </h1>
            
            <p className={`text-base sm:text-lg leading-relaxed ${s.subtext}`}>
              A fast, privacy-focused <strong className={s.highlight}>markdown reader online</strong> and versatile <strong className={s.highlight}>md file viewer</strong>. Whether you need an intuitive <strong className={s.highlight}>md reader online</strong> to inspect documentation or a distraction-free <strong className={s.highlight}>readme viewer</strong> for project notes, Markdown Reader lets you open and read <span className={s.highlight}>.md files</span> in a clean, book-like reading experience without installing any software.
            </p>
          </div>

          {/* Section: What is Markdown Reader? */}
          <div className={`p-8 sm:p-10 rounded-2xl border ${s.card}`}>
            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2.5">
              <BookOpen className={`h-6 w-6 ${s.accent}`} />
              <span>What is Markdown Reader?</span>
            </h2>
            <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${s.subtext}`}>
              <p>
                <strong className={s.highlight}>Markdown Reader</strong> is an intuitive web-based <strong className={s.highlight}>md reader</strong> and <strong className={s.highlight}>markdown file viewer online</strong> built for developers, technical writers, researchers, and book authors who need a distraction-free way to <strong className={s.highlight}>read markdown online</strong> and preview documentation. Instead of viewing raw syntax or dealing with cluttered code editor interfaces, this free <strong className={s.highlight}>markdown viewer</strong> transforms plain text into beautifully typeset prose.
              </p>
              <p>
                Whether you want to <strong className={s.highlight}>read md file online</strong>, review GitHub <strong className={s.highlight}>README.md</strong> files with a dedicated <strong className={s.highlight}>readme file viewer</strong>, or browse multi-chapter guides, this <strong className={s.highlight}>md viewer</strong> and <strong className={s.highlight}>markdown file opener</strong> organizes your content with an interactive table of contents, responsive document outline, instant search, and customizable color schemes.
              </p>
            </div>

            {/* Value Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-inherit">
              <div className={`p-4 rounded-xl border ${s.cardMuted} flex flex-col gap-2`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className={`h-4.5 w-4.5 ${s.accent}`} />
                  <span>100% Private & Local</span>
                </div>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  All parsing happens entirely in your browser. As an in-browser <strong className={s.highlight}>.md file viewer</strong>, your files never leave your device.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${s.cardMuted} flex flex-col gap-2`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Zap className={`h-4.5 w-4.5 ${s.accent}`} />
                  <span>Multi-Chapter Books</span>
                </div>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Load dozens of files with our <strong className={s.highlight}>md files reader</strong> to reorder chapters and <strong className={s.highlight}>read md</strong> documents seamlessly.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${s.cardMuted} flex flex-col gap-2`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileText className={`h-4.5 w-4.5 ${s.accent}`} />
                  <span>Unified Book Export</span>
                </div>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Compile, arrange, and download your entire project as a single, clean markdown file.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: How to Read a Markdown File Online */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How to Read a Markdown File Online
            </h2>
            <p className={`text-sm sm:text-base ${s.subtext}`}>
              Get started in seconds with our step-by-step guide to viewing and managing your .md documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-5 rounded-xl border ${s.card} flex flex-col justify-between`}>
              <div className="space-y-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.badge}`}>STEP 01</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 pt-1">
                  <Upload className="h-4 w-4 opacity-70" />
                  <span>Open .MD Files</span>
                </h3>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Drag and drop your markdown files or click upload in the sidebar to <strong className={s.highlight}>open .md files online</strong> instantly with this browser-based <strong className={s.highlight}>.md reader</strong>.
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${s.card} flex flex-col justify-between`}>
              <div className="space-y-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.badge}`}>STEP 02</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 pt-1">
                  <Sliders className="h-4 w-4 opacity-70" />
                  <span>Organize Chapters</span>
                </h3>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Reorder chapters with simple controls, rename titles, or remove unwanted sections to build your custom table of contents in this <strong className={s.highlight}>md file reader</strong>.
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${s.card} flex flex-col justify-between`}>
              <div className="space-y-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.badge}`}>STEP 03</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 pt-1">
                  <BookOpen className="h-4 w-4 opacity-70" />
                  <span>Choose Mode</span>
                </h3>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Toggle between paginated <em>Chapter Mode</em> for focused reading and <em>Continuous Mode</em> for an uninterrupted infinite scroll.
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${s.card} flex flex-col justify-between`}>
              <div className="space-y-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.badge}`}>STEP 04</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 pt-1">
                  <Search className="h-4 w-4 opacity-70" />
                  <span>Search & Navigate</span>
                </h3>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Use full-text search to find keywords across all chapters or click the outline minimap to jump directly to any heading.
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${s.card} flex flex-col justify-between`}>
              <div className="space-y-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.badge}`}>STEP 05</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 pt-1">
                  <Download className="h-4 w-4 opacity-70" />
                  <span>Export Book</span>
                </h3>
                <p className={`text-xs leading-relaxed ${s.subtext}`}>
                  Export your compiled book as a consolidated .md file ready for sharing, archiving, or publishing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: A Clean Markdown Reading Experience */}
        <div className={`p-8 sm:p-10 rounded-2xl border ${s.card}`}>
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
              A Clean Markdown Reading Experience
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed text-center ${s.subtext}`}>
              Reading lengthy technical papers, software documentation, or repository guides in a code editor quickly leads to visual fatigue. As a dedicated <strong className={s.highlight}>markdown file viewer</strong>, Markdown Reader is engineered around typographic harmony, comfortable spacing, and reading ergonomics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="flex gap-3.5 items-start">
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.accent}`} />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Distraction-Free Themes</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${s.subtext}`}>
                    Switch between Warm Sepia (reminiscent of paper books), Charcoal Dark, Deep Slate Blue, and Crisp Light themes to suit any ambient lighting.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.accent}`} />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Formatted Code & Tables</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${s.subtext}`}>
                    Code blocks, inline snippets, tables, blockquotes, and ordered lists are rendered with clean formatting, monospace fonts, and high legibility.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.accent}`} />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Reading Progress & Word Counts</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${s.subtext}`}>
                    Track your reading progress with a responsive top progress bar, live word count metrics, and estimated reading time calculations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.accent}`} />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Interactive Outline Minimap</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${s.subtext}`}>
                    Quickly glance at document hierarchy and jump to specific H1, H2, or H3 sections using the hover-enabled outline panel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Why Use an Online Markdown Viewer? */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Use an Online Markdown Viewer?
            </h2>
            <p className={`text-sm sm:text-base ${s.subtext}`}>
              Discover the practical benefits of using a dedicated browser-based <span className={s.highlight}>markdown viewer</span> and <span className={s.highlight}>md file viewer online</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl border ${s.card} space-y-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.accentBg}`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Zero Software Installation</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${s.subtext}`}>
                No need to install complex desktop software, heavy IDE extensions, or command-line markdown parsers. Simply open your browser to <strong className={s.highlight}>read md</strong> documents and README files immediately on any operating system.
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${s.card} space-y-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.accentBg}`}>
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Assembles Multi-File Documents</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${s.subtext}`}>
                Most standalone viewers only display a single file at a time. Markdown Reader functions as an organized <strong className={s.highlight}>md files reader</strong>, letting you upload an entire directory of chapter files and browse them as a unified book.
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${s.card} space-y-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.accentBg}`}>
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Guaranteed Data Privacy</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${s.subtext}`}>
                Your proprietary documentation, sensitive draft manuscripts, and personal notes remain 100% confidential. As a client-side <strong className={s.highlight}>markdown reader</strong>, no data is ever sent to external cloud storage or third-party servers.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Frequently Asked Questions (FAQ) */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.accentBg}`}>
              <HelpCircle className="h-3.5 w-3.5" />
              <span>FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className={`text-sm sm:text-base ${s.subtext}`}>
              Common questions about using our online <span className={s.highlight}>markdown reader</span> and <span className={s.highlight}>md file viewer</span>.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? s.faqOpen : s.faqClosed
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left font-semibold text-sm sm:text-base flex justify-between items-center gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 opacity-60 ${
                        isOpen ? 'rotate-180 opacity-100' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className={`px-5 pb-4 pt-1 text-xs sm:text-sm leading-relaxed border-t border-inherit/40 ${s.subtext}`}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Reader action */}
        {onScrollToTop && (
          <div className="text-center pt-8">
            <button
              onClick={onScrollToTop}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-105 ${s.accentBg}`}
            >
              <ArrowUp className="h-4 w-4" />
              <span>Back to Markdown Reader</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`border-t py-8 px-4 text-center text-xs ${s.footerBg}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-inherit">Markdown Reader</span>
            <span className="opacity-60">• Read Markdown Files Online</span>
          </div>
          <p className="opacity-75">
            Free, privacy-first, and client-side online Markdown viewer and reader.
          </p>
        </div>
      </footer>
    </section>
  );
};
