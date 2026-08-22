"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  FileText,
  Highlighter,
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  ANATOMY_LIBRARY_BOOKS,
  getBookPageContent,
  type AnatomyBook,
  type BookChapter,
  type BookPageContent,
} from "../lib/library-data";
import {
  getStoredBookmarks,
  saveBookProgress,
  toggleStoredBookmark,
  recordStudySession,
  getTodayStudyStats,
  getStoredHighlights,
  saveStoredHighlight,
  removeStoredHighlight,
  type BookBookmark,
  type PageHighlight,
} from "../lib/library-storage";
import {
  getStoredNotes,
  saveStoredNotes,
  type AnatomyNote,
} from "../lib/notes-storage";
import type { UiDictionary } from "../i18n/types";

interface StudyRoomProps {
  bookId: string;
  customBook?: AnatomyBook;
  initialPage?: number;
  t: UiDictionary;
  onBackToLibrary: () => void;
  onNavigateTab: (tab: "home" | "explore" | "lessons" | "notes") => void;
}

type SidebarTab = "contents" | "bookmarks" | "notes";
export type HighlightColor = "yellow" | "green" | "pink" | "blue" | "orange";

export const HIGHLIGHT_COLOR_CONFIG: Record<
  HighlightColor,
  { label: string; name: string; bg: string; darkBg: string; text: string; preview: string }
> = {
  yellow: {
    label: "Yellow",
    name: "yellow",
    bg: "#fef08a",
    darkBg: "rgba(253, 224, 71, 0.45)",
    text: "#1c1917",
    preview: "#facc15",
  },
  green: {
    label: "Green",
    name: "green",
    bg: "#86efac",
    darkBg: "rgba(74, 222, 128, 0.45)",
    text: "#052e16",
    preview: "#4ade80",
  },
  pink: {
    label: "Pink",
    name: "pink",
    bg: "#f472b6",
    darkBg: "rgba(244, 114, 182, 0.45)",
    text: "#500724",
    preview: "#ec4899",
  },
  blue: {
    label: "Blue",
    name: "blue",
    bg: "#7dd3fc",
    darkBg: "rgba(56, 189, 248, 0.45)",
    text: "#082f49",
    preview: "#0284c7",
  },
  orange: {
    label: "Orange",
    name: "orange",
    bg: "#fb923c",
    darkBg: "rgba(251, 146, 60, 0.45)",
    text: "#431407",
    preview: "#ea580c",
  },
};

const COLOR_KEYS: HighlightColor[] = ["yellow", "green", "pink", "blue", "orange"];

