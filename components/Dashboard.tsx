import React from 'react';
import { Card, DeckStats } from '../types';
import { Play, Plus, Trash2, Library, BookOpen, Clock } from 'lucide-react';
import { getDueCards } from '../utils';

interface DashboardProps {
  cards: Card[];
  stats: DeckStats;
  onStartStudy: () => void;
  onImport: () => void;
  onClear: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cards, stats, onStartStudy, onImport, onClear }) => {
  const dueCount = getDueCards(cards).length;
  const hasCards = cards.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif font-medium text-ink mb-2">My Library</h1>
          <p className="text-stone-500 font-sans">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {hasCards && (
            <button 
                onClick={onClear}
                className="text-stone-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-100"
            >
                <Trash2 size={16} /> Clear All Data
            </button>
        )}
      </header>

      {/* Main Action Area */}
      {!hasCards ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-stone-50 p-6 rounded-full mb-6 text-stone-400">
            <Library size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-serif text-ink mb-3">Your library is empty</h3>
          <p className="text-stone-500 max-w-md mx-auto mb-8">
            Import your Anki deck exports to start reviewing your flashcards in a clean, distraction-free environment.
          </p>
          <button 
            onClick={onImport}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95"
          >
            <Plus size={20} /> Import Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
          {/* Study Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                        <BookOpen size={24} />
                    </span>
                    <h2 className="text-xl font-semibold text-stone-800">Review Session</h2>
                </div>
                
                <div className="mb-8">
                    <div className="text-5xl font-serif text-ink mb-2">{dueCount}</div>
                    <p className="text-stone-500">Cards due for review today</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={onStartStudy}
                        disabled={dueCount === 0}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-lg transition-all
                            ${dueCount > 0 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-xl hover:-translate-y-1' 
                                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <Play fill="currentColor" size={20} />
                        {dueCount > 0 ? 'Start Review' : 'All Caught Up'}
                    </button>
                </div>
            </div>
            
          </div>

          {/* Stats Column */}
          <div className="flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-4 text-stone-500">
                    <Library size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Total Cards</span>
                </div>
                <div className="text-3xl font-serif text-ink">{stats.total}</div>
             </div>

             <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-4 text-stone-500">
                    <Clock size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Mastered</span>
                </div>
                <div className="text-3xl font-serif text-ink">{stats.mastered}</div>
                <div className="text-sm text-green-600 mt-1">
                    {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}% of deck
                </div>
             </div>
             
             <button 
                onClick={onImport}
                className="w-full bg-stone-100 text-stone-600 px-4 py-4 rounded-2xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={18} /> Add More Cards
             </button>
          </div>

          {/* Recent Cards List (Visual Fluff) */}
          <div className="md:col-span-3 mt-8">
            <h3 className="text-lg font-medium text-stone-800 mb-6">Deck Preview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.slice(0, 6).map(card => (
                    <div key={card.id} className="bg-white p-5 rounded-xl border border-stone-200 hover:border-indigo-200 transition-colors cursor-default">
                        <div className="text-stone-800 font-serif line-clamp-2 mb-3">{card.front}</div>
                        <div className="w-8 h-0.5 bg-stone-100 mb-3"></div>
                        <div className="text-stone-400 text-sm line-clamp-1">{card.back}</div>
                    </div>
                ))}
                {cards.length > 6 && (
                    <div className="flex items-center justify-center p-5 text-stone-400 text-sm font-medium">
                        + {cards.length - 6} more cards
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;