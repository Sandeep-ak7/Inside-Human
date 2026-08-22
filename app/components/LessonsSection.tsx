"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  Microscope,
  NotebookPen,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { OrganId } from "../lib/anatomy-data";
import {
  LESSONS_DATA,
  type Lesson,
  type LessonDifficulty,
  type LessonSection,
  type UserLessonProgress,
  getStoredLessonProgress,
  saveStoredLessonProgress,
} from "../lib/lessons-data";
import type { Organ } from "../i18n/merge";
import type { UiDictionary } from "../i18n/types";

type SystemFilter = "all" | "Cardiovascular System" | "Nervous System" | "Respiratory System" | "Digestive System" | "Urinary System" | "Sensory System" | "Integumentary System" | "Endocrine & Digestive";
type DifficultyFilter = "all" | LessonDifficulty;
type ProgressFilter = "all" | "in-progress" | "completed" | "not-started";

export function LessonsSection({
  t,
  organs,
  onExploreOrgan,
  onTakeNotesForOrgan,
  initialLessonId,
}: {
  t: UiDictionary;
  organs: Organ[];
  onExploreOrgan: (organId: OrganId) => void;
  onTakeNotesForOrgan: (organId: OrganId) => void;
  initialLessonId?: string | null;
}) {
  const [progressMap, setProgressMap] = useState<Record<string, UserLessonProgress>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState<SystemFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");

  // Active Lesson Detail View
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const loaded = getStoredLessonProgress();
    setProgressMap(loaded);
  }, []);

  // Handle direct initialLessonId navigation
  useEffect(() => {
    if (initialLessonId) {
      const target = LESSONS_DATA.find((l) => l.id === initialLessonId || l.organId === initialLessonId);
      if (target) {
        startLesson(target);
      }
    }
  }, [initialLessonId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Helper stats
  const stats = useMemo(() => {
    const totalLessons = LESSONS_DATA.length;
    let completedCount = 0;
    let inProgressCount = 0;
    let totalScore = 0;
    let totalQuestions = 0;

    Object.values(progressMap).forEach((p) => {
      if (p.isCompleted) completedCount++;
      else if (p.completedSectionIds.length > 0) inProgressCount++;
      if (p.score !== undefined && p.totalQuestions) {
        totalScore += p.score;
        totalQuestions += p.totalQuestions;
      }
    });

    const completionRate = Math.round((completedCount / totalLessons) * 100);
    const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 100;
    const totalTimeHours = (completedCount * 10 + inProgressCount * 5);

    return {
      totalLessons,
      completedCount,
      inProgressCount,
      completionRate,
      avgScore,
      totalTimeFormatted: totalTimeHours >= 60 ? `${Math.floor(totalTimeHours / 60)}h ${totalTimeHours % 60}m` : `${totalTimeHours}m`,
    };
  }, [progressMap]);

  // Continue Learning list
  const continueLearningList = useMemo(() => {
    return LESSONS_DATA.map((lesson) => {
      const progress = progressMap[lesson.id];
      const completedSections = progress ? progress.completedSectionIds.length : 0;
      const totalSections = lesson.sections.length;
      const percent = Math.round((completedSections / totalSections) * 100);
      return {
        lesson,
        progress,
        percent,
        isCompleted: progress?.isCompleted || false,
      };
    })
      .filter((item) => item.percent > 0 && !item.isCompleted)
      .sort((a, b) => (b.percent - a.percent));
  }, [progressMap]);

  // Featured Lesson
  const featuredLesson = useMemo(() => {
    return LESSONS_DATA.find((l) => l.featured) || LESSONS_DATA[0];
  }, []);

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    return LESSONS_DATA.filter((lesson) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = lesson.title.toLowerCase().includes(q);
        const matchSubtitle = lesson.subtitle.toLowerCase().includes(q);
        const matchSystem = lesson.system.toLowerCase().includes(q);
        const matchSummary = lesson.summary.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchSystem && !matchSummary) return false;
      }

      if (systemFilter !== "all" && lesson.system !== systemFilter) return false;
      if (difficultyFilter !== "all" && lesson.difficulty !== difficultyFilter) return false;

      const progress = progressMap[lesson.id];
      if (progressFilter === "completed" && !progress?.isCompleted) return false;
      if (progressFilter === "in-progress" && (!progress || progress.isCompleted || progress.completedSectionIds.length === 0)) return false;
      if (progressFilter === "not-started" && progress && progress.completedSectionIds.length > 0) return false;

      return true;
    });
  }, [searchQuery, systemFilter, difficultyFilter, progressFilter, progressMap]);

  // Start / Open a lesson
  const startLesson = (lesson: Lesson) => {
    const existing = progressMap[lesson.id];
    setActiveLesson(lesson);
    setActiveSectionIndex(existing ? Math.min(existing.currentSectionIndex, lesson.sections.length - 1) : 0);
    setPreviewLesson(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle Bookmark
  const toggleBookmark = (lessonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = progressMap[lessonId] || {
      lessonId,
      currentSectionIndex: 0,
      completedSectionIds: [],
      isCompleted: false,
      lastStudiedAt: new Date().toISOString(),
      isBookmarked: false,
    };
    const updated = {
      ...progressMap,
      [lessonId]: { ...current, isBookmarked: !current.isBookmarked },
    };
    setProgressMap(updated);
    saveStoredLessonProgress(updated);
    showToast(current.isBookmarked ? "Removed bookmark" : "Lesson bookmarked");
  };

  // Complete section and advance
  const handleNextSection = () => {
    if (!activeLesson) return;
    const currentSection = activeLesson.sections[activeSectionIndex];
    const prevProgress = progressMap[activeLesson.id] || {
      lessonId: activeLesson.id,
      currentSectionIndex: 0,
      completedSectionIds: [],
      isCompleted: false,
      lastStudiedAt: new Date().toISOString(),
    };

    const newCompletedSections = Array.from(
      new Set([...prevProgress.completedSectionIds, currentSection.id]),
    );

    const isLast = activeSectionIndex === activeLesson.sections.length - 1;
    const updatedProgress: UserLessonProgress = {
      ...prevProgress,
      currentSectionIndex: isLast ? activeSectionIndex : activeSectionIndex + 1,
      completedSectionIds: newCompletedSections,
      isCompleted: isLast ? true : prevProgress.isCompleted,
      lastStudiedAt: new Date().toISOString(),
    };

    const newMap = { ...progressMap, [activeLesson.id]: updatedProgress };
    setProgressMap(newMap);
    saveStoredLessonProgress(newMap);

    if (isLast) {
      setShowCompletionModal(true);
    } else {
      setActiveSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Answer Quiz question
  const handleSelectQuizOption = (quizId: string, optionIndex: number, correctIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [quizId]: optionIndex });
    if (optionIndex === correctIndex) {
      showToast("Correct answer! ✦");
    }
  };

  // RENDER: Dedicated Lesson Detail View
  if (activeLesson) {
    const currentSection = activeLesson.sections[activeSectionIndex];
    const organObj = organs.find((o) => o.id === activeLesson.organId);
    const progress = progressMap[activeLesson.id];
    const isBookmarked = progress?.isBookmarked || false;
    const progressPercent = Math.round(
      ((activeSectionIndex + 1) / activeLesson.sections.length) * 100,
    );

    return (
      <section className="lesson-reader" aria-label="Lesson Content Reader">
        {toastMessage && (
          <div className="notes-toast" role="status">
            <Check size={14} /> {toastMessage}
          </div>
        )}

        {/* Top bar breadcrumb & controls */}
        <div className="reader-topbar">
          <button
            type="button"
            className="reader-back-btn"
            onClick={() => setActiveLesson(null)}
          >
            <ArrowLeft size={16} /> <span>Back to Lessons</span>
          </button>

          <div className="reader-progress-pill">
            <GraduationCap size={15} />
            <span>
              Section {activeSectionIndex + 1} of {activeLesson.sections.length} · {progressPercent}%
            </span>
            <div className="reader-mini-bar">
              <div className="reader-mini-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="reader-actions">
            <button
              type="button"
              className={`reader-action-btn ${isBookmarked ? "active" : ""}`}
              onClick={() => toggleBookmark(activeLesson.id)}
              title="Bookmark lesson"
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            {activeLesson.organId && (
              <button
                type="button"
                className="reader-action-btn"
                onClick={() => onTakeNotesForOrgan(activeLesson.organId as OrganId)}
                title="Take notes about this topic"
              >
                <NotebookPen size={16} /> <span>Notes</span>
              </button>
            )}
          </div>
        </div>

        {/* Lesson Reader Header */}
        <div className="reader-header">
          <div className="reader-meta">
            <span className="lesson-system-badge">{activeLesson.system}</span>
            <span className="lesson-difficulty-badge">{activeLesson.difficulty}</span>
            <span className="lesson-duration-badge">
              <Clock size={13} /> {activeLesson.durationMinutes} min
            </span>
          </div>
          <h1 className="reader-title">{activeLesson.title}</h1>
          <p className="reader-subtitle">{activeLesson.subtitle}</p>

          {/* Section progress tabs */}
          <div className="reader-section-tabs">
            {activeLesson.sections.map((sec, idx) => {
              const isCompleted = progress?.completedSectionIds.includes(sec.id);
              const isActive = idx === activeSectionIndex;
              return (
                <button
                  type="button"
                  key={sec.id}
                  className={`section-tab-btn ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => setActiveSectionIndex(idx)}
                >
                  <span className="tab-num">
                    {isCompleted ? <Check size={12} /> : idx + 1}
                  </span>
                  <span className="tab-title">{sec.title.replace(/^\d+\.\s*/, "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Body */}
        <div className="reader-body-grid">
          {/* Main Content Column */}
          <div className="reader-content-col">
            <article className="reader-article-card">
              <h2 className="section-heading">{currentSection.title}</h2>

              <div className="section-text-content">
                {currentSection.content.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Facts Callout */}
              {currentSection.keyFacts && currentSection.keyFacts.length > 0 && (
                <div className="key-facts-box">
                  <div className="callout-header">
                    <Star size={16} className="star-icon" />
                    <strong>Clinical & Anatomical Key Facts</strong>
                  </div>
                  <ul>
                    {currentSection.keyFacts.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Glossary Terms */}
              {currentSection.terms && currentSection.terms.length > 0 && (
                <div className="terms-glossary-box">
                  <div className="callout-header">
                    <BookOpen size={16} className="book-icon" />
                    <strong>Essential Terminology</strong>
                  </div>
                  <dl className="terms-list">
                    {currentSection.terms.map((item, idx) => (
                      <div key={idx} className="term-item">
                        <dt>{item.term}</dt>
                        <dd>{item.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Did You Know Spark */}
              {currentSection.didYouKnow && (
                <div className="did-you-know-box">
                  <div className="spark-header">
                    <Sparkles size={16} /> <strong>Did You Know?</strong>
                  </div>
                  <p>{currentSection.didYouKnow}</p>
                </div>
              )}

              {/* Mini Section Quiz */}
              {currentSection.quiz && (
                <div className="section-quiz-card">
                  <div className="quiz-card-header">
                    <HelpCircle size={17} />
                    <span>Quick Knowledge Check</span>
                  </div>
                  <h3 className="quiz-question">{currentSection.quiz.question}</h3>
                  <div className="quiz-options-list">
                    {currentSection.quiz.options.map((opt, optIdx) => {
                      const selected = quizAnswers[currentSection.quiz!.id];
                      const isChosen = selected === optIdx;
                      const isCorrect = optIdx === currentSection.quiz!.correctIndex;
                      const isAnswered = selected !== undefined;

                      let stateClass = "";
                      if (isAnswered) {
                        if (isCorrect) stateClass = "correct";
                        else if (isChosen) stateClass = "incorrect";
                      }

                      return (
                        <button
                          type="button"
                          key={optIdx}
                          className={`quiz-option-btn ${stateClass}`}
                          onClick={() =>
                            handleSelectQuizOption(
                              currentSection.quiz!.id,
                              optIdx,
                              currentSection.quiz!.correctIndex,
                            )
                          }
                          disabled={isAnswered}
                        >
                          <span className="opt-letter">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="opt-text">{opt}</span>
                          {isAnswered && isCorrect && <Check size={16} className="state-icon correct" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswers[currentSection.quiz.id] !== undefined && (
                    <div className="quiz-explanation">
                      <strong>Explanation:</strong> {currentSection.quiz.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Reader Navigation Footer */}
              <div className="reader-nav-footer">
                <button
                  type="button"
                  className="reader-prev-btn"
                  disabled={activeSectionIndex === 0}
                  onClick={() => {
                    setActiveSectionIndex((prev) => Math.max(0, prev - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ArrowLeft size={16} /> <span>Previous Section</span>
                </button>

                <button
                  type="button"
                  className="reader-next-btn"
                  onClick={handleNextSection}
                >
                  <span>
                    {activeSectionIndex === activeLesson.sections.length - 1
                      ? "Complete Lesson"
                      : "Next Section"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          </div>

          {/* Interactive Visual Sidebar */}
          <aside className="reader-sidebar">
            {organObj && (
              <div className="sidebar-organ-card">
                <div className="sidebar-organ-header">
                  <span className="organ-icon-badge" style={{ "--org-accent": organObj.accent } as React.CSSProperties}>
                    {organObj.icon}
                  </span>
                  <div>
                    <h3>{organObj.name}</h3>
                    <em>{organObj.system}</em>
                  </div>
                </div>

                <p className="sidebar-organ-desc">{organObj.description}</p>

                <button
                  type="button"
                  className="sidebar-3d-btn"
                  onClick={() => onExploreOrgan(organObj.id)}
                >
                  <Microscope size={16} /> <span>Explore {organObj.name} in 3D</span>
                </button>
              </div>
            )}

            <div className="sidebar-notes-card">
              <div className="notes-header-mini">
                <NotebookPen size={16} /> <span>Study Notes</span>
              </div>
              <p>Record your personal takeaways and clinical mnemonics while reading.</p>
              <button
                type="button"
                className="sidebar-take-notes-btn"
                onClick={() => activeLesson.organId && onTakeNotesForOrgan(activeLesson.organId)}
              >
                <NotebookPen size={14} /> <span>Take Notes</span>
              </button>
            </div>
          </aside>
        </div>

        {/* Completion Celebration Modal */}
        {showCompletionModal && (
          <div className="lesson-modal-backdrop" role="presentation" onMouseDown={() => setShowCompletionModal(false)}>
            <div
              className="completion-modal"
              role="dialog"
              aria-modal="true"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="trophy-badge">
                <Trophy size={42} />
              </div>
              <h2>Lesson Completed!</h2>
              <p>
                Congratulations! You have mastered <strong>{activeLesson.title}</strong>.
              </p>
              <div className="completion-stats-row">
                <div>
                  <strong>{activeLesson.sections.length}</strong>
                  <span>Sections Completed</span>
                </div>
                <div>
                  <strong>{activeLesson.durationMinutes} min</strong>
                  <span>Study Time</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Mastery</span>
                </div>
              </div>
              <div className="completion-actions">
                <button
                  type="button"
                  className="btn-finish-primary"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setActiveLesson(null);
                  }}
                >
                  <Check size={16} /> <span>Return to Lessons Catalog</span>
                </button>
                {activeLesson.organId && (
                  <button
                    type="button"
                    className="btn-finish-secondary"
                    onClick={() => {
                      setShowCompletionModal(false);
                      onExploreOrgan(activeLesson.organId as OrganId);
                    }}
                  >
                    <Microscope size={16} /> <span>Explore {organObj?.name} in 3D</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // RENDER: Lessons Dashboard (Catalog, Continue Learning, Featured Lesson, Filters)
  return (
    <section className="lessons-dashboard" aria-label="Anatomy Lessons Studio">
      {toastMessage && (
        <div className="notes-toast" role="status">
          <Check size={14} /> {toastMessage}
        </div>
      )}

      {/* 1. Hero Section */}
      <div className="lessons-hero">
        <div className="lessons-hero-content">
          <div className="lessons-hero-kicker">
            <Sparkles size={14} /> <span>Interactive Anatomy Curriculum</span>
          </div>
          <h1>Learn the Human Body</h1>
          <p>Understand anatomy through interactive lessons, visual explanations, and quick quizzes.</p>

          <div className="lessons-hero-search">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons, organs, or topics..."
              className="lessons-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Learner Progress Ring Card */}
        <div className="lessons-hero-progress-card">
          <div className="progress-card-top">
            <Trophy size={18} className="trophy-icon" />
            <span>Curriculum Mastery</span>
          </div>
          <div className="progress-ring-group">
            <div className="progress-number">{stats.completionRate}%</div>
            <div className="progress-detail">
              <strong>{stats.completedCount} of {stats.totalLessons}</strong>
              <span>Lessons Mastered</span>
            </div>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Continue Learning Cards */}
      {continueLearningList.length > 0 && (
        <div className="continue-learning-section">
          <div className="section-title-row">
            <div className="title-group">
              <Clock size={16} /> <h2>Continue Learning</h2>
            </div>
            <span className="badge-count">{continueLearningList.length} in progress</span>
          </div>

          <div className="continue-cards-grid">
            {continueLearningList.map(({ lesson, percent }) => {
              const organ = organs.find((o) => o.id === lesson.organId);
              return (
                <article key={lesson.id} className="continue-card" onClick={() => startLesson(lesson)}>
                  <div className="continue-card-badge" style={{ "--org-accent": organ?.accent || "#eb7c6b" } as React.CSSProperties}>
                    <span>{organ?.icon || "✦"}</span>
                  </div>

                  <div className="continue-card-body">
                    <span className="continue-system">{lesson.system}</span>
                    <h3 className="continue-title">{lesson.title}</h3>
                    <div className="continue-progress-row">
                      <div className="progress-bar-track mini">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="progress-label">{percent}% · {lesson.durationMinutes} min</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="continue-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startLesson(lesson);
                    }}
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Featured Lesson Card */}
      {featuredLesson && (
        <div className="featured-lesson-card">
          <div className="featured-content">
            <div className="featured-badge">
              <Sparkles size={14} /> <span>Featured Lesson</span>
            </div>
            <h2 className="featured-title">{featuredLesson.title}</h2>
            <p className="featured-desc">{featuredLesson.summary}</p>

            <div className="featured-keypoints">
              {featuredLesson.keyLearnings.slice(0, 3).map((point, idx) => (
                <div key={idx} className="keypoint-item">
                  <Check size={14} className="check-icon" /> <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="featured-actions">
              <button
                type="button"
                className="featured-start-btn"
                onClick={() => startLesson(featuredLesson)}
              >
                <Play size={16} fill="currentColor" /> <span>Start Learning</span>
              </button>
              <button
                type="button"
                className="featured-preview-btn"
                onClick={() => setPreviewLesson(featuredLesson)}
              >
                <span>View Syllabus</span>
              </button>
            </div>
          </div>

          <div className="featured-visual-box">
            <div className="featured-visual-glow" />
            <div className="featured-organ-icon">♥</div>
            <div className="featured-stats-pill">
              <span>{featuredLesson.durationMinutes} min</span>
              <span className="dot" />
              <span>{featuredLesson.sections.length} Sections</span>
              <span className="dot" />
              <span>{featuredLesson.difficulty}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Learning Progress Stats Dashboard */}
      <div className="learning-progress-dashboard">
        <div className="stat-card">
          <div className="stat-icon trophy"><Trophy size={18} /></div>
          <div>
            <h3>{stats.completedCount}</h3>
            <span>Lessons Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon clock"><Clock size={18} /></div>
          <div>
            <h3>{stats.inProgressCount}</h3>
            <span>In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon time"><Flame size={18} /></div>
          <div>
            <h3>{stats.totalTimeFormatted}</h3>
            <span>Total Study Time</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon score"><Star size={18} /></div>
          <div>
            <h3>{stats.avgScore}%</h3>
            <span>Quiz Accuracy</span>
          </div>
        </div>
      </div>

      {/* 5. Explore Lessons Catalog & Filters */}
      <div className="lessons-catalog-section">
        <div className="catalog-header">
          <div className="title-group">
            <Layers size={18} /> <h2>Explore Lessons</h2>
          </div>
          <span className="catalog-count">{filteredLessons.length} Lessons Available</span>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="lessons-filter-bar">
          <div className="filter-group">
            <span className="filter-label">System:</span>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value as SystemFilter)}
              className="filter-select"
            >
              <option value="all">All Systems</option>
              <option value="Cardiovascular System">Cardiovascular</option>
              <option value="Nervous System">Nervous</option>
              <option value="Respiratory System">Respiratory</option>
              <option value="Digestive System">Digestive</option>
              <option value="Urinary System">Urinary</option>
              <option value="Sensory System">Sensory</option>
              <option value="Integumentary System">Integumentary</option>
              <option value="Endocrine & Digestive">Endocrine & Digestive</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Difficulty:</span>
            <div className="pill-selector">
              {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                <button
                  type="button"
                  key={diff}
                  className={`pill-btn ${difficultyFilter === diff ? "active" : ""}`}
                  onClick={() => setDifficultyFilter(diff)}
                >
                  {diff === "all" ? "All Levels" : diff}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Progress:</span>
            <div className="pill-selector">
              {[
                { id: "all", label: "All" },
                { id: "in-progress", label: "In Progress" },
                { id: "completed", label: "Completed" },
                { id: "not-started", label: "Not Started" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`pill-btn ${progressFilter === p.id ? "active" : ""}`}
                  onClick={() => setProgressFilter(p.id as ProgressFilter)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="lessons-empty-state">
            <BookOpen size={36} className="empty-icon" />
            <h3>No lessons match your criteria</h3>
            <p>Try clearing your search query or adjusting your filters.</p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSystemFilter("all");
                setDifficultyFilter("all");
                setProgressFilter("all");
              }}
            >
              <RotateCcw size={14} /> <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="lessons-catalog-grid">
            {filteredLessons.map((lesson) => {
              const organ = organs.find((o) => o.id === lesson.organId);
              const progress = progressMap[lesson.id];
              const isCompleted = progress?.isCompleted || false;
              const isBookmarked = progress?.isBookmarked || false;
              const completedCount = progress?.completedSectionIds.length || 0;
              const percent = Math.round((completedCount / lesson.sections.length) * 100);

              return (
                <article
                  key={lesson.id}
                  className={`lesson-card ${isCompleted ? "completed" : ""}`}
                  onClick={() => startLesson(lesson)}
                >
                  <div className="lesson-card-header">
                    <div
                      className="lesson-organ-badge"
                      style={{ "--org-accent": organ?.accent || "#eb7c6b" } as React.CSSProperties}
                    >
                      <span className="org-glyph">{organ?.icon || "✦"}</span>
                      <span>{lesson.system}</span>
                    </div>

                    <div className="card-top-actions">
                      <button
                        type="button"
                        className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
                        onClick={(e) => toggleBookmark(lesson.id, e)}
                        aria-label="Bookmark lesson"
                      >
                        <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                      {isCompleted && (
                        <span className="completed-badge" title="Lesson Completed">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="lesson-card-title">{lesson.title}</h3>
                  <p className="lesson-card-desc">{lesson.summary}</p>

                  <div className="lesson-card-meta">
                    <span className="meta-pill difficulty">{lesson.difficulty}</span>
                    <span className="meta-pill duration">
                      <Clock size={12} /> {lesson.durationMinutes} min
                    </span>
                    <span className="meta-pill sections">
                      <Layers size={12} /> {lesson.sections.length} sections
                    </span>
                  </div>

                  {percent > 0 && !isCompleted && (
                    <div className="card-progress-row">
                      <div className="progress-bar-track mini">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="progress-text">{percent}%</span>
                    </div>
                  )}

                  <div className="lesson-card-footer">
                    <button
                      type="button"
                      className="lesson-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        startLesson(lesson);
                      }}
                    >
                      <span>{isCompleted ? "Review Lesson" : percent > 0 ? "Continue" : "Start Lesson"}</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Syllabus Preview Modal */}
      {previewLesson && (
        <div className="lesson-modal-backdrop" role="presentation" onMouseDown={() => setPreviewLesson(null)}>
          <div
            className="syllabus-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="syllabus-header">
              <div>
                <span className="lesson-system-badge">{previewLesson.system}</span>
                <h2>{previewLesson.title}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewLesson(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="syllabus-desc">{previewLesson.summary}</p>

            <div className="syllabus-sections-list">
              <h4>Curriculum Sections ({previewLesson.sections.length})</h4>
              {previewLesson.sections.map((sec, idx) => (
                <div key={sec.id} className="syllabus-sec-item">
                  <div className="sec-num">{idx + 1}</div>
                  <div className="sec-info">
                    <strong>{sec.title.replace(/^\d+\.\s*/, "")}</strong>
                    {sec.keyFacts && <small>{sec.keyFacts.length} key facts · 1 quiz question</small>}
                  </div>
                </div>
              ))}
            </div>

            <div className="syllabus-footer">
              <button
                type="button"
                className="btn-start-full"
                onClick={() => startLesson(previewLesson)}
              >
                <Play size={16} fill="currentColor" /> <span>Begin Lesson Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
