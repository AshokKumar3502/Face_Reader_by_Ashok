
import { JournalEntry, InsightData, UserContext } from '../types';

const STORAGE_KEY = 'kosha_journal_v2';
const SETTINGS_KEY = 'kosha_settings_v2';

export interface UserSettings {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:mm" 24h format
  lastNotificationDate: string | null; // "YYYY-MM-DD"
  manualApiKey: string | null; // For users who want to provide their own
}

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: "18:00",
  lastNotificationDate: null,
  manualApiKey: null,
};

// --- Journal Functions ---

export const getJournal = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Storage read error", e);
    return [];
  }
};

export const saveEntry = (
  context: UserContext, 
  insight: InsightData, 
  image: string, 
  manualDayNumber?: number
): JournalEntry => {
  const entries = getJournal();
  const now = Date.now();
  
  let dayNumber = 1;

  if (manualDayNumber) {
    dayNumber = manualDayNumber;
  } else if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    const firstEntryTime = sorted[0].timestamp;
    dayNumber = Math.floor((now - firstEntryTime) / (1000 * 60 * 60 * 24)) + 1;
  }

  const newEntry: JournalEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: now,
    dayNumber,
    context,
    insight,
    image
  };

  entries.push(newEntry);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Storage save error", e);
    // Handle storage quota limits gracefully
    const entryNoImage = { ...newEntry, image: '' };
    entries[entries.length - 1] = entryNoImage;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (inner) {
      console.error("Text storage failed", inner);
    }
  }
  
  return newEntry;
};

export const clearJournal = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- Settings Functions ---

export const getSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Settings save error", e);
  }
};
