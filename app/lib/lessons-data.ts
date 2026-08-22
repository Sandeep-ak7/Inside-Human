import type { OrganId } from "./anatomy-data";

export type LessonDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LessonQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonSection = {
  id: string;
  title: string;
  content: string;
  keyFacts?: string[];
  terms?: { term: string; definition: string }[];
  didYouKnow?: string;
  quiz?: LessonQuizQuestion;
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  system: string;
  organId?: OrganId;
  difficulty: LessonDifficulty;
  durationMinutes: number;
  featured?: boolean;
  summary: string;
  keyLearnings: string[];
  sections: LessonSection[];
};

export type UserLessonProgress = {
  lessonId: string;
  currentSectionIndex: number;
  completedSectionIds: string[];
  isCompleted: boolean;
  score?: number;
  totalQuestions?: number;
  lastStudiedAt: string;
  isBookmarked?: boolean;
};

export const LESSONS_DATA: Lesson[] = [
  {
    id: "lesson-heart-mechanics",
    title: "Understanding the Heart & Hemodynamics",
    subtitle: "Chamber architecture, cardiac cycle phases, and blood-flow dynamics.",
    system: "Cardiovascular System",
    organId: "heart",
    difficulty: "Beginner",
    durationMinutes: 8,
    featured: true,
    summary: "Discover how four coordinated muscular chambers pump over 7,000 liters of oxygenated blood through the vascular tree every single day.",
    keyLearnings: [
      "Anatomy of atria, ventricles, and the 4 cardiac valves",
      "Sequence of the cardiac cycle: Systole vs. Diastole",
      "Difference between systemic and pulmonary circulation",
      "Origin of the S1 (lub) and S2 (dub) heart sounds",
    ],
    sections: [
      {
        id: "heart-sec-1",
        title: "1. The Four-Chambered Pump",
        content: `The human heart is a hollow, muscular organ roughly the size of a clenched fist, situated obliquely in the middle mediastinum. 

It functions as two synchronous pumps in series:
• Right Heart (Low Pressure): Receives deoxygenated venous blood from the superior and inferior venae cavae into the right atrium, pumping it through the tricuspid valve into the right ventricle, and onwards to the lungs via the pulmonary artery.
• Left Heart (High Pressure): Receives freshly oxygenated blood from the pulmonary veins into the left atrium, driving it through the bicuspid (mitral) valve into the thick-walled left ventricle, which ejects it under high pressure into the systemic aorta.`,
        keyFacts: [
          "Left ventricular myocardium is 3x thicker than the right ventricle due to systemic vascular resistance.",
          "Fibrous cardiac skeleton provides electrical insulation between atria and ventricles.",
        ],
        terms: [
          { term: "Myocardium", definition: "The specialized involuntary striated cardiac muscle tissue that forms the thick middle layer of the heart wall." },
          { term: "Endocardium", definition: "The smooth innermost endothelial lining of the heart chambers and valve cusps." },
        ],
        didYouKnow: "The heart creates enough pressure to squirt blood up to 9 meters (30 feet) across a room!",
        quiz: {
          id: "q-heart-1",
          question: "Which chamber of the heart pumps oxygenated blood into the aorta for systemic distribution?",
          options: ["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"],
          correctIndex: 3,
          explanation: "The left ventricle possesses the thickest muscular wall to overcome systemic vascular resistance and pump oxygen-rich blood into the aorta.",
        },
      },
      {
        id: "heart-sec-2",
        title: "2. The Cardiac Cycle: Systole & Diastole",
        content: `Every single heartbeat represents a mechanical cycle lasting approximately 0.8 seconds at a resting rate of 75 bpm.

Phases of the Cardiac Cycle:
1. Isovolumetric Contraction: Ventricles contract with all valves closed, causing a rapid spike in intraventricular pressure. Mitral and tricuspid valve closure generates the first heart sound (S1, 'lub').
2. Rapid & Reduced Ejection: Pressure exceeds arterial diastolic pressure, opening aortic and pulmonary semilunar valves to eject stroke volume (~70 mL).
3. Isovolumetric Relaxation: Ventricles relax. Arterial backpressure snaps semilunar valves shut, producing the second heart sound (S2, 'dub').
4. Rapid Ventricular Filling & Atrial Kick: AV valves open as ventricular pressure drops below atrial pressure. Passive filling accounts for 80% of volume; atrial contraction adds the final 20%.`,
        keyFacts: [
          "Cardiac Output (CO) = Stroke Volume (SV) × Heart Rate (HR), averaging 5.0 L/min at rest.",
          "Coronary arteries receive their primary perfusion during diastole when the myocardium relaxes.",
        ],
        terms: [
          { term: "Systole", definition: "The phase of the cardiac cycle when heart muscle contracts and pumps blood from the chambers into the arteries." },
          { term: "Diastole", definition: "The phase of the heartbeat when the heart muscle relaxes and allows the chambers to fill with blood." },
        ],
        didYouKnow: "Over an average 80-year lifetime, the human heart beats more than 3 billion times without ever taking a rest break.",
        quiz: {
          id: "q-heart-2",
          question: "What physical event generates the classic 'lub' (S1) heart sound?",
          options: [
            "Closure of the atrioventricular (mitral and tricuspid) valves",
            "Closure of the aortic and pulmonary semilunar valves",
            "Blood rushing through the aorta",
            "Contraction of the atrial pectinate muscles",
          ],
          correctIndex: 0,
          explanation: "The first heart sound (S1) is produced by the sudden tension and closure of the mitral and tricuspid atrioventricular valves at the onset of ventricular systole.",
        },
      },
      {
        id: "heart-sec-3",
        title: "3. Electrical Conduction & Pacemaker Pathway",
        content: `The heart generates its own rhythmic electrical impulses independently of the central nervous system through specialized autorhythmic pacemaker cells.

The Conduction Hierarchy:
• Sinoatrial (SA) Node: Located in the superior right atrium. The natural primary pacemaker firing at 60–100 action potentials per minute.
• Atrioventricular (AV) Node: Introduces a crucial 0.1-second delay, ensuring atria completely empty before ventricular contraction begins.
• Bundle of His & Bundle Branches: Rapidly conducts impulses down the interventricular septum.
• Purkinje Fibers: Spreads depolarization upward through the ventricular myocardium from apex to base, wringing blood upward toward the outflow tracts.`,
        keyFacts: [
          "The AV node delay protects ventricles from dangerously fast atrial arrhythmias.",
          "Purkinje fibers have the fastest conduction velocity (~4 m/s) in the entire cardiac conduction system.",
        ],
        terms: [
          { term: "SA Node", definition: "The primary physiological pacemaker of the mammalian heart, located near the junction of superior vena cava and right atrium." },
          { term: "Action Potential", definition: "A rapid change in membrane electrical potential that propagates along cardiac muscle cells to trigger contraction." },
        ],
        didYouKnow: "If disconnected from the body, a living heart can continue beating for hours in a nutrient-rich oxygenated solution due to intrinsic autorhythmicity.",
        quiz: {
          id: "q-heart-3",
          question: "What is the primary physiological purpose of the conduction delay at the AV node?",
          options: [
            "To allow the ventricles to fully relax after systole",
            "To allow atria sufficient time to complete mechanical ejection into the ventricles",
            "To lower arterial blood pressure in the aorta",
            "To recharge the SA node for the next action potential",
          ],
          correctIndex: 1,
          explanation: "The 0.1-second AV nodal delay ensures that atrial systole is complete and the ventricles are fully loaded with blood before ventricular contraction commences.",
        },
      },
    ],
  },
  {
    id: "lesson-brain-cortex",
    title: "How the Brain Works: Lobes & Neurocircuits",
    subtitle: "Explore cortical functional mapping, sensory-motor integration, and deep limbic structures.",
    system: "Nervous System",
    organId: "brain",
    difficulty: "Intermediate",
    durationMinutes: 12,
    summary: "Examine the 86 billion neurons and 100 trillion synaptic connections governing human consciousness, movement, language, and memory.",
    keyLearnings: [
      "Structural division of the four cortical lobes (Frontal, Parietal, Temporal, Occipital)",
      "Motor and Somatosensory Homunculus mapping",
      "Limbic system role in emotion and episodic memory",
      "Blood-Brain Barrier (BBB) protective physiology",
    ],
    sections: [
      {
        id: "brain-sec-1",
        title: "1. The Four Cerebral Lobes",
        content: `The human cerebrum is divided into two hemispheres linked by the corpus callosum. Each hemisphere comprises four distinct anatomical lobes with specialized cognitive assignments:

• Frontal Lobe: Houses the primary motor cortex (precentral gyrus), Broca's motor speech area (Brodmann 44/45), and the prefrontal cortex responsible for decision-making, executive function, and personality.
• Parietal Lobe: Contains the primary somatosensory cortex (postcentral gyrus) which processes touch, proprioception, temperature, and spatial navigation.
• Temporal Lobe: Contains the primary auditory cortex, Wernicke's language comprehension area (Brodmann 22), and medial structures like the hippocampus.
• Occipital Lobe: Dedicated to primary and associative visual processing (Brodmann 17/18/19).`,
        keyFacts: [
          "The human brain consumes 20% of the body's total oxygen and glucose despite representing only 2% of total body mass.",
          "Left hemisphere is dominant for speech and language in over 90% of right-handed individuals.",
        ],
        terms: [
          { term: "Sulcus", definition: "A groove or furrow on the cerebral cortex surface separating adjacent gyri." },
          { term: "Gyrus", definition: "A ridge or fold on the cerebral cortex surface between two sulci." },
        ],
        didYouKnow: "Your brain processes visual information in as little as 13 milliseconds — faster than the blink of an eye.",
        quiz: {
          id: "q-brain-1",
          question: "Which cerebral lobe contains the primary motor cortex responsible for voluntary skeletal movement?",
          options: ["Occipital Lobe", "Temporal Lobe", "Parietal Lobe", "Frontal Lobe"],
          correctIndex: 3,
          explanation: "The primary motor cortex is located in the precentral gyrus of the frontal lobe.",
        },
      },
      {
        id: "brain-sec-2",
        title: "2. The Limbic System & Memory Consolidation",
        content: `Beneath the cerebral cortex lies the limbic system, an evolutionarily conserved ring of structures that regulates emotions, autonomic endocrine functions, and memory formation:

• Hippocampus: Resembles a seahorse in coronal section. Essential for converting short-term declarative memories into long-term cortical storage (consolidation).
• Amygdala: Almond-shaped nucleus that processes emotional valence, particularly fear conditioning, threat appraisal, and emotional memory tagging.
• Thalamus: The grand sensory relay station through which all sensory modalities (except olfaction) pass before reaching the cerebral cortex.
• Hypothalamus: Master regulator of homeostasis, controlling body temperature, circadian rhythms, hunger, thirst, and the pituitary endocrine axis.`,
        keyFacts: [
          "Olfactory signals bypass the thalamus and project directly to the olfactory cortex and amygdala, explaining why smells trigger vivid memories.",
          "Neurogenesis continues throughout adult life in the dentate gyrus of the hippocampus.",
        ],
        terms: [
          { term: "Neuroplasticity", definition: "The capacity of the nervous system to modify its structural organization and synaptic strength in response to learning or injury." },
          { term: "Synapse", definition: "The microscopic junction across which a nerve impulse passes from an axon terminal to another neuron or effector cell." },
        ],
        didYouKnow: "The hippocampus is one of the only regions in the adult human brain capable of generating brand-new neurons throughout adulthood.",
        quiz: {
          id: "q-brain-2",
          question: "Which sensory sense projects directly to the limbic cortex without first synapsing in the thalamus?",
          options: ["Vision", "Hearing", "Smell (Olfaction)", "Taste (Gustation)"],
          correctIndex: 2,
          explanation: "Olfactory nerve fibers bypass the thalamic relay and project directly to the primary olfactory cortex and limbic structures.",
        },
      },
    ],
  },
  {
    id: "lesson-lungs-gas-exchange",
    title: "Gas Exchange & Respiratory Mechanics",
    subtitle: "Alveolar-capillary diffusion barrier, ventilation mechanics, and surfactant dynamics.",
    system: "Respiratory System",
    organId: "lungs",
    difficulty: "Beginner",
    durationMinutes: 10,
    summary: "Study how Boyle's law drives inhalation, how 300 million alveoli create a tennis-court-sized surface area, and how hemoglobin transports oxygen.",
    keyLearnings: [
      "Boyle's law and diaphragm dynamics during inspiration and expiration",
      "Structure and function of Type I vs. Type II pneumocytes",
      "Pulmonary surfactant role in preventing alveolar collapse",
      "Partial pressure gradients governing O2 and CO2 passive diffusion",
    ],
    sections: [
      {
        id: "lungs-sec-1",
        title: "1. The Mechanics of Breathing",
        content: `Ventilation is driven by alternating pressure gradients between the atmosphere and the intra-alveolar space, obeying Boyle's Law (Pressure is inversely proportional to Volume).

• Inhalation (Active): The dome-shaped diaphragm contracts and flattens downwards, while external intercostal muscles elevate the ribs (bucket-handle and pump-handle motion). Thoracic volume increases, intrathoracic pressure drops to -1 cmH2O relative to atmospheric pressure, and air rushes into the bronchial tree.
• Normal Exhalation (Passive): The diaphragm and intercostals relax. Elastic recoil of the pulmonary parenchyma and chest wall increases alveolar pressure (+1 cmH2O), passively expelling air without muscular effort.`,
        keyFacts: [
          "During strenuous exercise, accessory muscles (scalenes, sternocleidomastoid, abdominals) actively assist ventilation.",
          "Normal resting tidal volume is approximately 500 mL per breath.",
        ],
        terms: [
          { term: "Tidal Volume", definition: "The volume of air inhaled or exhaled with each breath during quiet, resting respiration (~500 mL)." },
          { term: "Pleural Cavity", definition: "The potential fluid-filled space between the parietal pleura (chest wall) and visceral pleura (lung surface)." },
        ],
        didYouKnow: "If all 300 million alveoli in both human lungs were unfolded and laid flat, they would cover an area roughly equal to a full tennis court (~70–100 m²).",
        quiz: {
          id: "q-lungs-1",
          question: "Under resting physiological conditions, normal exhalation is primarily driven by:",
          options: [
            "Active contraction of the abdominal wall",
            "Passive elastic recoil of the lungs and thoracic cage",
            "Active contraction of internal intercostal muscles",
            "Nerve impulses stimulating the diaphragm to contract",
          ],
          correctIndex: 1,
          explanation: "Normal resting expiration is a passive process resulting from the natural elastic recoil of stretched lung tissue and surface tension.",
        },
      },
      {
        id: "lungs-sec-2",
        title: "2. The Alveolar-Capillary Barrier & Surfactant",
        content: `The blood-air barrier is an exquisitely thin membrane (~0.2 to 0.5 µm) that separates alveolar air from capillary erythrocytes to maximize diffusion efficiency according to Fick's law:

Key Cellular Components:
• Type I Pneumocytes: Squamous epithelial cells that cover 95% of the alveolar surface, providing a micro-thin pathway for rapid O2 and CO2 diffusion.
• Type II Pneumocytes: Cuboidal cells containing lamellar bodies that synthesize and secrete pulmonary surfactant (dipalmitoylphosphatidylcholine).
• Pulmonary Surfactant: Reduces alveolar surface tension in direct proportion to alveolar radius, preventing small alveoli from collapsing into larger ones (Law of Laplace) and dramatically lowering the muscular work needed to expand the lungs.`,
        keyFacts: [
          "Premature infants born before 32 weeks gestation are at risk for Infant Respiratory Distress Syndrome (IRDS) due to surfactant deficiency.",
          "Carbon dioxide diffuses across the respiratory membrane 20 times faster than oxygen due to its higher solubility coefficient.",
        ],
        terms: [
          { term: "Surfactant", definition: "A phospholipid-protein complex secreted by Type II alveolar cells that lowers surface tension at the alveolar air-liquid interface." },
          { term: "Atelectasis", definition: "The partial or complete collapse of lung tissue or alveoli preventing normal respiratory exchange." },
        ],
        didYouKnow: "A healthy adult takes approximately 20,000 breaths every day, moving more than 10,000 liters of air.",
        quiz: {
          id: "q-lungs-2",
          question: "Which cell type in the alveolar wall synthesizes and secretes pulmonary surfactant?",
          options: ["Type I Pneumocyte", "Type II Pneumocyte", "Alveolar Macrophage", "Endothelial Cell"],
          correctIndex: 1,
          explanation: "Type II pneumocytes (great alveolar cells) are cuboidal cells responsible for producing pulmonary surfactant.",
        },
      },
    ],
  },
  {
    id: "lesson-liver-metabolism",
    title: "Hepatic Architecture & Metabolic Mastery",
    subtitle: "Functional anatomy of the portal triad, sinusoids, detoxification, and bile secretion.",
    system: "Digestive System",
    organId: "liver",
    difficulty: "Intermediate",
    durationMinutes: 10,
    summary: "Uncover how the human body's largest internal gland performs over 500 vital metabolic, synthetic, and immunological functions.",
    keyLearnings: [
      "Dual blood supply: Hepatic portal vein (75%) vs. Hepatic artery (25%)",
      "Microscopic structure of the classic hexagonal hepatic lobule",
      "Role of hepatocytes, Kupffer cells, and Stellate cells",
      "Phase I and Phase II hepatic biotransformation and detoxification",
    ],
    sections: [
      {
        id: "liver-sec-1",
        title: "1. Dual Blood Supply & Lobular Microstructure",
        content: `The liver receives a unique dual blood supply:
• Hepatic Portal Vein (75% of volume): Carries deoxygenated, nutrient-dense blood directly from the stomach, intestines, pancreas, and spleen.
• Hepatic Artery (25% of volume): Delivers oxygen-rich arterial blood from the celiac trunk.

Microscopic Organization:
The liver is organized into hexagonal hepatic lobules. At each corner sits a Portal Triad:
1. Branch of the Hepatic Portal Vein
2. Branch of the Hepatic Artery Proper
3. Interlobular Bile Ductule

Blood mixes and flows centripetally through specialized fenestrated sinusoids toward the Central Vein, while bile flows centrifugally in bile canaliculi toward the peripheral bile ductules.`,
        keyFacts: [
          "The liver has an extraordinary capacity for regeneration; as little as 25% of healthy liver tissue can regenerate into a full-sized liver.",
          "Kupffer cells residing in the sinusoids constitute over 80% of all tissue macrophages in the human body.",
        ],
        terms: [
          { term: "Sinusoid", definition: "A specialized type of fenestrated, highly permeable capillary with discontinuous endothelium found in the liver." },
          { term: "Kupffer Cell", definition: "Resident hepatic macrophages lining the sinusoids that clear bacteria, endotoxins, and aged erythrocytes." },
        ],
        didYouKnow: "The liver produces about 800 to 1,000 milliliters of bile every day to emulsify dietary fats in the duodenum.",
        quiz: {
          id: "q-liver-1",
          question: "Which vessel delivers the majority (~75%) of total blood flow to the liver?",
          options: ["Hepatic Artery", "Hepatic Portal Vein", "Inferior Vena Cava", "Celiac Artery"],
          correctIndex: 1,
          explanation: "The hepatic portal vein supplies roughly 75% of the liver's blood volume, carrying nutrient-rich blood from the digestive tract.",
        },
      },
    ],
  },
  {
    id: "lesson-kidneys-filtration",
    title: "Renal Filtration & Osmoregulation",
    subtitle: "Glomerular ultrafiltration, countercurrent multiplication, and acid-base homeostasis.",
    system: "Urinary System",
    organId: "kidneys",
    difficulty: "Advanced",
    durationMinutes: 14,
    summary: "Discover how 2 million nephrons filter 180 liters of plasma daily, precisely tuning electrolyte balance, blood pressure, and urine concentration.",
    keyLearnings: [
      "Glomerular filtration barrier layers: Endothelium, GBM, Podocytes",
      "Tubular transport in PCT, Loop of Henle, DCT, and Collecting Duct",
      "Renin-Angiotensin-Aldosterone System (RAAS) hemodynamics",
      "Countercurrent multiplier mechanism in the renal medulla",
    ],
    sections: [
      {
        id: "kidney-sec-1",
        title: "1. The Nephron: Glomerulus & Tubular Cascade",
        content: `Each kidney contains approximately 1 million nephrons, the functional units of urine formation:

1. Glomerulus & Bowman's Capsule: Blood enters via the afferent arteriole into glomerular capillaries. Hydrostatic pressure drives ultrafiltration across the three-layered filtration barrier (fenestrated endothelium, negatively charged basement membrane, and podocyte foot processes with slit diaphragms).
2. Proximal Convoluted Tubule (PCT): Reabsorbs ~65% of water and NaCl, and 100% of filtered glucose and amino acids via secondary active transport with Na+.
3. Loop of Henle: Descending limb is permeable to water; thick ascending limb actively pumps Na+/K+/2Cl- without water permeability, creating a concentrated hyperosmolar medullary gradient.
4. Distal Convoluted Tubule & Collecting Duct: Fine-tuned by Aldosterone (Na+ reabsorption, K+/H+ excretion) and Antidiuretic Hormone (ADH/Vasopressin, inserting aquaporin-2 channels to concentrate urine).`,
        keyFacts: [
          "Glomerular Filtration Rate (GFR) averages 125 mL/min (180 liters/day), yet 99% of filtered fluid is reabsorbed.",
          "Kidneys receive 20–25% of total resting cardiac output despite making up less than 0.5% of body weight.",
        ],
        terms: [
          { term: "Podocyte", definition: "Specialized epithelial cells wrapping around glomerular capillaries that form filtration slits with their interdigitating pedicels." },
          { term: "Aldosterone", definition: "A steroid hormone secreted by the adrenal cortex that stimulates sodium retention and potassium excretion in the distal nephron." },
        ],
        didYouKnow: "Your entire blood volume passes through the kidneys to be cleansed and balanced roughly 40 times every single day.",
        quiz: {
          id: "q-kidney-1",
          question: "Where in the nephron is 100% of filtered glucose and amino acids normally reabsorbed?",
          options: [
            "Bowman's Capsule",
            "Proximal Convoluted Tubule (PCT)",
            "Ascending Loop of Henle",
            "Medullary Collecting Duct",
          ],
          correctIndex: 1,
          explanation: "Under normal physiological conditions, all filtered glucose and amino acids are completely reabsorbed in the proximal convoluted tubule via sodium-coupled cotransporters.",
        },
      },
    ],
  },
  {
    id: "lesson-vision-optics",
    title: "Optics of the Eye & Phototransduction",
    subtitle: "Refractive media, retinal layers, rods and cones, and visual pathways.",
    system: "Sensory System",
    organId: "eyeball",
    difficulty: "Intermediate",
    durationMinutes: 9,
    summary: "Trace photons from the cornea through the crystalline lens to the retinal photoreceptors, optic chiasm, and visual cortex.",
    keyLearnings: [
      "Refractive apparatus: Cornea (2/3 optical power) vs. Crystalline Lens (accommodation)",
      "Retinal layer hierarchy and foveal specialization",
      "Phototransduction cascade in rods (rhodopsin) and cones (iodopsin)",
      "Optic nerve decussation at the optic chiasm",
    ],
    sections: [
      {
        id: "eye-sec-1",
        title: "1. The Optical Media & Retinal Photoreception",
        content: `Light enters the eye through the transparent cornea (which provides ~43 diopters of refractive power) and passes through the aqueous humor, adjustable pupil (iris), and crystalline lens (which changes curvature via ciliary muscle accommodation).

Light is focused onto the Retina, which contains specialized photoreceptor cells:
• Rods (~120 million): Highly sensitive to dim light (scotopic vision), lack color discrimination, distributed in peripheral retina.
• Cones (~6 million): Responsible for high-acuity photopic vision and trichromatic color perception (Red, Green, Blue opsins), heavily concentrated in the central Fovea Centralis.

Photons trigger cis-to-trans retinal isomerization in opsin pigments, closing cGMP-gated Na+ channels and hyperpolarizing the photoreceptor to modulate glutamate release.`,
        keyFacts: [
          "The fovea centralis contains only cones and has a 1:1 ratio with ganglion cells for maximum spatial visual acuity.",
          "The optic disc has no photoreceptors, creating the physiological 'blind spot' in each eye.",
        ],
        terms: [
          { term: "Fovea", definition: "A tiny pit located in the macula lutea of the retina that provides the clearest, highest-acuity vision." },
          { term: "Accommodation", definition: "The process by which the ciliary muscle alters lens curvature to focus on near vs. distant objects." },
        ],
        didYouKnow: "The human eye can distinguish approximately 10 million distinct colors and detect a single photon of light in total darkness.",
        quiz: {
          id: "q-eye-1",
          question: "Which photoreceptor cell type is densely packed in the fovea centralis for high-acuity color vision?",
          options: ["Rods", "Cones", "Bipolar Cells", "Amacrine Cells"],
          correctIndex: 1,
          explanation: "Cones are concentrated in the fovea centralis to provide high-resolution color vision under daylight conditions.",
        },
      },
    ],
  },
  {
    id: "lesson-skin-barrier",
    title: "Cutaneous Barrier & Thermoregulation",
    subtitle: "Epidermal stratification, melanogenesis, keratinization, and tactile corpuscles.",
    system: "Integumentary System",
    organId: "skin",
    difficulty: "Beginner",
    durationMinutes: 8,
    summary: "Examine the body's largest organ, its five epidermal strata, thermal regulation mechanisms, and tactile mechanoreceptors.",
    keyLearnings: [
      "Five strata of thick skin: Corneum, Lucidum, Granulosum, Spinosum, Basale",
      "Keratinocyte maturation and 28-day turnover cycle",
      "Thermoregulation via eccrine sweating and arteriolar vasodilation",
      "Cutaneous sensory receptors: Meissner, Pacinian, Merkel, and Ruffini",
    ],
    sections: [
      {
        id: "skin-sec-1",
        title: "1. The Stratified Epidermis & Dermal Architecture",
        content: `The integument is the human body's largest organ, accounting for ~16% of total body weight.

Epidermal Layers (from deep to superficial):
1. Stratum Basale: Single layer of actively dividing stem cells, melanocytes, and Merkel tactile cells.
2. Stratum Spinosum: Desmosome-linked keratinocytes and dendritic Langerhans immune cells.
3. Stratum Granulosum: Keratohyalin granules synthesize filaggrin to form the water-impermeable lipid envelope.
4. Stratum Lucidum: Clear, translucent layer found exclusively in thick skin (palms and soles).
5. Stratum Corneum: 15–30 layers of dead, anucleated, keratin-packed corneocytes providing physical and antimicrobial defense.

The underlying Dermis contains collagen fibers, elastin, capillary beds, and specialized mechanoreceptors (Meissner corpuscles for light touch, Pacinian corpuscles for vibration).`,
        keyFacts: [
          "The epidermis sheds roughly 40,000 dead skin cells every minute, replacing itself entirely every 4 weeks.",
          "Thermoregulation is achieved by cutaneous vasodilation (radiating heat) and evaporation of eccrine sweat.",
        ],
        terms: [
          { term: "Keratinocyte", definition: "The predominant cell type in the epidermis that synthesizes structural keratin proteins." },
          { term: "Melanocyte", definition: "A melanin-producing cell located in the stratum basale that protects nuclear DNA from ultraviolet radiation." },
        ],
        didYouKnow: "An average adult carries about 2 square meters (22 square feet) of skin weighing approximately 3.6 to 4.5 kilograms.",
        quiz: {
          id: "q-skin-1",
          question: "Which epidermal layer is found only in the thick skin of the palms and soles?",
          options: ["Stratum Basale", "Stratum Spinosum", "Stratum Lucidum", "Stratum Granulosum"],
          correctIndex: 2,
          explanation: "Stratum lucidum is a clear, thin layer present only in thick skin to provide extra protection against friction.",
        },
      },
    ],
  },
  {
    id: "lesson-pancreas-endocrine",
    title: "Dual Physiology of the Pancreas",
    subtitle: "Exocrine acinar enzyme secretion vs. endocrine Islets of Langerhans glucose control.",
    system: "Endocrine & Digestive",
    organId: "pancreas",
    difficulty: "Intermediate",
    durationMinutes: 10,
    summary: "Discover how the retroperitoneal pancreas coordinates digestive zymogens and systemic glucose homeostasis via insulin and glucagon.",
    keyLearnings: [
      "Exocrine acini and ductal bicarbonate secretion via secretin and CCK",
      "Islets of Langerhans cell types: Alpha, Beta, Delta, and PP cells",
      "Insulin vs. Glucagon opposing feedback loops",
      "Pathophysiology of Type 1 and Type 2 Diabetes Mellitus",
    ],
    sections: [
      {
        id: "pancreas-sec-1",
        title: "1. Exocrine Zymogens & Endocrine Hormones",
        content: `The pancreas is a retroperitoneal organ with a dual functional identity:

• Exocrine Pancreas (98% of mass): Acinar cells produce inactive digestive zymogens (trypsinogen, chymotrypsinogen, amylase, lipase). Ductal cells secrete alkaline bicarbonate (HCO3-) stimulated by secretin to neutralize acidic gastric chyme in the duodenum.
• Endocrine Pancreas (1-2% of mass): Approximately 1 million Islets of Langerhans scattered throughout the parenchyma:
  - Beta Cells (60–70%): Secrete Insulin in response to elevated blood glucose, promoting cellular glucose uptake, glycogenesis, and lipogenesis.
  - Alpha Cells (20–30%): Secrete Glucagon in response to hypoglycemia, stimulating hepatic glycogenolysis and gluconeogenesis.
  - Delta Cells (5%): Secrete Somatostatin to paracrinely inhibit both insulin and glucagon.`,
        keyFacts: [
          "Pancreatic digestive enzymes are secreted as inactive zymogens to prevent auto-digestion of the gland before reaching the duodenum.",
          "Enteropeptidase on the duodenal brush border cleaves trypsinogen into active trypsin, which activates all other pancreatic enzymes.",
        ],
        terms: [
          { term: "Zymogen", definition: "An inactive enzyme precursor requiring biochemical cleavage to become an active enzyme." },
          { term: "Islets of Langerhans", definition: "Microscopic clusters of endocrine cells dispersed throughout the pancreas producing insulin, glucagon, and somatostatin." },
        ],
        didYouKnow: "The pancreas produces about 1.5 liters of pancreatic juice every day filled with digestive enzymes and neutralising bicarbonate.",
        quiz: {
          id: "q-pancreas-1",
          question: "Which endocrine islet cells produce insulin to lower blood glucose levels?",
          options: ["Alpha Cells", "Beta Cells", "Delta Cells", "PP Cells"],
          correctIndex: 1,
          explanation: "Beta cells located within the Islets of Langerhans synthesize and secrete insulin in response to rising blood glucose.",
        },
      },
    ],
  },
];

