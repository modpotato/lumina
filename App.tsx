import React, { useState, useEffect } from 'react';
import { Card, AppState, DeckStats, StudyMode, ReviewLog, DailyStats } from './types';
import { calculateNextReview, getDueCards, generateId } from './utils';
import Dashboard from './components/Dashboard';
import ImportScreen from './components/ImportScreen';
import StudySession from './components/StudySession';

const STORAGE_KEY = 'lumina_cards_v1';
const LAST_VIEWED_KEY = 'lumina_last_viewed_v1';
const STATS_KEY = 'lumina_stats_v1';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [studyMode, setStudyMode] = useState<StudyMode>(StudyMode.MASTER);
  const [lastViewedCardId, setLastViewedCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedCards = JSON.parse(stored);
        // Migration for existing cards without new fields
        const migratedCards = parsedCards.map((c: any) => ({
          ...c,
          bucket: c.bucket || 'neutral',
          isBookmarked: c.isBookmarked || false
        }));
        setCards(migratedCards);
      } catch (e) {
        console.error("Failed to load cards", e);
      }
    }
    
    const storedLastViewed = localStorage.getItem(LAST_VIEWED_KEY);
    if (storedLastViewed) {
        setLastViewedCardId(storedLastViewed);
    }

    const storedStats = localStorage.getItem(STATS_KEY);
    if (storedStats) {
        try {
            const parsedStats = JSON.parse(storedStats);
            setReviewLogs(parsedStats.logs || []);
            setDailyStats(parsedStats.daily || []);
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    }

    setIsLoading(false);
  }, []);

  // Save to local storage whenever cards change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isLoading]);

  // Save stats
  useEffect(() => {
    if (!isLoading) {
        localStorage.setItem(STATS_KEY, JSON.stringify({ logs: reviewLogs, daily: dailyStats }));
    }
  }, [reviewLogs, dailyStats, isLoading]);

  // Save last viewed
  useEffect(() => {
    if (!isLoading && lastViewedCardId) {
        localStorage.setItem(LAST_VIEWED_KEY, lastViewedCardId);
    }
  }, [lastViewedCardId, isLoading]);

  const handleImport = (newCards: Card[]) => {
    setCards(prev => [...prev, ...newCards]);
    setAppState(AppState.HOME);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to delete all cards and progress? This cannot be undone.")) {
      setCards([]);
      setReviewLogs([]);
      setDailyStats([]);
      setLastViewedCardId(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_VIEWED_KEY);
      localStorage.removeItem(STATS_KEY);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all progress? This will move all cards back to the main pile.")) {
      setCards(prev => prev.map(c => ({
        ...c,
        bucket: 'neutral',
        box: 0,
        lastReviewed: null,
        dueDate: Date.now()
      })));
      setLastViewedCardId(null);
      localStorage.removeItem(LAST_VIEWED_KEY);
      // We probably want to keep stats history even if we reset card progress
    }
  };

  const handleAddCard = (front: string, back: string) => {
    const newCard: Card = {
      id: generateId(),
      front,
      back,
      tags: [],
      box: 0,
      lastReviewed: null,
      dueDate: Date.now(),
      bucket: 'neutral',
      isBookmarked: false
    };
    setCards(prev => [...prev, newCard]);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleReview = (cardId: string, result: 'correct' | 'incorrect', timeSpent: number) => {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const card = cards.find(c => c.id === cardId);
    
    if (!card) return;

    // Log review
    const newLog: ReviewLog = {
        id: generateId(),
        cardId,
        timestamp: now,
        result,
        previousBox: card.box,
        newBox: result === 'correct' ? Math.min(card.box + 1, 5) : 0, // Simplified logic, actual logic is in calculateNextReview but we just want to log here
        timeSpent
    };

    setReviewLogs(prev => [...prev, newLog]);

    // Update daily stats
    setDailyStats(prev => {
        const existing = prev.find(d => d.date === today);
        if (existing) {
            return prev.map(d => d.date === today ? {
                ...d,
                count: d.count + 1,
                correct: d.correct + (result === 'correct' ? 1 : 0),
                incorrect: d.incorrect + (result === 'incorrect' ? 1 : 0),
                timeSpent: (d.timeSpent || 0) + timeSpent
            } : d);
        } else {
            return [...prev, {
                date: today,
                count: 1,
                correct: result === 'correct' ? 1 : 0,
                incorrect: result === 'incorrect' ? 1 : 0,
                timeSpent
            }];
        }
    });
  };

  const handleStudyComplete = (results: { cardId: string; success: boolean }[]) => {
    // This might be less relevant now with immediate sorting, but we keep it for Leitner updates if needed
    const now = Date.now();
    
    setCards(prevCards => {
      const cardMap = new Map<string, Card>(prevCards.map(c => [c.id, c]));
      
      results.forEach(result => {
        const card = cardMap.get(result.cardId);
        if (card) {
          const { box, dueDate } = calculateNextReview(card.box, result.success);
          cardMap.set(result.cardId, {
            ...card,
            box,
            lastReviewed: now,
            dueDate
          });
        }
      });
      
      return Array.from(cardMap.values());
    });
  };

  const getStats = (): DeckStats => {
    const due = getDueCards(cards).length;
    const mastered = cards.filter(c => c.box >= 4).length;
    const learning = cards.filter(c => c.box < 4).length;
    const gotIt = cards.filter(c => c.bucket === 'got-it').length;
    const missedIt = cards.filter(c => c.bucket === 'missed-it').length;
    
    // Calculate detailed stats
    const totalReviews = reviewLogs.length;
    const correctReviews = reviewLogs.filter(l => l.result === 'correct').length;
    const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats.find(d => d.date === today);
    const todayCount = todayStats ? todayStats.count : 0;
    const todayTime = todayStats ? (todayStats.timeSpent || 0) : 0;
    const totalTime = dailyStats.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);

    // Calculate streak
    let streak = 0;
    const sortedDates = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
    
    // Check if we studied today
    let currentDate = new Date();
    let dateStr = currentDate.toISOString().split('T')[0];
    
    // If no study today, check yesterday for streak continuation
    if (!dailyStats.find(d => d.date === dateStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
        dateStr = currentDate.toISOString().split('T')[0];
    }

    while (true) {
        const hasStudy = dailyStats.find(d => d.date === dateStr && d.count > 0);
        if (hasStudy) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
            dateStr = currentDate.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    return {
      total: cards.length,
      due,
      mastered,
      learning,
      gotIt,
      missedIt,
      streak,
      accuracy,
      totalReviews,
      todayCount,
      totalTime,
      todayTime
    };
  };

  const getCardsForSession = () => {
    switch (studyMode) {
      case StudyMode.GOT_IT:
        return cards.filter(c => c.bucket === 'got-it');
      case StudyMode.MISSED_IT:
        return cards.filter(c => c.bucket === 'missed-it');
      case StudyMode.MASTER:
      default:
        // Master view contains everything, but maybe we want to filter out 'got-it' if the user wants to focus?
        // The user said "Master Review: A view containing everything mixed together".
        // So we return all cards.
        return cards;
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.IMPORT:
        return (
          <ImportScreen 
            onImport={handleImport} 
            onCancel={() => setAppState(AppState.HOME)} 
          />
        );
      
      case AppState.STUDY:
        const sessionCards = getCardsForSession();
        let initialIndex = 0;
        // Only resume for Master mode, or if we want to be fancy, for any mode if the card is in it
        if (lastViewedCardId) {
            const foundIndex = sessionCards.findIndex(c => c.id === lastViewedCardId);
            if (foundIndex !== -1) {
                initialIndex = foundIndex;
            }
        }

        return (
          <StudySession 
            cards={sessionCards}
            mode={studyMode}
            initialIndex={initialIndex}
            onComplete={handleStudyComplete} 
            onUpdateCard={handleUpdateCard}
            onCardViewed={setLastViewedCardId}
            onReview={handleReview}
            onExit={() => setAppState(AppState.HOME)} 
          />
        );

      case AppState.HOME:
      default:
        return (
          <Dashboard 
            cards={cards}
            stats={getStats()}
            onStartStudy={(mode) => {
              setStudyMode(mode);
              setAppState(AppState.STUDY);
            }}
            onImport={() => setAppState(AppState.IMPORT)}
            onClear={handleClear}
            onReset={handleReset}
            onAddCard={handleAddCard}
          />
        );
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-paper flex items-center justify-center text-stone-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <main className="h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;