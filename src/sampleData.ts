import { Chapter } from './types';

export const SAMPLE_CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    name: '1. Introduction to Markdown Reader',
    order: 1,
    content: `# Introduction to Markdown Reader

Welcome to the **Markdown Reader**! This is a local-first, offline-ready reading companion designed to turn your collection of individual Markdown files into a beautifully formatted, searchable, and cohesive book.

---

## 🚀 Why Use This App?

If you write or collect documentation, books, study guides, or logs in Markdown, you often end up with dozens of disconnected \`.md\` files. Opening them one-by-one is tedious. 

This reader lets you:
1. **Combine** them into an organized digital book.
2. **Read** in continuous flow or one chapter at a time.
3. **Customize** your typography and color scheme (themes).
4. **Search** across all documents simultaneously.
5. **Export** everything back into a single merged Markdown document.

---

## 🎨 Rich Text Formatting Sample

Markdown supports all kinds of formatting. Here is a quick demonstration of what this reader can render:

### Lists and Tasks
* **Bold Text** and *Italic Text* for emphasis.
* [x] Local-first storage
* [x] Drag & drop upload
* [ ] Multi-level nested chapters
* [ ] Rich annotation support (coming soon!)

### Code Blocks
\`\`\`typescript
// Every file is processed entirely in your browser!
const readerState = {
  theme: 'light',
  readingMode: 'chapter',
  offlineReady: true
};
console.log("Welcome to Markdown Reader!");
\`\`\`

### Blockquotes
> "The simple things are also the most extraordinary things, and only the wise can see them." 
> — *Paulo Coelho, The Alchemist*

Enjoy reading! Switch to the next chapter using the sidebar or the navigation buttons at the bottom of the page.
`
  },
  {
    id: 'getting-started',
    name: '2. Getting Started & Features',
    order: 2,
    content: `# Getting Started & Features

Getting started is simple. You can drag and drop multiple Markdown files directly into the sidebar, or click the **"Upload Files"** button to choose them from your computer.

---

## ⚙️ Core Features Explained

### 1. 📂 File Management
All uploaded files are parsed on your device. We **never** send your files to any server, ensuring complete privacy. 
- **Reorder**: Use the **Up** (▲) and **Down** (▼) buttons on any chapter in the sidebar to re-arrange the reading sequence.
- **Delete**: Click the trash icon to remove a chapter from your current reading list.
- **Append**: You can upload more files at any point. They will be added to the end of your book.

### 2. 📚 Two Reading Modes
- **Chapter Mode**: Focus on one chapter at a time. Perfect for distraction-free, sequential reading.
- **Continuous Mode**: Concatenates all your chapters into a single long document. Ideal for scrolling through a complete book or doing quick ctrl+F searches within the browser.

### 3. 🔍 Search Anything
Use the search bar at the top of the sidebar. It scans the titles and contents of *all* chapters instantly.
- Matching results will show a short snippet of the surrounding context.
- Clicking any search result will automatically switch to that chapter and focus your view.

### 4. 🎨 Reading Themes
Different lighting conditions require different colors. Choose from our curated themes:
- ☀ **Light**: Classic, crisp black-on-white.
- ⬛ **Charcoal**: Sleek, eye-friendly grey dark mode.
- 🌙 **Dark Blue**: Low-contrast deep navy blue for night reading.
- 📖 **Sepia**: Warm, bookish tones resembling aged paper.

*Your theme and reading progress are automatically saved to Local Storage!*
`
  },
  {
    id: 'advanced-tips',
    name: '3. Advanced Tips & Shortcuts',
    order: 3,
    content: `# Advanced Tips & Shortcuts

Maximize your reading productivity with these professional workflows.

---

## 📥 Exporting Your Book

Once you have arranged your chapters in the perfect order, you can export them as a single consolidated file:
1. Click the **"Export Book"** button in the header.
2. The app will compile all chapters, separated by clear structural Markdown headings and horizontal dividers (\`---\`).
3. It will prompt you to download a single file named \`book.md\`.

This is incredibly useful for:
- Creating a single document to convert into PDF or ePUB using tools like Pandoc.
- Creating a master readme/documentation file for GitHub repositories.
- Backing up your compiled work.

---

## ⌨️ Keyboard Navigation
Navigate your book like a power user:
- <kbd>Left Arrow</kbd> : Jump to the previous chapter (in Chapter Mode).
- <kbd>Right Arrow</kbd> : Jump to the next chapter (in Chapter Mode).
- <kbd>Esc</kbd> : Close search results or clear active search query.

---

## 🔒 Offline & Local-First Philosophy
This app runs completely inside your browser using standard modern HTML5 APIs. 
- **No Account Required**: Start reading instantly.
- **No Cloud Database**: Your books reside strictly inside your browser's \`localStorage\` sandbox.
- **Zero Tracker Scripts**: We value your privacy and intellectual property. Your notes, journals, and drafts remain 100% yours.
`
  }
];
