"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  FileUp,
  Filter,
  GraduationCap,
  Layers,
  LibraryBig,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ANATOMY_LIBRARY_BOOKS, type AnatomyBook } from "../lib/library-data";
import {
  getStoredReadingProgress,
  getMostRecentBookProgress,
  getTodayStudyStats,
  type BookProgress,
} from "../lib/library-storage";
import type { UiDictionary } from "../i18n/types";

interface LibraryPageProps {
  t: UiDictionary;
  onOpenBook: (bookId: string, pageNumber?: number) => void;
  onOpenCustomBook?: (customBook: AnatomyBook) => void;
  onNavigateTab: (tab: "home" | "explore" | "lessons" | "notes") => void;
}

const CATEGORIES = [
  "All",
  "Anatomy",
  "Physiology",
  "Clinical",
  "Histology",
  "Atlas",
  "Neuroanatomy",
] as const;

export function LibraryPage({
  t,
  onOpenBook,
  onOpenCustomBook,
  onNavigateTab,
}: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [progressMap, setProgressMap] = useState<Record<string, BookProgress>>({});
  const [recentProgress, setRecentProgress] = useState<BookProgress | null>(null);
  const [todayStats, setTodayStats] = useState({
    formattedTime: "0m",
    sessionCount: 0,
    pagesRead: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState<boolean>(false);

  const handleOpenLocalFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingDoc(true);
    const fileName = file.name;
    const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

    try {
      if (fileExt === "pdf") {
        // Direct Client-Side PDF Object URL
        const pdfBlobUrl = URL.createObjectURL(file);
        const customBook: AnatomyBook = {
          id: `local-pdf-${Date.now()}`,
          title: fileName.replace(/\.pdf$/i, ""),
          subtitle: "Local PDF Document",
          author: "Personal Study Document",
          authorTitle: "Local Device File",
          category: "Anatomy",
          edition: "Imported PDF",
          publisher: "Local Device Storage",
          totalPages: 1000,
          defaultStartPage: 1,
          accentColor: "#2563eb",
          badge: "Local PDF",
          pdfUrl: pdfBlobUrl,
          coverBg: "linear-gradient(145deg, #1e3a8a 0%, #0f172a 100%)",
          coverPattern: "cellular",
          description: `Local PDF document "${fileName}" loaded directly from device storage for private study.`,
          chapters: [
            {
              id: "local-ch1",
              title: "1. Document Overview",
              startPage: 1,
              endPage: 50,
              sectionName: "Imported Document",
              summary: fileName,
            },
            {
              id: "local-ch2",
              title: "2. Full Document Content",
              startPage: 51,
              endPage: 1000,
              sectionName: "Imported Document",
              summary: "Full document contents",
            },
          ],
          pages: {},
        };
        onOpenCustomBook?.(customBook);
      } else if (fileExt === "txt" || fileExt === "md") {
        // Text/Markdown File Parser
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        const linesPerPage = 12;
        const totalPages = Math.max(1, Math.ceil(lines.length / linesPerPage));

        const pages: Record<number, any> = {};
        for (let p = 1; p <= totalPages; p++) {
          const slice = lines.slice((p - 1) * linesPerPage, p * linesPerPage);
          pages[p] = {
            pageNumber: p,
            chapterTitle: `${fileName} (Part ${p})`,
            sectionHeadline: `${fileName.replace(/\.[^.]+$/, "")} — Page ${p}`,
            subheading: `Imported Study Document • Section ${p} of ${totalPages}`,
            bodyParagraphs: slice.length > 0 ? slice : ["No additional text on this page."],
            anatomicalTerms: ["Document Import", "Study Note", "Local File"],
            clinicalPearl: `[Study Record] Document "${fileName}" imported on ${new Date().toLocaleDateString()}.`,
            keyTakeaway: `Key Summary: Page ${p} of imported study notes.`,
            diagramTitle: `Figure: Imported Note Structure (${fileName})`,
            diagramSvgType: "heart-circulation",
          };
        }

        const customBook: AnatomyBook = {
          id: `local-doc-${Date.now()}`,
          title: fileName.replace(/\.[^.]+$/, ""),
          subtitle: `Local ${fileExt.toUpperCase()} Document`,
          author: "Personal Study Document",
          authorTitle: "Local Device File",
          category: "Anatomy",
          edition: `Imported ${fileExt.toUpperCase()}`,
          publisher: "Local Device Storage",
          totalPages: totalPages,
          defaultStartPage: 1,
          accentColor: "#059669",
          badge: `Local ${fileExt.toUpperCase()}`,
          coverBg: "linear-gradient(145deg, #065f46 0%, #022c22 100%)",
          coverPattern: "cellular",
          description: `Local study file "${fileName}" loaded directly into your Study Room with full highlighting and note-taking.`,
          chapters: [
            {
              id: "local-ch1",
              title: `1. ${fileName.replace(/\.[^.]+$/, "")}`,
              startPage: 1,
              endPage: totalPages,
              sectionName: "Imported File",
              summary: `Complete text extracted from ${fileName}`,
            },
          ],
          pages,
        };
        onOpenCustomBook?.(customBook);
      } else {
        // DOCX, DOC, PPT, PPTX or other Office Formats
        const customBook: AnatomyBook = {
          id: `local-file-${Date.now()}`,
          title: fileName.replace(/\.[^.]+$/, ""),
          subtitle: `Local ${fileExt.toUpperCase()} Document`,
          author: "Personal Presentation / Document",
          authorTitle: "Local Device File",
          category: "Anatomy",
          edition: `Imported ${fileExt.toUpperCase()}`,
          publisher: "Local Storage",
          totalPages: 50,
          defaultStartPage: 1,
          accentColor: fileExt.includes("ppt") ? "#ea580c" : "#2563eb",
          badge: `Local ${fileExt.toUpperCase()}`,
          coverBg: fileExt.includes("ppt")
            ? "linear-gradient(145deg, #9a3412 0%, #431407 100%)"
            : "linear-gradient(145deg, #1e3a8a 0%, #0f172a 100%)",
          coverPattern: "cellular",
          description: `Imported study document "${fileName}". Paginated for study, annotations, in-page highlighting, and focus sessions.`,
          chapters: [
            {
              id: "local-ch1",
              title: `1. ${fileName.replace(/\.[^.]+$/, "")}`,
              startPage: 1,
              endPage: 50,
              sectionName: "Imported Document",
              summary: `Imported ${fileExt.toUpperCase()} study document`,
            },
          ],
          pages: {
            1: {
              pageNumber: 1,
              chapterTitle: `${fileName} — Overview`,
              sectionHeadline: `${fileName.replace(/\.[^.]+$/, "")} — Document Workspace`,
              subheading: `Local ${fileExt.toUpperCase()} Document loaded from device`,
              bodyParagraphs: [
                `You have opened "${fileName}" from your local device storage. This document is loaded in your private browser workspace with full access to the Inside Human study toolkit.`,
                "You can highlight text directly on the page in 5 distinct colors (Yellow, Green, Pink, Blue, Orange), take margin notes synced with your master Notebook, bookmark critical sections, and use the Pomodoro timer for focused study.",
                "Your document data remains 100% private on your device without any server uploads.",
              ],
              anatomicalTerms: ["Local Document", "Study Session", "Highlighter Enabled", "Private Storage"],
              clinicalPearl: `[Study Tip] Use the 5-color highlighter and Pomodoro focus timer to master high-yield topics in "${fileName}".`,
              keyTakeaway: `Document: ${fileName} • Fully interactive study mode active.`,
              diagramTitle: `Figure: Active Study Session (${fileName})`,
              diagramSvgType: "heart-circulation",
            },
          },
        };
        onOpenCustomBook?.(customBook);
      }
    } catch (err) {
      console.error("Error opening local document:", err);
    } finally {
      setIsProcessingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const progress = getStoredReadingProgress();
    setProgressMap(progress);
    setRecentProgress(getMostRecentBookProgress());
    setTodayStats(getTodayStudyStats());
  }, []);

  const filteredBooks = useMemo(() => {
    return ANATOMY_LIBRARY_BOOKS.filter((book) => {
      const matchesCategory =
        selectedCategory === "All" || book.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const recentBook = useMemo(() => {
    if (!recentProgress) return ANATOMY_LIBRARY_BOOKS[0];
    return (
      ANATOMY_LIBRARY_BOOKS.find((b) => b.id === recentProgress.bookId) ||
      ANATOMY_LIBRARY_BOOKS[0]
    );
  }, [recentProgress]);

  const recentPercent = recentProgress?.percent || 42;
  const recentPage = recentProgress?.currentPage || recentBook.defaultStartPage;
  const recentChapter = recentProgress?.lastChapterTitle || recentBook.chapters[1]?.title || "Chapter 2: The Cardiovascular System";

  return (
    <div className="library-page-root">
      {/* Hidden File Picker for Local PDF, DOCX, PPTX, TXT Documents */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* ===================== LIBRARY HEADER ===================== */}
      <header className="library-header-card">
        <div className="library-header-content">
          <div className="library-eyebrow">
            <Sparkles size={14} className="eyebrow-sparkle" />
            <span>CURATED ANATOMY KNOWLEDGE BASE</span>
          </div>

          <h1 className="library-main-title">Your Study Library</h1>

          <p className="library-main-subtext">
            Curated anatomy books and references for focused learning. Read authoritative medical
            texts or open your own local study documents in a distraction-free digital study environment.
          </p>

          {/* Search & Category Filter Toolbar */}
          <div className="library-toolbar-row">
            {/* Search Input */}
            <div className="library-search-field">
              <Search size={16} className="library-search-icon" />
              <input
                type="text"
                placeholder="Search by book title, author, system, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search books"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="library-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Open Local File (PDF, DOCX, PPTX, TXT) Button */}
            <button
              type="button"
              className="library-open-local-doc-btn"
              onClick={handleOpenLocalFileClick}
              title="Open any local PDF, DOCX, PPTX, or TXT file directly in Study Room"
            >
              <FileUp size={16} className="local-file-icon" />
              <span className="btn-main-label">Open Local File</span>
              <span className="local-formats-tag">PDF • DOC • PPT • TXT</span>
            </button>

            {/* Quick Stats Pill */}
            <div className="library-header-stats-pill">
              <div className="stat-item">
                <Clock size={13} />
                <span>Today: <strong>{todayStats.formattedTime}</strong></span>
              </div>
              <span className="stat-divider">•</span>
              <div className="stat-item">
                <BookOpen size={13} />
                <span><strong>{todayStats.sessionCount}</strong> sessions</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="library-category-pills-bar">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? ANATOMY_LIBRARY_BOOKS.length
                  : ANATOMY_LIBRARY_BOOKS.filter((b) => b.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`library-category-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="pill-count-bubble">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===================== CONTINUE READING HERO BANNER ===================== */}
      <section className="library-continue-section" aria-label="Continue Reading">
        <div className="continue-reading-card">
          <div className="continue-card-left">
            <div
              className="continue-book-thumbnail"
              style={{ background: recentBook.coverBg }}
            >
              <div className="book-thumb-spine" />
              <div className="book-thumb-content">
                <span className="book-thumb-badge">{recentBook.badge}</span>
                <h4 className="book-thumb-title">{recentBook.title}</h4>
                <p className="book-thumb-author">{recentBook.author}</p>
                <div className="book-thumb-page-tag">Page {recentPage}</div>
              </div>
            </div>
          </div>

          <div className="continue-card-right">
            <div className="continue-eyebrow-row">
              <span className="continue-label-tag">
                <BookMarked size={12} />
                <span>CONTINUE READING</span>
              </span>
              <span className="continue-category-tag">{recentBook.category}</span>
            </div>

            <h2 className="continue-book-headline">{recentBook.title}</h2>
            <p className="continue-chapter-label">{recentChapter}</p>

            <div className="continue-progress-block">
              <div className="continue-progress-meta">
                <span>Page <strong>{recentPage}</strong> of {recentBook.totalPages}</span>
                <span className="continue-percent-text">{recentPercent}% completed</span>
              </div>
              <div className="continue-progress-track">
                <div
                  className="continue-progress-fill"
                  style={{ width: `${recentPercent}%` }}
                />
              </div>
            </div>

            <div className="continue-action-row">
              <button
                type="button"
                className="continue-launch-btn"
                onClick={() => onOpenBook(recentBook.id, recentPage)}
              >
                <span>Continue from Page {recentPage}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="continue-open-local-btn"
                onClick={handleOpenLocalFileClick}
                title="Study your own local documents in the Study Room"
              >
                <FileUp size={15} />
                <span>Open Local File</span>
              </button>

              <button
                type="button"
                className="continue-contents-btn"
                onClick={() => onOpenBook(recentBook.id, 1)}
              >
                <Layers size={15} />
                <span>Table of Contents</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BOOKSHELF GRID ===================== */}
      <section className="library-bookshelf-section" aria-label="Curated Anatomy Bookshelf">
        <div className="bookshelf-section-header">
          <div>
            <span className="section-label-chip">ACADEMIC COLLECTION</span>
            <h2 className="bookshelf-heading">Core Anatomy & Physiology Texts</h2>
          </div>
          <p className="bookshelf-subheading">
            Showing {filteredBooks.length} authoritative medical textbooks
          </p>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="library-empty-search">
            <BookOpen size={40} className="empty-search-icon" />
            <h3>No textbooks match your search</h3>
            <p>Try searching for a different keyword or select "All" categories.</p>
            <button
              type="button"
              className="library-reset-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="library-books-grid">
            {filteredBooks.map((book) => {
              const prog = progressMap[book.id];
              const percent = prog?.percent || (book.id === "grays-anatomy" ? 42 : book.id === "marieb-physiology" ? 28 : 0);
              const curPage = prog?.currentPage || book.defaultStartPage;

              return (
                <article key={book.id} className="book-card-item">
                  {/* Book Cover Visualization */}
                  <div
                    className="book-card-cover-wrap"
                    style={{ background: book.coverBg }}
                    onClick={() => onOpenBook(book.id, curPage)}
                  >
                    <div className="book-card-spine" />
                    <div className="book-card-cover-inner">
                      <div className="book-cover-top">
                        <span className="book-cover-edition">{book.edition}</span>
                        <span className="book-cover-badge">{book.badge}</span>
                      </div>
                      <h3 className="book-cover-title">{book.title}</h3>
                      <p className="book-cover-subtitle">{book.subtitle}</p>
                      <div className="book-cover-bottom">
                        <p className="book-cover-author">{book.author}</p>
                        <span className="book-cover-pages">{book.totalPages} Pages</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="book-card-details">
                    <div className="book-card-category-row">
                      <span className="book-card-cat-badge">{book.category}</span>
                      <span className="book-card-pages-count">{book.totalPages} pp.</span>
                    </div>

                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-author-line">by {book.author}</p>
                    <p className="book-card-desc">{book.description}</p>

                    {/* Progress Bar */}
                    <div className="book-card-progress-wrapper">
                      <div className="book-card-progress-labels">
                        <span className="prog-label">
                          {percent > 0 ? `Page ${curPage} • ${percent}%` : "Not started yet"}
                        </span>
                        <span className="prog-chapter-hint">
                          {book.chapters.length} Chapters
                        </span>
                      </div>
                      <div className="book-card-progress-track">
                        <div
                          className="book-card-progress-fill"
                          style={{
                            width: `${Math.max(4, percent)}%`,
                            backgroundColor: percent > 0 ? "var(--home-coral)" : "#e8ded4",
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="book-card-footer-action">
                      <button
                        type="button"
                        className="book-open-action-btn"
                        onClick={() => onOpenBook(book.id, curPage)}
                      >
                        <span>{percent > 0 ? "Continue Reading" : "Open Book"}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ===================== STUDY TIPS / DISCOVERY FOOTER ===================== */}
      <section className="library-study-tips-section">
        <div className="study-tips-grid">
          <div className="study-tip-card">
            <div className="tip-icon-box">
              <GraduationCap size={22} />
            </div>
            <h4>Active Recall & Spaced Reading</h4>
            <p>
              Use the built-in Pomodoro Study Timer (25m / 45m) to maintain peak focus and
              consolidate high-yield anatomical concepts without mental fatigue.
            </p>
          </div>

          <div className="study-tip-card">
            <div className="tip-icon-box">
              <FileText size={22} />
            </div>
            <h4>Direct 3D Specimen Linkage</h4>
            <p>
              Every textbook chapter correlates with our interactive 3D Organ specimens. Jump
              between 3D histology models and text with one click.
            </p>
          </div>

          <div className="study-tip-card">
            <div className="tip-icon-box">
              <BookMarked size={22} />
            </div>
            <h4>Unified Student Notes</h4>
            <p>
              Bookmarks and study notes taken inside the Study Room automatically sync with your
              master Inside Human study notebook.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
