import { Card } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const parseAnkiExport = (text: string): Card[] => {
  const lines = text.split('\n');
  const cards: Card[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments/headers and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Split by tab
    const parts = line.split('\t');
    
    // We need at least Front and Back
    if (parts.length >= 2) {
      // Basic cleanup of HTML breaks often found in Anki
      const cleanFront = parts[0].replace(/<br\s*\/?>/gi, '\n').trim();
      const cleanBack = parts[1].replace(/<br\s*\/?>/gi, '\n').trim();

      // Skip malformed empty cards
      if (!cleanFront || !cleanBack) continue;

      cards.push({
        id: generateId(),
        front: cleanFront,
        back: cleanBack,
        tags: parts.length > 2 ? parts[2].split(' ').filter(t => t) : [],
        box: 0,
        lastReviewed: null,
        dueDate: Date.now(),
      });
    }
  }

  return cards;
};

// Leitner System Logic
// Intervals in days for boxes 0-5
const INTERVALS = [0, 1, 3, 7, 14, 30];

export const calculateNextReview = (currentBox: number, correct: boolean): { box: number, dueDate: number } => {
  let newBox = currentBox;

  if (correct) {
    newBox = Math.min(currentBox + 1, INTERVALS.length - 1);
  } else {
    newBox = 0; // Reset to start if wrong
  }

  const daysToAdd = INTERVALS[newBox];
  const dueDate = Date.now() + (daysToAdd * 24 * 60 * 60 * 1000);

  return { box: newBox, dueDate };
};

export const getDueCards = (cards: Card[]): Card[] => {
  const now = Date.now();
  return cards.filter(c => c.dueDate <= now);
};