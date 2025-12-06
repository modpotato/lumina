import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { ArrowLeft, Check, X, RotateCw } from 'lucide-react';

interface StudySessionProps {
  cards: Card[];
  onComplete: (results: { cardId: string; success: boolean }[]) => void;
  onExit: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ cards, onComplete, onExit }) => {
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: string; success: boolean }[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Shuffle and init queue on mount
  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
  }, [cards]);

  const currentCard = queue[currentIndex];

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleResult = (success: boolean) => {
    // Record result
    setResults(prev => [...prev, { cardId: currentCard.id, success }]);
    
    // Animate out
    setTimeout(() => {
      if (currentIndex < queue.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
      }
    }, 150); // Short delay for button feedback
  };

  const finishSession = () => {
    onComplete(results);
  };

  if (queue.length === 0 && !sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin text-stone-400 mb-4">
          <RotateCw size={32} />
        </div>
        <p className="text-stone-500">Preparing deck...</p>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCount = results.filter(r => r.success).length;
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-serif font-medium text-ink mb-2">Session Complete</h2>
        <p className="text-stone-500 mb-8">
          You reviewed <span className="font-semibold text-ink">{queue.length}</span> cards.
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
            <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Remembered</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-orange-500">{queue.length - correctCount}</div>
                <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Learning</div>
            </div>
        </div>

        <button 
          onClick={finishSession}
          className="bg-ink text-white px-8 py-3 rounded-full font-medium hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate progress
  const progress = ((currentIndex) / queue.length) * 100;

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
            {currentIndex + 1} / {queue.length}
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative perspective-1000">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-stone-200 min-h-[400px] flex flex-col relative overflow-hidden transition-all duration-500"
        >
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
                    onClick={() => handleResult(false)}
                    className="flex-1 flex flex-col items-center justify-center py-4 px-6 bg-white border border-stone-200 rounded-xl hover:border-orange-200 hover:bg-orange-50 group transition-all"
                >
                    <X className="mb-1 text-stone-400 group-hover:text-orange-500 transition-colors" size={24} />
                    <span className="text-sm font-semibold text-stone-600 group-hover:text-orange-700">Missed it</span>
                </button>
                <button 
                    onClick={() => handleResult(true)}
                    className="flex-1 flex flex-col items-center justify-center py-4 px-6 bg-white border border-stone-200 rounded-xl hover:border-green-200 hover:bg-green-50 group transition-all"
                >
                    <Check className="mb-1 text-stone-400 group-hover:text-green-500 transition-colors" size={24} />
                    <span className="text-sm font-semibold text-stone-600 group-hover:text-green-700">Got it</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;