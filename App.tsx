import React, { useState, useEffect } from 'react';
import { Card, AppState, DeckStats, StudyMode } from './types';
import { calculateNextReview, getDueCards, generateId } from './utils';
import Dashboard from './components/Dashboard';
import ImportScreen from './components/ImportScreen';
import StudySession from './components/StudySession';

const STORAGE_KEY = 'lumina_cards_v1';
const LAST_VIEWED_KEY = 'lumina_last_viewed_v1';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
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

    setIsLoading(false);
  }, []);

  // Save to local storage whenever cards change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isLoading]);

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
      setLastViewedCardId(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_VIEWED_KEY);
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
    
    return {
      total: cards.length,
      due,
      mastered,
      learning,
      gotIt,
      missedIt
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