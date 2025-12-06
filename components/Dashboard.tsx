import React from 'react';
import { Card, DeckStats, StudyMode } from '../types';
import { Play, Plus, Trash2, Library, BookOpen, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface DashboardProps {
  cards: Card[];
  stats: DeckStats;
  onStartStudy: (mode: StudyMode) => void;
  onImport: () => void;
  onClear: () => void;
  onReset: () => void;
  onAddCard: (front: string, back: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cards, stats, onStartStudy, onImport, onClear, onReset, onAddCard }) => {
  const hasCards = cards.length > 0;

  const handleAddCardClick = () => {
    const front = window.prompt("Enter the front of the card:");
    if (!front) return;
    const back = window.prompt("Enter the back of the card:");
    if (!back) return;
    onAddCard(front, back);
  };

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
        
        <div className="flex gap-2">
            {hasCards && (
                <>
                    <button 
                        onClick={onReset}
                        className="text-stone-400 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-100"
                        title="Reset all progress"
                    >
                        <RotateCcw size={16} /> Reset Progress
                    </button>
                    <button 
                        onClick={onClear}
                        className="text-stone-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-100"
                    >
                        <Trash2 size={16} /> Clear All
                    </button>
                </>
            )}
        </div>
      </header>

      {/* Main Action Area */}
      {!hasCards ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-stone-50 p-6 rounded-full mb-6 text-stone-400">
            <Library size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-serif text-ink mb-3">Your library is empty</h3>
          <p className="text-stone-500 max-w-md mx-auto mb-8">
            Import your Anki deck exports or add cards manually to start reviewing.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
                onClick={onImport}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95"
            >
                <Plus size={20} /> Import Deck
            </button>
            <button 
                onClick={handleAddCardClick}
                className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-full font-medium hover:bg-indigo-50 transition-all hover:shadow-lg active:scale-95"
            >
                <Plus size={20} /> Add Card
            </button>
          </div>
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
                    <h2 className="text-xl font-semibold text-stone-800">Study Sessions</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => onStartStudy(StudyMode.MASTER)}
                        className="flex items-center justify-between p-4 rounded-xl bg-stone-50 hover:bg-indigo-50 border border-stone-200 hover:border-indigo-200 transition-all group/btn"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg text-stone-600 group-hover/btn:text-indigo-600 shadow-sm">
                                <Library size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-stone-800">Master Review</div>
                                <div className="text-sm text-stone-500">{stats.total} cards</div>
                            </div>
                        </div>
                        <Play size={20} className="text-stone-400 group-hover/btn:text-indigo-600" />
                    </button>

                    <button 
                        onClick={() => onStartStudy(StudyMode.GOT_IT)}
                        disabled={stats.gotIt === 0}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all group/btn
                            ${stats.gotIt > 0 
                                ? 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer' 
                                : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm">
                                <CheckCircle size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-stone-800">Got It</div>
                                <div className="text-sm text-stone-500">{stats.gotIt} cards</div>
                            </div>
                        </div>
                        <Play size={20} className="text-stone-400 group-hover/btn:text-green-600" />
                    </button>

                    <button 
                        onClick={() => onStartStudy(StudyMode.MISSED_IT)}
                        disabled={stats.missedIt === 0}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all group/btn
                            ${stats.missedIt > 0 
                                ? 'bg-orange-50 hover:bg-orange-100 border-orange-200 cursor-pointer' 
                                : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg text-orange-500 shadow-sm">
                                <XCircle size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-stone-800">Missed It</div>
                                <div className="text-sm text-stone-500">{stats.missedIt} cards</div>
                            </div>
                        </div>
                        <Play size={20} className="text-stone-400 group-hover/btn:text-orange-500" />
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-100">
                    <button 
                        onClick={handleAddCardClick}
                        className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New Card Manually
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
                <div className="text-4xl font-serif text-ink mb-1">{stats.total}</div>
                <div className="text-sm text-stone-400">in your library</div>
             </div>
             
             <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-4 text-stone-500">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Mastery</span>
                </div>
                <div className="flex items-end gap-2">
                    <div className="text-4xl font-serif text-green-600 mb-1">{Math.round((stats.gotIt / (stats.total || 1)) * 100)}%</div>
                    <div className="text-sm text-stone-400 mb-2">known</div>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(stats.gotIt / (stats.total || 1)) * 100}%` }}
                    />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;