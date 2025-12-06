export interface Card {
  id: string;
  front: string;
  back: string;
  tags: string[];
  // Simple Leitner system properties
  box: number; // 0 to 5
  lastReviewed: number | null; // Timestamp
  dueDate: number; // Timestamp
  // New fields for user requirements
  bucket: 'got-it' | 'missed-it' | 'neutral';
  isBookmarked: boolean;
}

export enum AppState {
  HOME = 'HOME',
  STUDY = 'STUDY',
  IMPORT = 'IMPORT'
}

export enum StudyMode {
  MASTER = 'MASTER',
  GOT_IT = 'GOT_IT',
  MISSED_IT = 'MISSED_IT'
}

export interface ReviewLog {
  id: string;
  cardId: string;
  timestamp: number;
  result: 'correct' | 'incorrect';
  previousBox: number;
  newBox: number;
  timeSpent: number; // milliseconds
}

export interface DailyStats {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
  correct: number;
  incorrect: number;
  timeSpent: number; // milliseconds
}

export interface DeckStats {
  total: number;
  due: number;
  mastered: number; // Box 4+
  learning: number; // Box 0-3
  gotIt: number;
  missedIt: number;
  // New detailed stats
  streak: number;
  accuracy: number;
  totalReviews: number;
  todayCount: number;
  totalTime: number; // milliseconds
  todayTime: number; // milliseconds
}