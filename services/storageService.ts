
import { JournalEntry, InsightData, UserContext } from '../types';

const STORAGE_KEY = 'serene_journal_v1';
const SETTINGS_KEY = 'serene_settings_v1';

export interface UserSettings {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:mm" 24h format
  lastNotificationDate: string | null; // "YYYY-MM-DD"
  manualApiKey: string | null;
}

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: false,
  reminderTime: "20:00",
  lastNotificationDate: null,
  manualApiKey: null
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
    // @ts-ignore
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert("Storage full! Please clear your history to save new photos.");
      const entryNoImage = { ...newEntry, image: '' };
      entries.pop(); 
      entries.push(entryNoImage);
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (innerE) {
         console.error("Even text storage failed", innerE);
      }
    }
  }
  
  return newEntry;
};

export const clearJournal = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentDay = (): number => {
  const entries = getJournal();
  if (entries.length === 0) return 1;
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const now = Date.now();
  const firstEntryTime = sorted[0].timestamp;
  return Math.floor((now - firstEntryTime) / (1000 * 60 * 60 * 24)) + 1;
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

export const markNotificationSent = () => {
  const settings = getSettings();
  const today = new Date().toLocaleDateString();
  const newSettings = { ...settings, lastNotificationDate: today };
  saveSettings(newSettings);
};

export const shouldSendNotification = (): boolean => {
  const settings = getSettings();
  if (!settings.reminderEnabled) return false;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const [targetHours, targetMinutes] = settings.reminderTime.split(':').map(Number);
  
  const isTime = (currentHours > targetHours) || (currentHours === targetHours && currentMinutes >= targetMinutes);
  
  if (!isTime) return false;
  const today = now.toLocaleDateString();
  return settings.lastNotificationDate !== today;
};
