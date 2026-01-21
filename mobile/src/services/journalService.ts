import apiClient from './api';
import { JournalEntry, GrowthNote } from '../types';

interface CreateEntryResponse {
  entryId: string;
  growthNote: GrowthNote;
  processingTime: number;
  message: string;
}

interface ListEntriesResponse {
  entries: JournalEntry[];
  total: number;
  limit: number;
  skip: number;
}

interface BackendEntry {
  id: number;
  raw_text: string;
  growth_note: GrowthNote | null;
  created_at: string;
}

function transformEntry(entry: BackendEntry): JournalEntry {
  return {
    id: String(entry.id),
    userId: 'mvp-user',
    rawText: entry.raw_text,
    growthNote: entry.growth_note || {
      detectedAreas: [],
      keyMoments: [],
      actionableInsight: '',
      overallSentiment: 'neutral',
    },
    createdAt: entry.created_at,
    processingTimeSeconds: 0,
    aiModel: 'gemini-1.5-flash',
  };
}

export const journalService = {
  async createEntry(
    text: string,
    imageBase64?: string
  ): Promise<CreateEntryResponse> {
    const response = await apiClient.post('/journal/analyze', {
      text,
      image: imageBase64,
    });
    return {
      entryId: String(response.data.entryId),
      growthNote: response.data.growthNote,
      processingTime: 0,
      message: response.data.message,
    };
  },

  async getEntries(
    limit: number = 10,
    skip: number = 0
  ): Promise<ListEntriesResponse> {
    const response = await apiClient.get('/journal', {
      params: { limit, offset: skip },
    });
    const entries = (response.data.entries || []).map(transformEntry);
    return {
      entries,
      total: entries.length,
      limit: response.data.limit || limit,
      skip: response.data.offset || skip,
    };
  },

  async getEntry(entryId: string): Promise<JournalEntry> {
    const response = await apiClient.get(`/journal/${entryId}`);
    return transformEntry(response.data);
  },

  async deleteEntry(entryId: string): Promise<void> {
    await apiClient.delete(`/journal/${entryId}`);
  },
};
