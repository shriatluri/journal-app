import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JournalEntry, GrowthNote } from '../types';
import { journalService } from '../services/journalService';

interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  totalEntries: number;
  fetchEntries: (limit?: number, skip?: number) => Promise<void>;
  createEntry: (text: string, imageBase64?: string) => Promise<{ entryId: string; growthNote: GrowthNote }>;
  refreshEntries: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchEntries = async (limit = 10, skip = 0) => {
    setIsLoading(true);
    try {
      const response = await journalService.getEntries(limit, skip);
      if (skip === 0) {
        setEntries(response.entries);
      } else {
        setEntries((prev) => [...prev, ...response.entries]);
      }
      setTotalEntries(response.total);
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (text: string, imageBase64?: string) => {
    setIsLoading(true);
    try {
      const response = await journalService.createEntry(text, imageBase64);
      await refreshEntries();
      return { entryId: response.entryId, growthNote: response.growthNote };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEntries = async () => {
    await fetchEntries(10, 0);
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        isLoading,
        totalEntries,
        fetchEntries,
        createEntry,
        refreshEntries,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
