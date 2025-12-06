import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseAnkiExport } from '../utils';
import { Card } from '../types';

interface ImportScreenProps {
  onImport: (cards: Card[]) => void;
  onCancel: () => void;
}

const ImportScreen: React.FC<ImportScreenProps> = ({ onImport, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Please upload a .txt file (standard Anki export).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const cards = parseAnkiExport(text);
        if (cards.length === 0) {
          setError('No valid flashcards found in this file.');
        } else {
          onImport(cards);
        }
      } catch (err) {
        setError('Failed to parse file. Ensure it is a valid Anki text export.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-medium text-ink mb-2">Import Flashcards</h2>
        <p className="text-stone-500">Upload your Anki export file (.txt) to begin.</p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02]' 
            : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50'
          }
        `}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".txt" 
          onChange={handleFileInput}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-100 text-stone-500'}`}>
            <Upload size={32} />
          </div>
          <p className="text-lg font-medium text-stone-700 mb-1">
            Drag & Drop or <span className="text-indigo-600 hover:underline">Choose file</span>
          </p>
          <p className="text-sm text-stone-400">Supported format: Tab-separated text (.txt)</p>
        </label>
      </div>

      {error && (
        <div className="mt-6 flex items-center p-4 bg-red-50 text-red-700 rounded-lg w-full">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <button 
        onClick={onCancel}
        className="mt-8 text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors"
      >
        Cancel and return home
      </button>
    </div>
  );
};

export default ImportScreen;