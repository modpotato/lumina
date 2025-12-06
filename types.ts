export interface Card {
  id: string;
  front: string;
  back: string;
  tags: string[];
  // Simple Leitner system properties
  box: number; // 0 to 5
  lastReviewed: number | null; // Timestamp
  dueDate: number; // Timestamp
}

export enum AppState {
  HOME = 'HOME',
  STUDY = 'STUDY',
  IMPORT = 'IMPORT'
}

export interface DeckStats {
  total: number;
  due: number;
  mastered: number; // Box 4+
  learning: number; // Box 0-3
}