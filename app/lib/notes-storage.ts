import type { OrganId } from "./anatomy-data";

export type AnatomyNote = {
  id: string;
  title: string;
  content: string;
  organId: OrganId | "";
  organName: string;
  systemName: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "inside_human_anatomy_notes_v1";
const DRAFT_KEY = "inside_human_note_draft_v1";

export const INITIAL_NOTES: AnatomyNote[] = [
  {
    id: "note-cardiac-cycle",
    title: "Cardiac Cycle & Hemodynamic Phases",
    content: `The cardiac cycle consists of alternating phases of ventricular systole (contraction/ejection) and ventricular diastole (relaxation/filling).

Key Hemodynamic Milestones:
• Isovolumetric Contraction: All 4 valves closed, ventricular pressure surges until exceeding aortic/pulmonary pressure.
• Ventricular Ejection: Semilunar valves open, rapid stroke volume displacement into arterial trunks.
• Isovolumetric Relaxation: Ventricles relax, aortic backpressure snaps aortic valve shut (S2 heart sound).
• Ventricular Filling: AV valves open, passive rapid inflow followed by atrial systole (P wave on ECG).

Clinical Pearl: Mitral regurgitation creates a holosystolic murmur radiating to the axilla, best heard at the 5th intercostal space midclavicular line.`,
    organId: "heart",
    organName: "Heart",
    systemName: "Cardiovascular System",
    tags: ["Heart", "Cardiovascular", "Physiology", "High Yield", "Valves"],
    isFavorite: true,
    createdAt: "2026-08-18T10:30:00Z",
    updatedAt: "2026-08-19T14:20:00Z",
  },
  {
    id: "note-cerebral-cortex",
    title: "Cerebral Cortex Architecture & Functional Lobes",
    content: `The cerebral hemispheres comprise neocortical layers (I–VI) orchestrating higher-order cognitive, sensorimotor, and affective processes.

Major Functional Divisions:
• Frontal Lobe: Primary motor cortex (precentral gyrus), Broca's expressive speech area (Brodmann 44/45), prefrontal executive networks.
• Parietal Lobe: Primary somatosensory cortex (postcentral gyrus), spatial orientation, sensory integration.
• Temporal Lobe: Primary auditory cortex, Wernicke's receptive language area (Brodmann 22), medial temporal limbic structures (hippocampus & amygdala for memory consolidation).
• Occipital Lobe: Primary visual cortex (striate area 17) surrounding the calcarine fissure.

Vascular Supply: Circle of Willis provides crucial collateral circulation via anterior/posterior communicating arteries.`,
    organId: "brain",
    organName: "Brain",
    systemName: "Nervous System",
    tags: ["Brain", "Nervous System", "Neuroanatomy", "Memory", "Cortical"],
    isFavorite: true,
    createdAt: "2026-08-17T09:15:00Z",
    updatedAt: "2026-08-18T16:45:00Z",
  },
  {
    id: "note-alveolar-exchange",
    title: "Alveolar-Capillary Diffusion & Surfactant",
    content: `The pulmonary blood-air barrier spans a mere 0.2–0.5 µm to optimize Fick's law of diffusion for O2 and CO2 exchange across 300 million alveoli.

Cellular Elements:
• Type I Pneumocytes (95% surface area): Ultra-thin squamous epithelial cells enabling rapid passive gas diffusion.
• Type II Pneumocytes: Cuboidal cells containing lamellar bodies that synthesize pulmonary surfactant (dipalmitoylphosphatidylcholine).
• Alveolar Macrophages (Dust cells): Phagocytose airborne particulates and hemosiderin.

Function of Surfactant: Lowers surface tension at the air-water interface in proportion to alveolar radius, preventing end-expiratory atelectasis and reducing the work of breathing.`,
    organId: "lungs",
    organName: "Lungs",
    systemName: "Respiratory System",
    tags: ["Lungs", "Respiratory", "Histology", "Gas Exchange", "Clinical"],
    isFavorite: false,
    createdAt: "2026-08-16T11:00:00Z",
    updatedAt: "2026-08-17T18:10:00Z",
  },
  {
    id: "note-hepatic-lobule",
    title: "Hepatic Microarchitecture & Portal Triad",
    content: `The classic hepatic lobule centers on the central vein with peripheral portal triads at hexagonal vertices.

Portal Triad Components:
1. Portal Venule (delivers nutrient-rich, deoxygenated blood from GI tract)
2. Hepatic Arteriole (delivers oxygenated blood from celiac trunk)
3. Bile Ductule (drains canalicular bile toward common hepatic duct)

Blood flows centripetally through fenestrated sinusoids lined with Kupffer cells, bathing hepatocytes before entering the central venule. Bile flows centrifugally into the biliary tree.`,
    organId: "liver",
    organName: "Liver",
    systemName: "Digestive System",
    tags: ["Liver", "Digestive", "Metabolism", "Histology"],
    isFavorite: false,
    createdAt: "2026-08-15T14:20:00Z",
    updatedAt: "2026-08-16T08:30:00Z",
  },
  {
    id: "note-nephron-filtration",
    title: "Nephron Glomerular Filtration & Countercurrent Multiplier",
    content: `Each kidney contains approximately 1 million nephrons functioning as filtration and osmolar regulatory units.

Filtration & Reabsorption Cascade:
• Glomerulus & Bowman's Capsule: Ultrafiltration driven by hydrostatic pressure across podocyte slit diaphragms.
• Proximal Convoluted Tubule: Reabsorbs 65% of filtered water, Na+, Cl-, and 100% of filtered glucose and amino acids.
• Loop of Henle: Descending limb is permeable to water; thick ascending limb actively pumps Na+/K+/2Cl- (NKCC2), generating a hypertonic medullary interstitium.
• Distal Tubule & Collecting Duct: Fine-tuned by Aldosterone (Na+ retention, K+/H+ excretion) and ADH/Vasopressin (aquaporin-2 insertion for concentrated urine).`,
    organId: "kidneys",
    organName: "Kidneys",
    systemName: "Urinary System",
    tags: ["Kidneys", "Urinary", "Renal", "Physiology", "High Yield"],
    isFavorite: true,
    createdAt: "2026-08-14T16:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
  },
];

export function getStoredNotes(): AnatomyNote[] {
  if (typeof window === "undefined") return INITIAL_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw) as AnatomyNote[];
    return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveStoredNotes(notes: AnatomyNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to persist anatomy notes", error);
  }
}

export function getStoredDraft(): Partial<AnatomyNote> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredDraft(draft: Partial<AnatomyNote> | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!draft) {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch {
    // Ignore storage quota errors in draft state
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently updated";
  }
}
