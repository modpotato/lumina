import React, { useState, useEffect } from 'react';
import { Card, AppState, DeckStats } from './types';
import { calculateNextReview, getDueCards } from './utils';
import Dashboard from './components/Dashboard';
import ImportScreen from './components/ImportScreen';
import StudySession from './components/StudySession';

const STORAGE_KEY = 'lumina_cards_v1';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedCards = JSON.parse(stored);
        setCards(parsedCards);
      } catch (e) {
        console.error("Failed to load cards", e);
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

  const handleImport = (newCards: Card[]) => {
    setCards(prev => [...prev, ...newCards]);
    setAppState(AppState.HOME);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to delete all cards and progress? This cannot be undone.")) {
      setCards([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleStudyComplete = (results: { cardId: string; success: boolean }[]) => {
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
    return {
      total: cards.length,
      due,
      mastered,
      learning
    };
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
        // Filter cards that are due
        const dueCards = getDueCards(cards);
        return (
          <StudySession 
            cards={dueCards.length > 0 ? dueCards : cards} // Fallback to all cards if debugging/testing without dates
            onComplete={handleStudyComplete} 
            onExit={() => setAppState(AppState.HOME)} 
          />
        );

      case AppState.HOME:
      default:
        return (
          <Dashboard 
            cards={cards}
            stats={getStats()}
            onStartStudy={() => setAppState(AppState.STUDY)}
            onImport={() => setAppState(AppState.IMPORT)}
            onClear={handleClear}
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