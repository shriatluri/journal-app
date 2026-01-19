export interface GrowthArea {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isActive: boolean;
}

export interface DetectedArea {
  areaId: string;
  areaName: string;
  evidenceSnippet: string;
  progressIndicator: 'improving' | 'steady' | 'struggling' | 'first_mention';
}

export interface GrowthNote {
  detectedAreas: DetectedArea[];
  keyMoments: string[];
  actionableInsight: string;
  overallSentiment: 'positive' | 'neutral' | 'challenging';
}

export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: string;
  imageUrl?: string;
  rawText: string;
  growthNote: GrowthNote;
  processingTimeSeconds: number;
  aiModel: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  growthAreas: GrowthArea[];
}

export interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface GrowthSummary {
  areaName: string;
  totalMentions: number;
  improvingCount: number;
  strugglingCount: number;
  lastMention: string | null;
}

export interface TimelineEntry {
  date: string;
  entryId: string;
  evidence: string;
  progress: string;
  sentiment: string;
}
