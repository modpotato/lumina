import React, { useState, useEffect } from 'react';
import { Card, StudyMode } from '../types';
import { ArrowLeft, Check, X, RotateCw, Edit2, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudySessionProps {
  cards: Card[];
  mode: StudyMode;
  initialIndex?: number;
  onComplete: (results: { cardId: string; success: boolean }[]) => void;
  onUpdateCard: (card: Card) => void;
  onCardViewed: (cardId: string) => void;
  onReview: (cardId: string, result: 'correct' | 'incorrect', timeSpent: number) => void;
  onExit: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ cards, mode, initialIndex = 0, onComplete, onUpdateCard, onCardViewed, onReview, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // Reset index when mode changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsFlipped(false);
    setSessionComplete(false);
    setStartTime(Date.now());
  }, [mode]);

  // Report viewed card and reset timer
  useEffect(() => {
    if (cards[currentIndex]) {
        onCardViewed(cards[currentIndex].id);
        setStartTime(Date.now());
    }
  }, [currentIndex, cards, onCardViewed]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleBucket = (bucket: 'got-it' | 'missed-it') => {
    if (!currentCard) return;

    const timeSpent = Date.now() - startTime;

    // Log review
    onReview(currentCard.id, bucket === 'got-it' ? 'correct' : 'incorrect', timeSpent);

    // Update the card immediately
    const updatedCard = { ...currentCard, bucket };
    onUpdateCard(updatedCard);

    // Determine if we should advance
    // If the card leaves the current view, the next card will slide into the current index,
    // so we shouldn't increment the index.
    let shouldAdvance = true;
    if (mode === StudyMode.GOT_IT && bucket !== 'got-it') shouldAdvance = false;
    if (mode === StudyMode.MISSED_IT && bucket !== 'missed-it') shouldAdvance = false;

    if (shouldAdvance) {
        handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleEdit = () => {
    if (!currentCard) return;
    const newFront = window.prompt("Edit Front:", currentCard.front);
    if (newFront === null) return;
    const newBack = window.prompt("Edit Back:", currentCard.back);
    if (newBack === null) return;

    onUpdateCard({ ...currentCard, front: newFront, back: newBack });
  };

  const handleBookmark = () => {
    if (!currentCard) return;
    onUpdateCard({ ...currentCard, isBookmarked: !currentCard.isBookmarked });
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-stone-400 mb-4">
          <RotateCw size={32} />
        </div>
        <p className="text-stone-500">No cards in this view.</p>
        <button 
          onClick={onExit}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-serif font-medium text-ink mb-2">Session Complete</h2>
        <p className="text-stone-500 mb-8">
          You reached the end of the list.
        </p>
        
        <button 
          onClick={onExit}
          className="bg-ink text-white px-8 py-3 rounded-full font-medium hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate progress
  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={onExit}
          className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 mx-8 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
        <div className="text-sm font-medium text-stone-400 tabular-nums">
            {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative perspective-1000">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-stone-200 min-h-[400px] flex flex-col relative overflow-hidden transition-all duration-500"
        >
           {/* Toolbar */}
           <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${currentCard.isBookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'}`}
                title="Bookmark"
              >
                <Bookmark size={20} fill={currentCard.isBookmarked ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={handleEdit}
                className="p-2 text-stone-300 hover:text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
                title="Edit Card"
              >
                <Edit2 size={20} />
              </button>
           </div>

           {/* Front */}
           <div className="flex-1 p-10 flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar">
                <span className="absolute top-6 left-6 text-xs font-bold tracking-widest text-stone-300 uppercase">Question</span>
                <div className="font-serif text-2xl md:text-3xl leading-relaxed text-ink whitespace-pre-wrap">
                    {currentCard.front}
                </div>
           </div>

           {/* Divider / Back */}
           {isFlipped && (
               <div className="flex-1 p-10 pt-0 flex flex-col items-center justify-start text-center border-t border-stone-100 bg-stone-50/50 animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto no-scrollbar">
                   <div className="w-8 h-1 bg-stone-200 rounded-full my-6 opacity-50"></div>
                   <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase mb-4 self-start">Answer</span>
                   <div className="font-serif text-xl md:text-2xl leading-relaxed text-stone-700 whitespace-pre-wrap w-full text-left">
                       {currentCard.back}
                   </div>
               </div>
           )}
        </div>
        
        {/* Navigation Arrows (Desktop) */}
        <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-md border border-stone-100 transition-all
                ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-stone-50 text-stone-500'}`}
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white shadow-md border border-stone-100 transition-all
                ${currentIndex === cards.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-stone-50 text-stone-500'}`}
        >
            <ChevronRight size={24} />
        </button>
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 flex justify-center items-center gap-6 min-h-[140px]">
        {!isFlipped ? (
            <button 
                onClick={handleFlip}
                className="w-full max-w-sm bg-indigo-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-indigo-200"
            >
                Reveal Answer
            </button>
        ) : (
            <div className="flex gap-4 w-full max-w-lg animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => handleBucket('missed-it')}
                    className={`flex-1 flex flex-col items-center justify-center py-4 px-6 border rounded-xl transition-all group
                        ${currentCard.bucket === 'missed-it' 
                            ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-200' 
                            : 'bg-white border-stone-200 hover:border-orange-200 hover:bg-orange-50'}`}
                >
                    <X className={`mb-1 transition-colors ${currentCard.bucket === 'missed-it' ? 'text-orange-600' : 'text-stone-400 group-hover:text-orange-500'}`} size={24} />
                    <span className={`text-sm font-semibold ${currentCard.bucket === 'missed-it' ? 'text-orange-700' : 'text-stone-600 group-hover:text-orange-700'}`}>Missed it</span>
                </button>
                <button 
                    onClick={() => handleBucket('got-it')}
                    className={`flex-1 flex flex-col items-center justify-center py-4 px-6 border rounded-xl transition-all group
                        ${currentCard.bucket === 'got-it' 
                            ? 'bg-green-100 border-green-300 ring-2 ring-green-200' 
                            : 'bg-white border-stone-200 hover:border-green-200 hover:bg-green-50'}`}
                >
                    <Check className={`mb-1 transition-colors ${currentCard.bucket === 'got-it' ? 'text-green-600' : 'text-stone-400 group-hover:text-green-500'}`} size={24} />
                    <span className={`text-sm font-semibold ${currentCard.bucket === 'got-it' ? 'text-green-700' : 'text-stone-600 group-hover:text-green-700'}`}>Got it</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;