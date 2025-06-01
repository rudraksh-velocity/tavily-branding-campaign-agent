// ============= CORRECTED TYPES =============

export interface GlassStyle {
  base?: string;
  card: string;
  input: string;
  panel?: string; // Added for the new design
}

export interface AnimationStyle {
  fadeIn: string;
  slideUp?: string; // Added for new animations
  slideDown?: string; // Added for new animations
  scaleIn?: string; // Added for new animations
  pulse?: string;
  bounce?: string;
  spin?: string;
}

export interface ResearchQuery {
  category: string;
  text: string;
  number?: number; // Added based on WebSocket data structure
  completed?: boolean;
}

export interface StreamingQuery {
  text: string;
  number?: number; // Added based on WebSocket data structure
  category?: string; // Added based on WebSocket data structure
  isComplete?: boolean; // Added for tracking state
}

export interface ResearchQueriesProps {
  queries: ResearchQuery[];
  streamingQueries: Record<string, StreamingQuery>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isResetting: boolean;
  glassStyle: string; // This should be string based on usage
}

export interface ResearchStatusProps {
  status: {
    step: string;
    message: string;
  } | null;
  error: string | null;
  isComplete: boolean;
  currentPhase: string | null; // Should allow null
  isResetting: boolean;
  glassStyle: GlassStyle; // This is correct as GlassStyle object
  loaderColor: string;
  statusRef: React.RefObject<HTMLDivElement>;
}

// ============= ADDITIONAL MISSING TYPES =============

export interface ResearchOutput {
  summary: string;
  details: {
    report: string;
  };
}

export interface DocCount {
  initial: number;
  kept: number;
}

export interface DocCounts {
  [key: string]: DocCount;
}

export interface EnrichmentCounts {
  company: { total: number; enriched: number };
  industry: { total: number; enriched: number };
  financial: { total: number; enriched: number };
  news: { total: number; enriched: number };
}

export interface BriefingStatus {
  company: boolean;
  industry: boolean;
  financial: boolean;
  news: boolean;
}

export interface ResearchState {
  status: "idle" | "processing" | "completed" | "failed";
  message: string;
  queries: ResearchQuery[];
  streamingQueries: Record<string, StreamingQuery>;
  briefingStatus: BriefingStatus;
  enrichmentCounts?: EnrichmentCounts;
  docCounts?: DocCounts;
};


export interface ResearchReportProps {
  output: {
    summary: string;
    details: {
      report: string;
    };
  } | null;
  isResetting: boolean;
  glassStyle: GlassStyle;
  fadeInAnimation: AnimationStyle;
  loaderColor: string;
  isGeneratingPdf: boolean;
  isCopied: boolean;
  onCopyToClipboard: () => void;
  onGeneratePdf: () => void;
}

export interface ResearchBriefingsProps {
  briefingStatus: BriefingStatus;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isResetting: boolean;
}

export interface CurationExtractionProps {
  enrichmentCounts: EnrichmentCounts | undefined;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isResetting: boolean;
  loaderColor: string;
  statusRef: React.RefObject<HTMLDivElement>;
};
