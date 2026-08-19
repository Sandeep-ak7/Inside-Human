"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Edit3,
  Filter,
  Folder,
  Heart,
  Layers,
  Microscope,
  NotebookPen,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import type { OrganId } from "../lib/anatomy-data";
import { organStructures } from "../lib/anatomy-data";
import {
  type AnatomyNote,
  formatDate,
  getStoredDraft,
  getStoredNotes,
  saveStoredDraft,
  saveStoredNotes,
} from "../lib/notes-storage";
import type { UiDictionary } from "../i18n/types";
import type { Organ } from "../i18n/merge";

type FilterTab = "all" | "recent" | "favorites" | "organ" | "system";

const PRESET_TAGS = [
  "High Yield",
  "Clinical",
  "Histology",
  "Physiology",
  "Pathology",
  "Exam Prep",
  "Important",
  "Vascular",
];

export function NotesSection({
  t,
  organs,
  onExploreOrgan,
  initialNewNoteOrganId,
  onCloseNewNoteModal,
}: {
  t: UiDictionary;
  organs: Organ[];
  onExploreOrgan: (organId: OrganId) => void;
  initialNewNoteOrganId?: OrganId | null;
  onCloseNewNoteModal?: () => void;
}) {
  const [notes, setNotes] = useState<AnatomyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedOrganFilter, setSelectedOrganFilter] = useState<string>("all");
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AnatomyNote | null>(null);
  const [viewingNote, setViewingNote] = useState<AnatomyNote | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formOrganId, setFormOrganId] = useState<OrganId | "">("heart");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState("");
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [formDraftSaved, setFormDraftSaved] = useState(false);

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes on mount
  useEffect(() => {
    const loaded = getStoredNotes();
    setNotes(loaded);
  }, []);

  // Handle initial trigger from organ view "Take Notes" button
  useEffect(() => {
    if (initialNewNoteOrganId) {
      const targetOrgan = organs.find((o) => o.id === initialNewNoteOrganId);
      setEditingNote(null);
      setFormTitle("");
      setFormContent("");
      setFormOrganId(initialNewNoteOrganId);
      setFormTags(targetOrgan ? [targetOrgan.name, targetOrgan.system] : []);
      setFormIsFavorite(false);
      setIsEditorOpen(true);
    }
  }, [initialNewNoteOrganId, organs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const organList = useMemo(() => {
    return organs.map((o) => ({
      id: o.id,
      name: o.name,
      system: o.system,
      accent: o.accent,
      icon: o.icon,
    }));
  }, [organs]);

  const systemsList = useMemo(() => {
    const set = new Set<string>();
    organs.forEach((o) => set.add(o.system));
    return Array.from(set);
  }, [organs]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [notes]);

  // Filter and Sort
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchOrgan = note.organName.toLowerCase().includes(q);
          const matchSystem = note.systemName.toLowerCase().includes(q);
          const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchOrgan && !matchSystem && !matchTags) {
            return false;
          }
        }

        // Tab filter
        if (activeTab === "favorites" && !note.isFavorite) return false;
        if (activeTab === "organ" && selectedOrganFilter !== "all" && note.organId !== selectedOrganFilter) {
          return false;
        }
        if (activeTab === "system" && selectedSystemFilter !== "all" && note.systemName !== selectedSystemFilter) {
          return false;
        }
        if (selectedTagFilter !== "all" && !note.tags.includes(selectedTagFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (activeTab === "recent") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        // Default sort: favorites first, then newest
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery, activeTab, selectedOrganFilter, selectedSystemFilter, selectedTagFilter]);

  // Open Create Modal
  const handleOpenCreateModal = (prefillOrganId?: OrganId) => {
    const draft = getStoredDraft();
    const targetOrgan = organs.find((o) => o.id === (prefillOrganId || "heart"));
    
    setEditingNote(null);
    if (draft && !prefillOrganId) {
      setFormTitle(draft.title || "");
      setFormContent(draft.content || "");
      setFormOrganId(draft.organId || "heart");
      setFormTags(draft.tags || (targetOrgan ? [targetOrgan.name, targetOrgan.system] : []));
      setFormIsFavorite(draft.isFavorite || false);
    } else {
      setFormTitle("");
      setFormContent("");
      setFormOrganId(prefillOrganId || "heart");
      setFormTags(targetOrgan ? [targetOrgan.name, targetOrgan.system] : []);
      setFormIsFavorite(false);
    }
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (note: AnatomyNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormOrganId(note.organId);
    setFormTags([...note.tags]);
    setFormIsFavorite(note.isFavorite);
    setIsEditorOpen(true);
    setViewingNote(null);
  };

  // Save Note
  const handleSaveNote = () => {
    if (!formTitle.trim()) {
      showToast("Please enter a note title");
      return;
    }

    const selectedOrgan = organs.find((o) => o.id === formOrganId);
    const organName = selectedOrgan ? selectedOrgan.name : "General";
    const systemName = selectedOrgan ? selectedOrgan.system : "General Anatomy";
    const nowIso = new Date().toISOString();

    let updatedNotes: AnatomyNote[];

    if (editingNote) {
      updatedNotes = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: formTitle.trim(),
              content: formContent.trim(),
              organId: formOrganId,
              organName,
              systemName,
              tags: formTags,
              isFavorite: formIsFavorite,
              updatedAt: nowIso,
            }
          : n,
      );
      showToast("Note updated successfully");
    } else {
      const newNote: AnatomyNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        organId: formOrganId,
        organName,
        systemName,
        tags: formTags,
        isFavorite: formIsFavorite,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedNotes = [newNote, ...notes];
      showToast("New note created");
    }

    setNotes(updatedNotes);
    saveStoredNotes(updatedNotes);
    saveStoredDraft(null);
    setIsEditorOpen(false);
    if (onCloseNewNoteModal) onCloseNewNoteModal();
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);
    saveStoredNotes(updatedNotes);
    if (viewingNote && viewingNote.id === noteId) {
      setViewingNote(null);
    }
    showToast("Note deleted");
  };

  // Toggle Favorite
  const handleToggleFavorite = (noteId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const updatedNotes = notes.map((n) =>
      n.id === noteId ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n,
    );
    setNotes(updatedNotes);
    saveStoredNotes(updatedNotes);
    if (viewingNote && viewingNote.id === noteId) {
      setViewingNote({ ...viewingNote, isFavorite: !viewingNote.isFavorite });
    }
    const note = notes.find((n) => n.id === noteId);
    showToast(note?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  // Tag Management
  const handleAddTag = () => {
    const tag = formTagInput.trim();
    if (tag && !formTags.includes(tag)) {
      setFormTags([...formTags, tag]);
      setFormTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Text Formatting Helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  return (
    <section className="notes-dashboard" aria-label="Anatomy Notes Dashboard">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="notes-toast" role="status">
          <Check size={14} /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="notes-header">
        <div className="notes-header-text">
          <div className="notes-kicker">
            <NotebookPen size={14} /> <span>Anatomy Study Studio</span>
          </div>
          <h2>My Notes</h2>
          <p>Save, organize, and review your anatomy notes.</p>
        </div>

        <div className="notes-header-actions">
          <div className="notes-stats-badge">
            <BookOpen size={15} />
            <span>{notes.length} {notes.length === 1 ? "Note" : "Notes"}</span>
            <span className="dot" />
            <Heart size={14} fill="currentColor" className="fav-icon" />
            <span>{notes.filter((n) => n.isFavorite).length} Saved</span>
          </div>
          <button
            type="button"
            className="notes-new-btn"
            onClick={() => handleOpenCreateModal()}
          >
            <Plus size={16} /> <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="notes-toolbar">
        <div className="notes-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your notes..."
            className="notes-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="notes-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="notes-filter-tabs" role="tablist">
          <button
            type="button"
            className={`filter-pill ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Notes ({notes.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => setActiveTab("recent")}
          >
            <Clock size={13} /> Recent
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            <Heart size={13} /> Favorites ({notes.filter((n) => n.isFavorite).length})
          </button>
          
          {/* Organ Filter Dropdown */}
          <div className="notes-select-wrapper">
            <Filter size={13} />
            <select
              value={selectedOrganFilter}
              onChange={(e) => {
                setSelectedOrganFilter(e.target.value);
                setActiveTab("organ");
              }}
              aria-label="Filter notes by organ"
            >
              <option value="all">By Organ (All)</option>
              {organList.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* System Filter Dropdown */}
          <div className="notes-select-wrapper">
            <Layers size={13} />
            <select
              value={selectedSystemFilter}
              onChange={(e) => {
                setSelectedSystemFilter(e.target.value);
                setActiveTab("system");
              }}
              aria-label="Filter notes by system"
            >
              <option value="all">By System (All)</option>
              {systemsList.map((sys) => (
                <option key={sys} value={sys}>
                  {sys}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {allTags.length > 0 && (
        <div className="notes-tag-pills">
          <span className="tag-label"><Tag size={12} /> Tags:</span>
          <button
            type="button"
            className={`tag-chip ${selectedTagFilter === "all" ? "active" : ""}`}
            onClick={() => setSelectedTagFilter("all")}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`tag-chip ${selectedTagFilter === tag ? "active" : ""}`}
              onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? "all" : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid or Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="empty-icon-badge">
            <NotebookPen size={32} />
          </div>
          <h3>{searchQuery || activeTab !== "all" ? "No matching notes found" : "No notes yet"}</h3>
          <p>
            {searchQuery || activeTab !== "all"
              ? "Try adjusting your search query or removing active filters."
              : "Start building your personal anatomy knowledge library."}
          </p>
          <button
            type="button"
            className="notes-new-btn primary"
            onClick={() => handleOpenCreateModal()}
          >
            <Plus size={16} /> <span>Create Your First Note</span>
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => {
            const org = organList.find((o) => o.id === note.organId);
            return (
              <article
                key={note.id}
                className={`note-card ${note.isFavorite ? "favorite-note" : ""}`}
                onClick={() => setViewingNote(note)}
              >
                <div className="note-card-header">
                  <div className="note-organ-badge" style={{ "--org-accent": org?.accent || "#eb7c6b" } as React.CSSProperties}>
                    <span className="org-icon">{org?.icon || "✦"}</span>
                    <span>{note.organName || "General"}</span>
                  </div>

                  <button
                    type="button"
                    className={`note-fav-btn ${note.isFavorite ? "active" : ""}`}
                    onClick={(e) => handleToggleFavorite(note.id, e)}
                    aria-label={note.isFavorite ? "Remove favorite" : "Add to favorites"}
                  >
                    <Heart size={16} fill={note.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                <h3 className="note-card-title">{note.title}</h3>

                <p className="note-card-snippet">
                  {note.content.length > 170 ? `${note.content.substring(0, 170)}...` : note.content}
                </p>

                <div className="note-card-tags">
                  <span className="system-pill">{note.systemName}</span>
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="tag-pill-more">+{note.tags.length - 3}</span>
                  )}
                </div>

                <div className="note-card-footer">
                  <span className="note-date">
                    <Calendar size={12} /> Updated {formatDate(note.updatedAt)}
                  </span>
                  <div className="note-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="note-action-btn edit"
                      onClick={() => handleOpenEditModal(note)}
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      className="note-action-btn delete"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <div className="notes-modal-backdrop" role="presentation" onMouseDown={() => setIsEditorOpen(false)}>
          <div
            className="notes-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="editor-modal-header">
              <div className="editor-title-group">
                <NotebookPen size={20} className="editor-icon" />
                <h3 id="editor-title">{editingNote ? "Edit Note" : "Create New Note"}</h3>
              </div>
              <button
                type="button"
                className="editor-close-btn"
                onClick={() => {
                  setIsEditorOpen(false);
                  if (onCloseNewNoteModal) onCloseNewNoteModal();
                }}
                aria-label="Close editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="editor-form-body">
              {/* Note Title */}
              <div className="form-group">
                <label htmlFor="note-title-input">Note Title</label>
                <input
                  id="note-title-input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cardiac Cycle & Pressure Changes"
                  className="editor-text-input"
                  autoFocus
                />
              </div>

              {/* Organ & System Selectors */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="note-organ-select">Related Organ</label>
                  <select
                    id="note-organ-select"
                    value={formOrganId}
                    onChange={(e) => {
                      const id = e.target.value as OrganId | "";
                      setFormOrganId(id);
                      const org = organs.find((o) => o.id === id);
                      if (org && !formTags.includes(org.name)) {
                        setFormTags([...formTags, org.name]);
                      }
                    }}
                    className="editor-select"
                  >
                    <option value="">General (No specific organ)</option>
                    {organList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.icon} {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Anatomical System</label>
                  <div className="system-readonly-box">
                    {organs.find((o) => o.id === formOrganId)?.system || "General System"}
                  </div>
                </div>
              </div>

              {/* Rich Text Toolbar */}
              <div className="form-group">
                <div className="editor-label-row">
                  <label htmlFor="note-content-input">Note Content & Key Insights</label>
                  <span className="toolbar-hint">Rich Formatting</span>
                </div>

                <div className="rich-toolbar">
                  <button type="button" onClick={() => insertFormatting("**", "**")} title="Bold">
                    <b>B</b>
                  </button>
                  <button type="button" onClick={() => insertFormatting("*", "*")} title="Italic">
                    <i>I</i>
                  </button>
                  <button type="button" onClick={() => insertFormatting("<u>", "</u>")} title="Underline">
                    <u>U</u>
                  </button>
                  <button type="button" onClick={() => insertFormatting("• ")} title="Bullet List">
                    • List
                  </button>
                  <button type="button" onClick={() => insertFormatting("1. ")} title="Numbered List">
                    1. List
                  </button>
                  <button type="button" onClick={() => insertFormatting("> ")} title="Quote">
                    “ Quote
                  </button>
                  <button type="button" onClick={() => insertFormatting("✦ ")} title="Clinical Key">
                    ✦ High Yield
                  </button>
                </div>

                <textarea
                  id="note-content-input"
                  ref={editorTextareaRef}
                  value={formContent}
                  onChange={(e) => {
                    setFormContent(e.target.value);
                    if (!editingNote) {
                      saveStoredDraft({
                        title: formTitle,
                        content: e.target.value,
                        organId: formOrganId,
                        tags: formTags,
                        isFavorite: formIsFavorite,
                      });
                      setFormDraftSaved(true);
                      setTimeout(() => setFormDraftSaved(false), 1500);
                    }
                  }}
                  placeholder="Record physiological mechanisms, clinical correlations, anatomical landmarks, or study mnemonics..."
                  rows={8}
                  className="editor-textarea"
                />
              </div>

              {/* Tags Section */}
              <div className="form-group">
                <label>Tags & Categories</label>
                <div className="tags-input-container">
                  <div className="tags-chips-list">
                    {formTags.map((tag) => (
                      <span key={tag} className="form-tag-badge">
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="tag-add-row">
                    <input
                      type="text"
                      value={formTagInput}
                      onChange={(e) => setFormTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add custom tag (press Enter)..."
                      className="tag-input-field"
                    />
                    <button type="button" className="tag-add-btn" onClick={handleAddTag}>
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Preset Suggestions */}
                  <div className="tag-presets">
                    <span className="preset-label">Suggested:</span>
                    {PRESET_TAGS.filter((pt) => !formTags.includes(pt)).map((pt) => (
                      <button
                        type="button"
                        key={pt}
                        className="preset-chip"
                        onClick={() => setFormTags([...formTags, pt])}
                      >
                        +{pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Favorite & Auto-save */}
              <div className="editor-meta-row">
                <label className="favorite-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formIsFavorite}
                    onChange={(e) => setFormIsFavorite(e.target.checked)}
                  />
                  <Heart size={16} fill={formIsFavorite ? "currentColor" : "none"} className="fav-check-icon" />
                  <span>Mark as Favorite Note</span>
                </label>

                {formDraftSaved && <span className="draft-saved-indicator">✦ Draft autosaved</span>}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="editor-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditorOpen(false);
                  if (onCloseNewNoteModal) onCloseNewNoteModal();
                }}
              >
                Cancel
              </button>
              <button type="button" className="btn-save" onClick={handleSaveNote}>
                <Check size={16} /> <span>{editingNote ? "Save Changes" : "Create Note"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Details View Modal */}
      {viewingNote && (
        <div className="notes-modal-backdrop" role="presentation" onMouseDown={() => setViewingNote(null)}>
          <div
            className="note-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div className="detail-badges">
                <div className="note-organ-badge">
                  <span>✦ {viewingNote.organName}</span>
                </div>
                <span className="system-pill">{viewingNote.systemName}</span>
              </div>

              <div className="detail-top-actions">
                <button
                  type="button"
                  className={`detail-fav-btn ${viewingNote.isFavorite ? "active" : ""}`}
                  onClick={() => handleToggleFavorite(viewingNote.id)}
                  aria-label="Toggle favorite"
                >
                  <Heart size={18} fill={viewingNote.isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  className="editor-close-btn"
                  onClick={() => setViewingNote(null)}
                  aria-label="Close note"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="detail-modal-body">
              <h2 id="detail-title" className="detail-title">
                {viewingNote.title}
              </h2>

              <div className="detail-timestamp">
                <Clock size={13} /> Updated on {formatDate(viewingNote.updatedAt)}
              </div>

              <div className="detail-content-box">
                {viewingNote.content.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {viewingNote.tags.length > 0 && (
                <div className="detail-tags-row">
                  {viewingNote.tags.map((tag) => (
                    <span key={tag} className="detail-tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-modal-footer">
              {viewingNote.organId && (
                <button
                  type="button"
                  className="detail-study-btn"
                  onClick={() => {
                    onExploreOrgan(viewingNote.organId as OrganId);
                    setViewingNote(null);
                  }}
                >
                  <Microscope size={16} /> <span>Study {viewingNote.organName} in 3D</span>
                </button>
              )}

              <div className="detail-action-group">
                <button
                  type="button"
                  className="detail-btn edit"
                  onClick={() => handleOpenEditModal(viewingNote)}
                >
                  <Edit3 size={15} /> <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="detail-btn delete"
                  onClick={() => handleDeleteNote(viewingNote.id)}
                >
                  <Trash2 size={15} /> <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
