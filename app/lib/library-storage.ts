import { ANATOMY_LIBRARY_BOOKS } from "./library-data";

export interface BookProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastChapterTitle: string;
  percent: number;
  lastReadAt: string;
}

export interface BookBookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  page: number;
  chapterTitle: string;
  headline: string;
  createdAt: string;
}

export interface StudySessionRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterTitle: string;
  startPage: number;
  endPage: number;
  durationMinutes: number;
  completedAt: string;
}

export interface StudyNoteItem {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  chapterTitle: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PageHighlight {
  id: string;
  bookId: string;
  pageNumber: number;
  text: string;
  color: "yellow" | "green" | "pink" | "blue" | "orange" | string;
  createdAt: string;
}

const PROGRESS_KEY = "inside_human_reading_progress_v1";
const BOOKMARKS_KEY = "inside_human_book_bookmarks_v1";
const SESSIONS_KEY = "inside_human_study_sessions_v1";
const STUDY_NOTES_KEY = "inside_human_study_notes_v1";
const HIGHLIGHTS_KEY = "inside_human_page_highlights_v1";

// Default initial progress seeded for Gray's Anatomy & Marieb so the "Continue Reading" banner immediately looks alive!
const INITIAL_PROGRESS: Record<string, BookProgress> = {
  "grays-anatomy": {
    bookId: "grays-anatomy",
    currentPage: 126,
    totalPages: 850,
    lastChapterTitle: "Chapter 2: The Cardiovascular System",
    percent: 42,
    lastReadAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  "marieb-physiology": {
    bookId: "marieb-physiology",
    currentPage: 84,
    totalPages: 680,
    lastChapterTitle: "Chapter 3: Neural Signaling & Synapses",
    percent: 28,
    lastReadAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
};

const INITIAL_BOOKMARKS: BookBookmark[] = [
  {
    id: "bm-grays-126",
    bookId: "grays-anatomy",
    bookTitle: "Gray's Anatomy",
    page: 126,
    chapterTitle: "Cardiovascular System",
    headline: "Internal Morphology of the Ventricles",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "bm-grays-148",
    bookId: "grays-anatomy",
    bookTitle: "Gray's Anatomy",
    page: 148,
    chapterTitle: "Cardiovascular System",
    headline: "Coronary Circulation & Dominance",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const INITIAL_SESSIONS: StudySessionRecord[] = [
  {
    id: "sess-1",
    bookId: "grays-anatomy",
    bookTitle: "Gray's Anatomy",
    chapterTitle: "Chapter 2: Cardiovascular System",
    startPage: 120,
    endPage: 126,
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "sess-2",
    bookId: "marieb-physiology",
    bookTitle: "Human Anatomy & Physiology",
    chapterTitle: "Chapter 3: Neural Signaling",
    startPage: 80,
    endPage: 84,
    durationMinutes: 30,
    completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "sess-3",
    bookId: "snells-neuroanatomy",
    bookTitle: "Snell's Clinical Neuroanatomy",
    chapterTitle: "Chapter 6: Blood Supply of the Brain",
    startPage: 226,
    endPage: 230,
    durationMinutes: 20,
    completedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// --- Reading Progress ---

export function getStoredReadingProgress(): Record<string, BookProgress> {
  if (typeof window === "undefined") return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(INITIAL_PROGRESS));
      return INITIAL_PROGRESS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PROGRESS;
  }
}

export function saveBookProgress(
  bookId: string,
  currentPage: number,
  totalPages: number,
  chapterTitle: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const all = getStoredReadingProgress();
    const percent = Math.min(100, Math.max(1, Math.round((currentPage / totalPages) * 100)));
    all[bookId] = {
      bookId,
      currentPage,
      totalPages,
      lastChapterTitle: chapterTitle,
      percent,
      lastReadAt: new Date().toISOString(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save reading progress", e);
  }
}

export function getMostRecentBookProgress(): BookProgress | null {
  const all = getStoredReadingProgress();
  const list = Object.values(all).sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime(),
  );
  return list.length > 0 ? list[0] : null;
}

// --- Bookmarks ---

export function getStoredBookmarks(bookId?: string): BookBookmark[] {
  if (typeof window === "undefined") return INITIAL_BOOKMARKS;
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(INITIAL_BOOKMARKS));
      return INITIAL_BOOKMARKS;
    }
    const list: BookBookmark[] = JSON.parse(raw);
    return bookId ? list.filter((b) => b.bookId === bookId) : list;
  } catch (e) {
    return INITIAL_BOOKMARKS;
  }
}

export function toggleStoredBookmark(
  bookId: string,
  bookTitle: string,
  page: number,
  chapterTitle: string,
  headline: string,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStoredBookmarks();
    const existsIndex = current.findIndex(
      (b) => b.bookId === bookId && b.page === page,
    );
    let updated: BookBookmark[];
    let nowBookmarked = false;

    if (existsIndex >= 0) {
      updated = current.filter((_, idx) => idx !== existsIndex);
      nowBookmarked = false;
    } else {
      updated = [
        {
          id: `bm-${bookId}-${page}-${Date.now()}`,
          bookId,
          bookTitle,
          page,
          chapterTitle,
          headline,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
      nowBookmarked = true;
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return nowBookmarked;
  } catch (e) {
    console.error("Failed to toggle bookmark", e);
    return false;
  }
}

// --- Study Sessions ---

export function getStoredStudySessions(): StudySessionRecord[] {
  if (typeof window === "undefined") return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SESSIONS;
  }
}

export function recordStudySession(session: Omit<StudySessionRecord, "id" | "completedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredStudySessions();
    const newSession: StudySessionRecord = {
      ...session,
      id: `sess-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([newSession, ...current]));
  } catch (e) {
    console.error("Failed to record study session", e);
  }
}

export function getTodayStudyStats(): {
  totalMinutes: number;
  formattedTime: string;
  sessionCount: number;
  pagesRead: number;
} {
  const sessions = getStoredStudySessions();
  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.completedAt).toDateString() === todayStr,
  );

  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const sessionCount = todaySessions.length;
  const pagesRead = todaySessions.reduce(
    (acc, s) => acc + Math.max(1, s.endPage - s.startPage + 1),
    0,
  );

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    totalMinutes,
    formattedTime: formattedTime || "0m",
    sessionCount,
    pagesRead,
  };
}

// --- Highlights ---

export function getStoredHighlights(bookId?: string, pageNumber?: number): PageHighlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_KEY);
    if (!raw) return [];
    const list: PageHighlight[] = JSON.parse(raw);
    return list.filter((h) => {
      const matchBook = !bookId || h.bookId === bookId;
      const matchPage = pageNumber === undefined || h.pageNumber === pageNumber;
      return matchBook && matchPage;
    });
  } catch {
    return [];
  }
}

export function saveStoredHighlight(highlight: Omit<PageHighlight, "id" | "createdAt">): PageHighlight {
  const newH: PageHighlight = {
    ...highlight,
    id: `hl-${highlight.bookId}-p${highlight.pageNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(HIGHLIGHTS_KEY);
      const list: PageHighlight[] = raw ? JSON.parse(raw) : [];
      const exists = list.some(
        (h) =>
          h.bookId === newH.bookId &&
          h.pageNumber === newH.pageNumber &&
          h.text === newH.text,
      );
      if (!exists) {
        list.push(newH);
        localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.error("Failed to save highlight", e);
    }
  }
  return newH;
}

export function removeStoredHighlight(highlightId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_KEY);
    if (!raw) return;
    const list: PageHighlight[] = JSON.parse(raw);
    const updated = list.filter((h) => h.id !== highlightId);
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove highlight", e);
  }
}