const PROGRESS_STORAGE_KEY = "inside_human_lessons_progress_v1";

export function getStoredLessonProgress(): Record<string, UserLessonProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      // Seed default demo progress so Continue Learning is immediately populated and beautiful
      const defaultProgress: Record<string, UserLessonProgress> = {
        "lesson-heart-mechanics": {
          lessonId: "lesson-heart-mechanics",
          currentSectionIndex: 2,
          completedSectionIds: ["heart-sec-1", "heart-sec-2"],
          isCompleted: false,
          score: 2,
          totalQuestions: 2,
          lastStudiedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          isBookmarked: true,
        },
        "lesson-brain-cortex": {
          lessonId: "lesson-brain-cortex",
          currentSectionIndex: 1,
          completedSectionIds: ["brain-sec-1"],
          isCompleted: false,
          score: 1,
          totalQuestions: 1,
          lastStudiedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          isBookmarked: false,
        },
        "lesson-skin-barrier": {
          lessonId: "lesson-skin-barrier",
          currentSectionIndex: 1,
          completedSectionIds: ["skin-sec-1"],
          isCompleted: true,
          score: 1,
          totalQuestions: 1,
          lastStudiedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          isBookmarked: false,
        },
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(defaultProgress));
      return defaultProgress;
    }
    return JSON.parse(raw) as Record<string, UserLessonProgress>;
  } catch {
    return {};
  }
}

export function saveStoredLessonProgress(progress: Record<string, UserLessonProgress>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save lesson progress", error);
  }
}
