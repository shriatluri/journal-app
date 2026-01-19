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

export const journalService = {
  async createEntry(
    text: string,
    imageBase64?: string
  ): Promise<CreateEntryResponse> {
    const response = await apiClient.post('/journal/create', {
      text,
      image: imageBase64,
    });
    return response.data;
  },

  async getEntries(
    limit: number = 10,
    skip: number = 0
  ): Promise<ListEntriesResponse> {
    const response = await apiClient.get('/journal/list', {
      params: { limit, skip },
    });
    return response.data;
  },

  async getEntry(entryId: string): Promise<JournalEntry> {
    const response = await apiClient.get(`/journal/${entryId}`);
    return response.data;
  },

  async deleteEntry(entryId: string): Promise<void> {
    await apiClient.delete(`/journal/${entryId}`);
  },
};