export function StudyRoom({
  bookId,
  customBook,
  initialPage,
  t,
  onBackToLibrary,
  onNavigateTab,
}: StudyRoomProps) {
  const book = useMemo(() => {
    if (customBook) return customBook;
    return (
      ANATOMY_LIBRARY_BOOKS.find((b) => b.id === bookId) ||
      ANATOMY_LIBRARY_BOOKS[0]
    );
  }, [bookId, customBook]);

  // Synchronized pagination state
  const [currentPage, setCurrentPage] = useState<number>(
    initialPage && initialPage > 0 ? initialPage : book.defaultStartPage,
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [bookmarksList, setBookmarksList] = useState<BookBookmark[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("contents");
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightToolsOpen, setIsRightToolsOpen] = useState<boolean>(true);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);
  const [readerViewMode, setReaderViewMode] = useState<"pdf" | "study">(
    book.pdfUrl ? "pdf" : "study",
  );

  // Focus & Theme Modes
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Direct In-Page Highlighting State
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<HighlightColor>("yellow");
  const [pageHighlights, setPageHighlights] = useState<PageHighlight[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [activeHighlightPopover, setActiveHighlightPopover] = useState<{
    id: string;
    top: number;
    left: number;
  } | null>(null);

  // Live Real-Time Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  // Study Timer state
  const [timerMinutesPreset, setTimerMinutesPreset] = useState<number>(45);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [sessionCompletedDuration, setSessionCompletedDuration] = useState<number>(45);

  // Study Stats
  const [todayStats, setTodayStats] = useState({
    formattedTime: "0m",
    sessionCount: 0,
    pagesRead: 0,
  });

  // Notes state
  const [bookNotes, setBookNotes] = useState<AnatomyNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll canvas ref to reset scroll to top on page change
  const readerScrollCanvasRef = useRef<HTMLDivElement>(null);
  const textbookPageRef = useRef<HTMLDivElement>(null);

  // Unified page navigation function with scroll reset
  const goToPage = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(1, Math.min(book.totalPages, targetPage));
      if (clamped !== currentPage) {
        setCurrentPage(clamped);
        if (readerScrollCanvasRef.current) {
          readerScrollCanvasRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },
    [book.totalPages, currentPage],
  );

  // 1. Real-time Clock interval (updates every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
      setCurrentDateStr(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load Bookmarks & Notes on mount / book change
  useEffect(() => {
    const bookmarks = getStoredBookmarks(book.id);
    setBookmarksList(bookmarks);
    setIsBookmarked(bookmarks.some((b) => b.page === currentPage));

    const allNotes = getStoredNotes();
    const filteredNotes = allNotes.filter(
      (n) => n.tags.includes(book.title) || n.content.includes(book.title),
    );
    setBookNotes(filteredNotes);
    setTodayStats(getTodayStudyStats());
  }, [book.id, book.title, currentPage]);

  // 3. Save Reading Progress & load Highlights whenever currentPage changes
  useEffect(() => {
    const activeChapter =
      book.chapters.find(
        (c) => currentPage >= c.startPage && currentPage <= c.endPage,
      ) || book.chapters[0];

    saveBookProgress(book.id, currentPage, book.totalPages, activeChapter.title);

    const bookmarks = getStoredBookmarks(book.id);
    setIsBookmarked(bookmarks.some((b) => b.page === currentPage));

    // Load persistent highlights for this exact page
    const storedHls = getStoredHighlights(book.id, currentPage);
    setPageHighlights(storedHls);

    // Reset selection menus
    setFloatingMenuPos(null);
    setSelectedText("");
    setActiveHighlightPopover(null);

    // Scroll reader to top
    if (readerScrollCanvasRef.current) {
      readerScrollCanvasRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [book, currentPage]);

  // 4. Study Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            const durationMins = timerMinutesPreset;
            setSessionCompletedDuration(durationMins);
            setShowCompletionModal(true);

            recordStudySession({
              bookId: book.id,
              bookTitle: book.title,
              chapterTitle: currentChapter.title,
              startPage: Math.max(1, currentPage - 5),
              endPage: currentPage,
              durationMinutes: durationMins,
              startTime: sessionStartTime || new Date().toISOString(),
            });

            setTodayStats(getTodayStudyStats());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, timerMinutesPreset, book, currentPage, sessionStartTime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Timer Controls
  const handleStartTimer = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    setIsTimerRunning(true);
    showToast("Study session started. Stay focused!");
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = (presetMinutes?: number) => {
    setIsTimerRunning(false);
    const mins = presetMinutes !== undefined ? presetMinutes : timerMinutesPreset;
    setTimerMinutesPreset(mins);
    setTimerSecondsLeft(mins * 60);
    setSessionStartTime(null);
  };

  // Current Chapter lookup
  const currentChapter: BookChapter = useMemo(() => {
    return (
      book.chapters.find(
        (c) => currentPage >= c.startPage && currentPage <= c.endPage,
      ) || book.chapters[0]
    );
  }, [book, currentPage]);

  // Dynamic Page Content: Strictly computed from book + currentPage
  const currentPageContent: BookPageContent = useMemo(() => {
    return getBookPageContent(book, currentPage);
  }, [book, currentPage]);

  // Bookmark Toggle
  const handleToggleBookmark = () => {
    const activeChapter = currentChapter;
    const headline = currentPageContent?.sectionHeadline || `Page ${currentPage}`;
    const nowState = toggleStoredBookmark(
      book.id,
      book.title,
      currentPage,
      activeChapter.title,
      headline,
    );
    setIsBookmarked(nowState);
    setBookmarksList(getStoredBookmarks(book.id));
    showToast(nowState ? `Page ${currentPage} Bookmarked ✓` : `Bookmark Removed`);
  };

  // =========================================================================
  // DIRECT IN-PAGE HIGHLIGHTER (PHYSICAL BOOK FEEL)
  // =========================================================================

  // Detect mouse selection on book page
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setFloatingMenuPos(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setFloatingMenuPos(null);
      setSelectedText("");
      return;
    }

    if (
      textbookPageRef.current &&
      textbookPageRef.current.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);

      setFloatingMenuPos({
        top: Math.max(10, rect.top - 54),
        left: Math.max(20, rect.left + rect.width / 2),
      });
      setActiveHighlightPopover(null);
    }
  }, []);

  // Apply highlight directly to the selected text with chosen color
  const handleApplyHighlight = (colorToUse: HighlightColor) => {
    if (!selectedText) return;
    setSelectedHighlightColor(colorToUse);

    const saved = saveStoredHighlight({
      bookId: book.id,
      pageNumber: currentPage,
      text: selectedText,
      color: colorToUse,
    });

    setPageHighlights((prev) => {
      const filtered = prev.filter(
        (h) => !(h.text.toLowerCase() === saved.text.toLowerCase() && h.pageNumber === saved.pageNumber),
      );
      return [...filtered, saved];
    });

    // Clear native selection so the custom highlight is immediately vibrant
    window.getSelection()?.removeAllRanges();
    setFloatingMenuPos(null);
    setSelectedText("");
    showToast(`Marked with ${HIGHLIGHT_COLOR_CONFIG[colorToUse].label} highlighter ✓`);
  };

  // Remove existing highlight
  const handleRemoveHighlight = (highlightId: string) => {
    removeStoredHighlight(highlightId);
    setPageHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    setActiveHighlightPopover(null);
    showToast("Highlight removed");
  };

  // Change color of existing highlight
  const handleChangeHighlightColor = (highlightId: string, newColor: HighlightColor) => {
    const existing = pageHighlights.find((h) => h.id === highlightId);
    if (!existing) return;

    removeStoredHighlight(highlightId);
    const updated = saveStoredHighlight({
      bookId: book.id,
      pageNumber: currentPage,
      text: existing.text,
      color: newColor,
    });

    setPageHighlights((prev) =>
      prev.map((h) => (h.id === highlightId ? updated : h)),
    );
    setActiveHighlightPopover(null);
    showToast(`Color changed to ${HIGHLIGHT_COLOR_CONFIG[newColor].label}`);
  };

  // Quick note from selection
  const handleCreateNoteFromSelection = () => {
    if (!selectedText) return;
    setNewNoteTitle(`${book.title} (Page ${currentPage})`);
    setNewNoteContent(`"${selectedText}"\n\n— Margin Note from Page ${currentPage}`);
    setIsAddingNote(true);
    setActiveSidebarTab("notes");
    setIsLeftSidebarOpen(true);
    window.getSelection()?.removeAllRanges();
    setFloatingMenuPos(null);
    setSelectedText("");
  };

  // Add Note Handler
  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    const title = newNoteTitle.trim() || `${book.title} (Page ${currentPage})`;
    const content = newNoteContent.trim();

    const newNote: AnatomyNote = {
      id: `note-book-${book.id}-${Date.now()}`,
      title,
      content,
      organId: "heart",
      organName: book.title,
      systemName: currentChapter.title,
      tags: [book.title, currentChapter.title, `Page ${currentPage}`, "Study Room"],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentAll = getStoredNotes();
    const updated = [newNote, ...currentAll];
    saveStoredNotes(updated);
    setBookNotes((prev) => [newNote, ...prev]);

    setNewNoteTitle("");
    setNewNoteContent("");
    setIsAddingNote(false);
    showToast("Study note saved and synced with Notes section ✓");
  };

  // Robust In-Page Text Highlight Renderer with exact non-overlapping spans
  const renderHighlightedText = useCallback(
    (rawText: string) => {
      if (!pageHighlights || pageHighlights.length === 0 || !rawText) {
        return rawText;
      }

      // Filter highlights that exist in this text
      const pageHls = pageHighlights.filter(
        (h) => h.text && h.text.trim().length > 0,
      );
      if (pageHls.length === 0) return rawText;

      // Sort by length descending to match longer phrases first
      const sortedHls = [...pageHls].sort((a, b) => b.text.length - a.text.length);

      type Span = { start: number; end: number; hl: PageHighlight };
      const matchedSpans: Span[] = [];
      const lowerText = rawText.toLowerCase();

      for (const hl of sortedHls) {
        const lowerHl = hl.text.toLowerCase().trim();
        let searchFrom = 0;

        while (searchFrom < lowerText.length) {
          const foundIdx = lowerText.indexOf(lowerHl, searchFrom);
          if (foundIdx === -1) break;

          const endIdx = foundIdx + lowerHl.length;
          const overlaps = matchedSpans.some(
            (s) => Math.max(foundIdx, s.start) < Math.min(endIdx, s.end),
          );

          if (!overlaps) {
            matchedSpans.push({ start: foundIdx, end: endIdx, hl });
          }
          searchFrom = endIdx;
        }
      }

      if (matchedSpans.length === 0) return rawText;

      matchedSpans.sort((a, b) => a.start - b.start);

      const nodes: React.ReactNode[] = [];
      let cursor = 0;

      for (let i = 0; i < matchedSpans.length; i++) {
        const span = matchedSpans[i];

        if (span.start > cursor) {
          nodes.push(rawText.substring(cursor, span.start));
        }

        const highlightedString = rawText.substring(span.start, span.end);
        const col = (span.hl.color as HighlightColor) || "yellow";
        const conf = HIGHLIGHT_COLOR_CONFIG[col] || HIGHLIGHT_COLOR_CONFIG.yellow;
        const bg = isNightMode ? conf.darkBg : conf.bg;
        const textColor = isNightMode ? "#f5ede4" : conf.text;

        nodes.push(
          <mark
            key={`hl-${span.hl.id}-${span.start}-${i}`}
            className={`book-physical-highlight color-${col}`}
            style={{
              backgroundColor: bg,
              color: textColor,
              borderRadius: "3px",
              padding: "1px 3px",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              cursor: "pointer",
              display: "inline",
              boxShadow: isNightMode
                ? "0 0 0 1px rgba(255,255,255,0.12)"
                : "0 0 0 1px rgba(0,0,0,0.06)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setActiveHighlightPopover({
                id: span.hl.id,
                top: Math.max(10, rect.top - 46),
                left: rect.left + rect.width / 2,
              });
              setFloatingMenuPos(null);
            }}
            title={`Highlighted in ${conf.label} (click to edit/remove)`}
          >
            {highlightedString}
          </mark>,
        );

        cursor = span.end;
      }

      if (cursor < rawText.length) {
        nodes.push(rawText.substring(cursor));
      }

      return <>{nodes}</>;
    },
    [pageHighlights, isNightMode],
  );

  // Format Timer Seconds
  const timerMinsFormatted = Math.floor(timerSecondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const timerSecsFormatted = (timerSecondsLeft % 60).toString().padStart(2, "0");
  const timerPercent =
    ((timerMinutesPreset * 60 - timerSecondsLeft) / (timerMinutesPreset * 60)) * 100;

  return (
    <div
      className={`study-room-container ${isNightMode ? "study-theme-night" : "study-theme-light"} ${
        isFocusMode ? "study-focus-mode" : ""
      }`}
      onClick={() => {
        setActiveHighlightPopover(null);
      }}
    >
      {/* Toast notification */}
      {toastMessage && <div className="study-toast">{toastMessage}</div>}

      {/* =========================================================================
          1. FLOATING PHYSICAL HIGHLIGHTER BAR (ON TEXT SELECTION)
          ========================================================================= */}
      {floatingMenuPos && (
        <div
          className="floating-book-highlighter-bar"
          style={{
            position: "fixed",
            top: `${floatingMenuPos.top}px`,
            left: `${floatingMenuPos.left}px`,
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="hl-marker-label">Highlight:</span>

          {/* 5 Real Physical Marker Color Dots */}
          <div className="hl-marker-dots-group">
            {COLOR_KEYS.map((col) => (
              <button
                key={col}
                type="button"
                className={`hl-marker-dot ${selectedHighlightColor === col ? "selected-pen" : ""}`}
                style={{ backgroundColor: HIGHLIGHT_COLOR_CONFIG[col].preview }}
                onClick={() => handleApplyHighlight(col)}
                title={`Highlight in ${HIGHLIGHT_COLOR_CONFIG[col].label}`}
              />
            ))}
          </div>

          <div className="hl-bar-divider" />

          {/* Quick Note from Selection Button */}
          <button
            type="button"
            className="hl-note-action-btn"
            onClick={handleCreateNoteFromSelection}
            title="Create study note from selection"
          >
            <NotebookPen size={13} />
            <span>Add Note</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          2. CLICKED HIGHLIGHT POPOVER (CHANGE COLOR OR REMOVE)
          ========================================================================= */}
      {activeHighlightPopover && (
        <div
          className="highlight-edit-popover"
          style={{
            position: "fixed",
            top: `${activeHighlightPopover.top}px`,
            left: `${activeHighlightPopover.left}px`,
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hl-popover-colors">
            {COLOR_KEYS.map((col) => (
              <button
                key={col}
                type="button"
                className="hl-popover-color-dot"
                style={{ backgroundColor: HIGHLIGHT_COLOR_CONFIG[col].preview }}
                onClick={() => handleChangeHighlightColor(activeHighlightPopover.id, col)}
                title={`Change color to ${HIGHLIGHT_COLOR_CONFIG[col].label}`}
              />
            ))}
          </div>

          <div className="hl-popover-divider" />

          <button
            type="button"
            className="hl-remove-btn"
            onClick={() => handleRemoveHighlight(activeHighlightPopover.id)}
            title="Remove this highlight"
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* ===================== STUDY ROOM TOP BAR ===================== */}
      {!isFocusMode && (
        <header className="study-topbar">
          <div className="study-topbar-left">
            <button
              type="button"
              className="study-back-btn"
              onClick={onBackToLibrary}
              title="Return to Digital Bookshelf"
            >
              <ArrowLeft size={16} />
              <span>Library</span>
            </button>

            <span className="study-topbar-divider">/</span>

            <div className="study-book-meta">
              <strong className="study-book-title">{book.title}</strong>
              <span className="study-chapter-pill">{currentChapter.title}</span>
            </div>
          </div>

          <div className="study-topbar-center">
            {/* Quick Page Jump Input */}
            <div className="study-page-jumper">
              <button
                type="button"
                className="page-nav-arrow"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="page-input-wrap">
                <span>Page</span>
                <input
                  type="number"
                  min={1}
                  max={book.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      goToPage(val);
                    }
                  }}
                  className="page-number-input"
                />
                <span>of {book.totalPages}</span>
              </div>

              <button
                type="button"
                className="page-nav-arrow"
                disabled={currentPage >= book.totalPages}
                onClick={() => goToPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="study-topbar-right">
            {/* Live Real-Time Clock */}
            <div className="study-realtime-clock" title="Current Time">
              <Clock size={14} className="clock-icon" />
              <span>{currentTimeStr}</span>
            </div>

            {/* Night Mode Switcher */}
            <button
              type="button"
              className={`study-control-icon-btn ${isNightMode ? "active" : ""}`}
              onClick={() => setIsNightMode(!isNightMode)}
              title={isNightMode ? "Switch to Light Mode" : "Switch to Night Mode"}
              aria-label="Toggle Night Reading Mode"
            >
              {isNightMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Focus Mode Button */}
            <button
              type="button"
              className="study-focus-toggle-btn"
              onClick={() => setIsFocusMode(true)}
              title="Enter distraction-free Focus Mode"
            >
              <Eye size={15} />
              <span>Focus Mode</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              className="study-control-icon-btn"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                  setIsFullscreen(true);
                } else {
                  document.exitFullscreen().catch(() => {});
                  setIsFullscreen(false);
                }
              }}
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </header>
      )}

      {/* Floating Focus Mode Exit HUD */}
      {isFocusMode && (
        <div className="focus-mode-floating-hud">
          <div className="focus-hud-clock">
            <Clock size={13} />
            <span>{currentTimeStr}</span>
          </div>

          <div className="focus-hud-timer">
            <span className="timer-dot" />
            <span>
              {timerMinsFormatted}:{timerSecsFormatted}
            </span>
          </div>

          <div className="focus-hud-page">
            <span>Page {currentPage} / {book.totalPages}</span>
          </div>

          <button
            type="button"
            className="focus-hud-btn"
            onClick={() => setIsNightMode(!isNightMode)}
            title="Toggle theme"
          >
            {isNightMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            type="button"
            className="focus-hud-exit-btn"
            onClick={() => setIsFocusMode(false)}
          >
            <X size={14} />
            <span>Exit Focus</span>
          </button>
        </div>
      )}

      {/* ===================== 3-COLUMN STUDY ROOM MAIN LAYOUT ===================== */}
      <div className="study-room-layout-grid">
        {/* ==================== LEFT SIDEBAR: CHAPTERS / BOOKMARKS / NOTES ==================== */}
        {!isFocusMode && (
          <aside
            className={`study-left-sidebar ${isLeftSidebarOpen ? "open" : "collapsed"}`}
            aria-label="Book Navigation & Contents"
          >
            {isLeftSidebarOpen ? (
              <>
                <div className="sidebar-collapse-toggle-bar">
                  <span className="sidebar-heading-title">
                    {activeSidebarTab === "contents" && "Book Contents"}
                    {activeSidebarTab === "bookmarks" && `Bookmarks (${bookmarksList.length})`}
                    {activeSidebarTab === "notes" && `Study Notes (${bookNotes.length})`}
                  </span>
                  <button
                    type="button"
                    className="panel-collapse-trigger-btn"
                    onClick={() => setIsLeftSidebarOpen(false)}
                    title="Collapse Chapters Panel"
                    aria-label="Collapse Chapters Panel"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                {/* Clean Sidebar Tabs */}
                <div className="sidebar-tab-pills">
                  <button
                    type="button"
                    className={`sidebar-tab-pill ${activeSidebarTab === "contents" ? "active" : ""}`}
                    onClick={() => setActiveSidebarTab("contents")}
                  >
                    <Layers size={14} />
                    <span>Chapters</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-pill ${activeSidebarTab === "bookmarks" ? "active" : ""}`}
                    onClick={() => setActiveSidebarTab("bookmarks")}
                  >
                    <Bookmark size={14} />
                    <span>Bookmarks</span>
                  </button>
                  <button
                    type="button"
                    className={`sidebar-tab-pill ${activeSidebarTab === "notes" ? "active" : ""}`}
                    onClick={() => setActiveSidebarTab("notes")}
                  >
                    <NotebookPen size={14} />
                    <span>Notes</span>
                  </button>
                </div>

                {/* Tab 1: Chapters Table of Contents */}
                {activeSidebarTab === "contents" && (
                  <div className="sidebar-tab-content scrollable">
                    <div className="chapters-list">
                      {book.chapters.map((ch) => {
                        const isCurrent =
                          currentPage >= ch.startPage && currentPage <= ch.endPage;
                        return (
                          <div
                            key={ch.id}
                            className={`chapter-item-row ${isCurrent ? "is-active-chapter" : ""}`}
                            onClick={() => goToPage(ch.startPage)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="chapter-item-top">
                              <span className="chapter-item-title">{ch.title}</span>
                              <span className="chapter-item-pages">
                                pp. {ch.startPage}–{ch.endPage}
                              </span>
                            </div>
                            <p className="chapter-item-summary">{ch.summary}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Bookmarks */}
                {activeSidebarTab === "bookmarks" && (
                  <div className="sidebar-tab-content scrollable">
                    {bookmarksList.length === 0 ? (
                      <div className="sidebar-empty-state">
                        <Bookmark size={28} className="empty-state-icon" />
                        <h4>No Bookmarks Saved</h4>
                        <p>Click the "♡ Bookmark" button in the reader toolbar to save key pages.</p>
                      </div>
                    ) : (
                      <div className="bookmarks-list">
                        {bookmarksList.map((bm) => (
                          <div
                            key={bm.id}
                            className="bookmark-item-card"
                            onClick={() => goToPage(bm.page)}
                          >
                            <div className="bm-card-header">
                              <span className="bm-page-badge">Page {bm.page}</span>
                              <span className="bm-chapter-tag">{bm.chapterTitle}</span>
                            </div>
                            <p className="bm-headline">{bm.headline}</p>
                            <div className="bm-footer">
                              <span className="bm-time">
                                {new Date(bm.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                className="bm-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStoredBookmark(
                                    bm.bookId,
                                    bm.bookTitle,
                                    bm.page,
                                    bm.chapterTitle,
                                    bm.headline,
                                  );
                                  setBookmarksList(getStoredBookmarks(book.id));
                                  if (bm.page === currentPage) setIsBookmarked(false);
                                }}
                                title="Remove bookmark"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Book-Linked Notes */}
                {activeSidebarTab === "notes" && (
                  <div className="sidebar-tab-content scrollable">
                    <div className="sidebar-notes-action-row">
                      <button
                        type="button"
                        className="sidebar-add-note-btn"
                        onClick={() => setIsAddingNote(true)}
                      >
                        <Plus size={14} />
                        <span>Add Note on Page {currentPage}</span>
                      </button>
                    </div>

                    {isAddingNote && (
                      <div className="sidebar-note-create-card">
                        <input
                          type="text"
                          placeholder="Note title / concept..."
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="note-create-title-input"
                        />
                        <textarea
                          placeholder="Write high-yield study notes, mnemonics, or dissection tips..."
                          rows={4}
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="note-create-textarea"
                        />
                        <div className="note-create-actions">
                          <button
                            type="button"
                            className="note-cancel-btn"
                            onClick={() => setIsAddingNote(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="note-save-btn"
                            onClick={handleSaveNote}
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {bookNotes.length === 0 ? (
                      <div className="sidebar-empty-state">
                        <NotebookPen size={28} className="empty-state-icon" />
                        <h4>No Notes on this Book</h4>
                        <p>Write notes while studying. They will automatically sync with your Notebook!</p>
                      </div>
                    ) : (
                      <div className="sidebar-notes-list">
                        {bookNotes.map((note) => (
                          <div key={note.id} className="sidebar-note-card">
                            <div className="sidebar-note-header">
                              <strong>{note.title}</strong>
                              <span className="sidebar-note-tag">
                                {note.tags[2] || "Study Note"}
                              </span>
                            </div>
                            <p className="sidebar-note-body">{note.content}</p>
                            <div className="sidebar-note-footer">
                              <small>{new Date(note.createdAt).toLocaleDateString()}</small>
                              <button
                                type="button"
                                className="sidebar-note-view-btn"
                                onClick={() => onNavigateTab("notes")}
                              >
                                View in Notebook →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Collapsed Left Rail with Expand Control & Quick Tabs */
              <div className="collapsed-rail-inner">
                <button
                  type="button"
                  className="panel-expand-trigger-btn"
                  onClick={() => setIsLeftSidebarOpen(true)}
                  title="Expand Chapters Panel (Table of Contents & Bookmarks)"
                  aria-label="Expand Chapters Panel"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="collapsed-rail-divider" />

                <div className="collapsed-rail-icons-stack">
                  <button
                    type="button"
                    className={`collapsed-rail-icon-btn ${activeSidebarTab === "contents" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSidebarTab("contents");
                      setIsLeftSidebarOpen(true);
                    }}
                    title="Chapters (Table of Contents)"
                  >
                    <Layers size={16} />
                  </button>

                  <button
                    type="button"
                    className={`collapsed-rail-icon-btn ${activeSidebarTab === "bookmarks" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSidebarTab("bookmarks");
                      setIsLeftSidebarOpen(true);
                    }}
                    title={`Bookmarks (${bookmarksList.length})`}
                  >
                    <Bookmark size={16} />
                    {bookmarksList.length > 0 && (
                      <span className="rail-mini-badge">{bookmarksList.length}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`collapsed-rail-icon-btn ${activeSidebarTab === "notes" ? "active" : ""}`}
                    onClick={() => {
                      setActiveSidebarTab("notes");
                      setIsLeftSidebarOpen(true);
                    }}
                    title={`Study Notes (${bookNotes.length})`}
                  >
                    <NotebookPen size={16} />
                    {bookNotes.length > 0 && (
                      <span className="rail-mini-badge">{bookNotes.length}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ==================== CENTER: PDF / ANATOMY TEXTBOOK READER CANVAS ==================== */}
        <main className="study-center-reader" aria-label="Anatomy Textbook Reader">
          {/* Reader Sub-Toolbar */}
          <div className="reader-toolbar-strip">
            {/* Left: Previous / Next & Jumper */}
            <div className="reader-tool-group">
              <button
                type="button"
                className="reader-tool-btn"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft size={15} />
                <span>Prev</span>
              </button>

              <span className="reader-page-indicator">
                {currentPage} / {book.totalPages}
              </span>

              <button
                type="button"
                className="reader-tool-btn"
                disabled={currentPage >= book.totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Center: Zoom Controls */}
            <div className="reader-tool-group">
              <button
                type="button"
                className="reader-tool-btn icon-only"
                disabled={zoomLevel <= 70}
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                title="Zoom out"
              >
                <ZoomOut size={15} />
              </button>

              <span className="reader-zoom-level">{zoomLevel}%</span>

              <button
                type="button"
                className="reader-tool-btn icon-only"
                disabled={zoomLevel >= 150}
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                title="Zoom in"
              >
                <ZoomIn size={15} />
              </button>

              <button
                type="button"
                className="reader-tool-btn text-only"
                onClick={() => setZoomLevel(100)}
                title="Reset zoom"
              >
                Fit Page
              </button>
            </div>

            {/* View Mode Switcher for Uploaded PDF Books */}
            {book.pdfUrl && (
              <div className="reader-tool-group">
                <div className="pdf-view-mode-toggle-group">
                  <button
                    type="button"
                    className={`pdf-mode-pill ${readerViewMode === "pdf" ? "active" : ""}`}
                    onClick={() => setReaderViewMode("pdf")}
                    title="Exact original PDF as uploaded"
                  >
                    <FileText size={13} />
                    <span>Exact PDF</span>
                  </button>
                  <button
                    type="button"
                    className={`pdf-mode-pill ${readerViewMode === "study" ? "active" : ""}`}
                    onClick={() => setReaderViewMode("study")}
                    title="Interactive Study Reader with In-Page Highlighter"
                  >
                    <BookOpen size={13} />
                    <span>Study Notes View</span>
                  </button>
                </div>
              </div>
            )}

            {/* Right: Active Highlighter Color & Bookmark */}
            <div className="reader-tool-group">
              {/* Active Highlighter Pen Indicator */}
              <div className="active-marker-indicator-pill" title="Default Highlighter Color">
                <Highlighter size={14} style={{ color: HIGHLIGHT_COLOR_CONFIG[selectedHighlightColor].preview }} />
                <div className="marker-dots-compact">
                  {COLOR_KEYS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`marker-dot-mini ${selectedHighlightColor === c ? "active" : ""}`}
                      style={{ backgroundColor: HIGHLIGHT_COLOR_CONFIG[c].preview }}
                      onClick={() => {
                        setSelectedHighlightColor(c);
                        showToast(`Highlighter set to ${HIGHLIGHT_COLOR_CONFIG[c].label}`);
                      }}
                      title={`Select ${HIGHLIGHT_COLOR_CONFIG[c].label} Marker`}
                    />
                  ))}
                </div>
              </div>

              {/* Bookmark Button */}
              <button
                type="button"
                className={`reader-bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
                onClick={handleToggleBookmark}
                title={isBookmarked ? "Bookmarked ✓" : "Bookmark this page"}
              >
                <Bookmark
                  size={15}
                  fill={isBookmarked ? "var(--home-coral)" : "none"}
                  color={isBookmarked ? "var(--home-coral)" : "currentColor"}
                />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>
            </div>
          </div>

          {/* Reader Document Canvas (Exact PDF or Scalable Study Sheet) */}
          {book.pdfUrl && readerViewMode === "pdf" ? (
            <div className="exact-pdf-embedded-container">
              <iframe
                key={`pdf-frame-${currentPage}-${zoomLevel}`}
                src={`${book.pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                className="exact-pdf-iframe"
                title={`${book.title} (Page ${currentPage})`}
              />
            </div>
          ) : (
            <div className="reader-scroll-canvas" ref={readerScrollCanvasRef}>
              <div
                ref={textbookPageRef}
                onMouseUp={handleMouseUp}
                className="textbook-page-sheet"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              >
              {/* Header Running Head */}
              <div className="page-running-head">
                <span className="head-book-name">{book.title} • {book.edition}</span>
                <span className="head-chapter-name">{currentPageContent.chapterTitle}</span>
                <span className="head-page-num">Page {currentPageContent.pageNumber}</span>
              </div>

              {/* Chapter & Section Header */}
              <div className="page-editorial-header">
                <span className="page-chapter-label">{currentPageContent.chapterTitle}</span>
                <h1 className="page-section-title">
                  {renderHighlightedText(currentPageContent.sectionHeadline)}
                </h1>
                {currentPageContent.subheading && (
                  <p className="page-subheading">
                    {renderHighlightedText(currentPageContent.subheading)}
                  </p>
                )}
              </div>

              {/* Main Body Paragraphs with direct in-page physical marker highlights */}
              <div className="page-text-content">
                {currentPageContent.bodyParagraphs.map((para, idx) => (
                  <p key={`${currentPage}-${idx}`} className="academic-paragraph">
                    {renderHighlightedText(para)}
                  </p>
                ))}
              </div>

              {/* Anatomical Terminology Callout */}
              {currentPageContent.anatomicalTerms && (
                <div className="anatomical-terms-card">
                  <div className="terms-header">
                    <Sparkles size={14} className="terms-sparkle" />
                    <strong>Terminologia Anatomica (Official Latin Nomenclature)</strong>
                  </div>
                  <div className="terms-pills-row">
                    {currentPageContent.anatomicalTerms.map((term, i) => (
                      <span key={i} className="latin-term-pill">
                        {renderHighlightedText(term)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Anatomical Schematic Illustration Box */}
              <div className="page-diagram-box">
                <div className="diagram-header-bar">
                  <span className="diagram-title-text">{currentPageContent.diagramTitle}</span>
                  <button
                    type="button"
                    className="diagram-explore-3d-btn"
                    onClick={() => {
                      onNavigateTab("explore");
                    }}
                    title="Launch interactive 3D anatomy specimen"
                  >
                    <Compass size={14} />
                    <span>View in 3D Studio →</span>
                  </button>
                </div>

                {/* SVG Anatomical Diagram Visualization */}
                <div className="diagram-visual-art">
                  <svg
                    viewBox="0 0 600 240"
                    className="schematic-anatomy-svg"
                    role="img"
                    aria-label="Schematic Anatomical Cross-Section"
                  >
                    <defs>
                      <linearGradient id="artGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbd7cc" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f3b5a7" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="artGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e26d5c" />
                        <stop offset="100%" stopColor="#c25943" />
                      </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="580" height="220" rx="16" fill="rgba(255,255,255,0.7)" stroke="#ebd4c8" strokeWidth="1" />
                    
                    {/* Stylized vascular / organ pathway */}
                    <path
                      d="M 50 120 C 140 40, 220 200, 300 120 C 380 40, 460 200, 550 120"
                      fill="none"
                      stroke="url(#artGrad2)"
                      strokeWidth="4"
                      strokeDasharray="6 4"
                    />
                    
                    {/* Node 1 */}
                    <circle cx="140" cy="85" r="28" fill="url(#artGrad1)" stroke="#e26d5c" strokeWidth="2" />
                    <text x="140" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c2d12">Atrium</text>

                    {/* Center Chamber */}
                    <circle cx="300" cy="120" r="44" fill="#ffffff" stroke="#c25943" strokeWidth="3" />
                    <circle cx="300" cy="120" r="32" fill="url(#artGrad1)" />
                    <text x="300" y="124" textAnchor="middle" fontSize="12" fontWeight="700" fill="#431407">Ventricle</text>

                    {/* Node 3 */}
                    <circle cx="460" cy="155" r="28" fill="url(#artGrad1)" stroke="#e26d5c" strokeWidth="2" />
                    <text x="460" y="160" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c2d12">Aorta</text>

                    {/* Annotations */}
                    <text x="50" y="40" fontSize="11" fontWeight="600" fill="#8c786c">High-Yield Microarchitecture & Directional Flow</text>
                  </svg>
                </div>
              </div>

              {/* High Yield Clinical Pearl Callout */}
              {currentPageContent.clinicalPearl && (
                <div className="clinical-pearl-card">
                  <div className="pearl-badge-row">
                    <span className="pearl-badge">★ CLINICAL PEARL & USMLE CORRELATION</span>
                  </div>
                  <p className="pearl-text">
                    {renderHighlightedText(currentPageContent.clinicalPearl)}
                  </p>
                </div>
              )}

              {/* Key Concept Takeaway */}
              {currentPageContent.keyTakeaway && (
                <div className="key-takeaway-footer">
                  <strong>Core Takeaway:</strong>{" "}
                  {renderHighlightedText(currentPageContent.keyTakeaway)}
                </div>
              )}

              {/* Synchronized Page Footer Navigation Bar */}
              <div className="page-sheet-bottom-nav">
                <button
                  type="button"
                  className="page-bottom-nav-btn"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous Page</span>
                </button>

                <span className="page-sheet-footer-page">
                  Page {currentPage} of {book.totalPages}
                </span>

                <button
                  type="button"
                  className="page-bottom-nav-btn"
                  disabled={currentPage >= book.totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  <span>Next Page</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== THIRD COLLAPSIBLE PANEL: PAGE NOTES & ANNOTATIONS ==================== */}
        <div
          className={`study-bottom-annotations-drawer ${isNotesDrawerOpen ? "open" : "collapsed"}`}
          aria-label="Page Annotations and Notes Drawer"
        >
          <div className="annotations-drawer-header">
            <div className="drawer-header-info">
              <NotebookPen size={14} className="drawer-icon" />
              <span className="drawer-title">Page Annotations & Clinical Notes</span>
              <span className="drawer-page-tag">Page {currentPage}</span>
              {bookNotes.length > 0 && (
                <span className="drawer-notes-count">{bookNotes.length} saved</span>
              )}
            </div>

            <button
              type="button"
              className="drawer-toggle-btn"
              onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
              title={isNotesDrawerOpen ? "Collapse Annotations Panel" : "Expand Annotations Panel"}
              aria-label={isNotesDrawerOpen ? "Collapse Annotations Panel" : "Expand Annotations Panel"}
            >
              <span className="drawer-toggle-text">
                {isNotesDrawerOpen ? "Collapse Panel" : "Expand Panel"}
              </span>
              {isNotesDrawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {isNotesDrawerOpen && (
            <div className="annotations-drawer-body">
              {/* Fast Note Creation Line */}
              <div className="drawer-fast-note-row">
                <input
                  type="text"
                  placeholder="Quickly note a mnemonic, clinical pearl, or question on this page..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newNoteContent.trim()) {
                      handleSaveNote();
                    }
                  }}
                  className="drawer-note-input"
                />
                <button
                  type="button"
                  className="drawer-note-save-btn"
                  disabled={!newNoteContent.trim()}
                  onClick={handleSaveNote}
                >
                  <Plus size={14} />
                  <span>Save</span>
                </button>
              </div>

              {/* Display existing notes for this book / page */}
              {bookNotes.length > 0 ? (
                <div className="drawer-notes-carousel">
                  {bookNotes.map((note) => (
                    <div key={note.id} className="drawer-note-pill">
                      <strong>{note.title}</strong>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="drawer-empty-hint">
                  No notes yet for this page. Type above and press Enter to save!
                </p>
              )}
            </div>
          )}
        </div>
      </main>

        {/* ==================== RIGHT STUDY TOOLS: CLOCK / TIMER / STATS ==================== */}
        {!isFocusMode && (
          <aside
            className={`study-right-tools ${isRightToolsOpen ? "open" : "collapsed"}`}
            aria-label="Study Tools and Focus Timer"
          >
            {isRightToolsOpen ? (
              <>
                <div className="tools-collapse-toggle-bar">
                  <span className="tools-heading-title">Study Tools</span>
                  <button
                    type="button"
                    className="panel-collapse-trigger-btn"
                    onClick={() => setIsRightToolsOpen(false)}
                    title="Collapse Study Tools"
                    aria-label="Collapse Study Tools"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="tools-inner-content scrollable">
                  {/* Real Time Clock Card */}
                  <div className="study-card clock-card">
                    <div className="tool-card-header">
                      <span className="tool-eyebrow">CURRENT TIME</span>
                      <span className="tool-live-dot" />
                    </div>
                    <div className="clock-large-display">{currentTimeStr}</div>
                    <div className="clock-date-display">{currentDateStr}</div>
                  </div>

                  {/* Pomodoro Focus Timer Card */}
                  <div className="study-card timer-card">
                    <div className="tool-card-header">
                      <span className="tool-eyebrow">STUDY TIMER</span>
                      <span className="timer-status-badge">
                        {isTimerRunning ? "Active" : "Paused"}
                      </span>
                    </div>

                    {/* Timer Display */}
                    <div className="timer-digital-display">
                      {timerMinsFormatted}:{timerSecsFormatted}
                    </div>

                    {/* Progress Line */}
                    <div className="timer-progress-track">
                      <div
                        className="timer-progress-fill"
                        style={{ width: `${Math.min(100, timerPercent)}%` }}
                      />
                    </div>

                    {/* Preset Buttons */}
                    <div className="timer-presets-row">
                      {[25, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={`timer-preset-btn ${
                            timerMinutesPreset === mins && !isTimerRunning ? "selected" : ""
                          }`}
                          onClick={() => handleResetTimer(mins)}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    {/* Controls Row */}
                    <div className="timer-action-buttons">
                      {isTimerRunning ? (
                        <button
                          type="button"
                          className="timer-ctrl-btn pause"
                          onClick={handlePauseTimer}
                        >
                          <Pause size={16} />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="timer-ctrl-btn start"
                          onClick={handleStartTimer}
                        >
                          <Play size={16} />
                          <span>Start</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="timer-ctrl-btn reset"
                        onClick={() => handleResetTimer()}
                        title="Reset timer"
                      >
                        <RotateCcw size={15} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Today's Study Stats Card */}
                  <div className="study-card stats-card">
                    <div className="tool-card-header">
                      <span className="tool-eyebrow">TODAY'S STUDY METRICS</span>
                    </div>

                    <div className="stats-metric-grid">
                      <div className="metric-box">
                        <div className="metric-val">{todayStats.formattedTime}</div>
                        <div className="metric-label">Study Time</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">{todayStats.sessionCount}</div>
                        <div className="metric-label">Sessions</div>
                      </div>
                      <div className="metric-box">
                        <div className="metric-val">{todayStats.pagesRead}</div>
                        <div className="metric-label">Pages Read</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Note Creator Box */}
                  <div className="study-card quick-note-card">
                    <div className="tool-card-header">
                      <span className="tool-eyebrow">QUICK MARGIN NOTE</span>
                      <span className="quick-note-page-tag">Page {currentPage}</span>
                    </div>

                    <textarea
                      placeholder="Jot down a quick finding or clinical mnemonic on this page..."
                      rows={3}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="quick-note-textarea"
                    />

                    <button
                      type="button"
                      className="quick-note-save-btn"
                      disabled={!newNoteContent.trim()}
                      onClick={handleSaveNote}
                    >
                      <Plus size={14} />
                      <span>Save to Notebook</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Collapsed Right Rail with Expand Control & Quick Tools */
              <div className="collapsed-rail-inner">
                <button
                  type="button"
                  className="panel-expand-trigger-btn"
                  onClick={() => setIsRightToolsOpen(true)}
                  title="Expand Study Tools (Timer, Clock & Metrics)"
                  aria-label="Expand Study Tools"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="collapsed-rail-divider" />

                <div className="collapsed-rail-icons-stack">
                  <button
                    type="button"
                    className="collapsed-rail-icon-btn"
                    onClick={() => setIsRightToolsOpen(true)}
                    title={`Current Time: ${currentTimeStr}`}
                  >
                    <Clock size={16} />
                  </button>

                  <button
                    type="button"
                    className={`collapsed-rail-icon-btn ${isTimerRunning ? "active" : ""}`}
                    onClick={() => setIsRightToolsOpen(true)}
                    title={`Study Timer: ${timerMinsFormatted}:${timerSecsFormatted}`}
                  >
                    {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    type="button"
                    className="collapsed-rail-icon-btn"
                    onClick={() => setIsRightToolsOpen(true)}
                    title="Study Stats & Metrics"
                  >
                    <TrendingUp size={16} />
                  </button>

                  <button
                    type="button"
                    className="collapsed-rail-icon-btn"
                    onClick={() => setIsRightToolsOpen(true)}
                    title="Quick Margin Notes"
                  >
                    <NotebookPen size={16} />
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ===================== STUDY SESSION COMPLETION MODAL ===================== */}
      {showCompletionModal && (
        <div className="study-modal-backdrop">
          <div className="study-completion-modal">
            <div className="completion-modal-emoji">🎉</div>
            <span className="completion-eyebrow">STUDY SESSION COMPLETED</span>
            <h2 className="completion-title">Outstanding Focus!</h2>
            <p className="completion-book-name">{book.title}</p>
            <div className="completion-stat-pill">
              <Clock size={16} />
              <span>
                <strong>{sessionCompletedDuration} minutes</strong> of concentrated learning
              </span>
            </div>
            <p className="completion-desc">
              Your reading progress and session statistics have been saved. Keep up the consistent study momentum!
            </p>

            <div className="completion-modal-actions">
              <button
                type="button"
                className="completion-continue-btn"
                onClick={() => {
                  setShowCompletionModal(false);
                  handleResetTimer(timerMinutesPreset);
                }}
              >
                <span>Continue Reading</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="completion-library-btn"
                onClick={() => {
                  setShowCompletionModal(false);
                  onBackToLibrary();
                }}
              >
                <span>Back to Library</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
