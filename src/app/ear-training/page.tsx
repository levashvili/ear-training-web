'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Keyboard from '../components/Keyboard';
import { useState, useCallback } from 'react';
import { units } from '../data/units';
import { Unit, Melody } from '../types/units';

export default function EarTrainingPage() {
  const [currentMelody, setCurrentMelody] = useState<Melody | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'correct' | 'incorrect' | 'none'>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [baseOctave, setBaseOctave] = useState(4);

  // Handle note sequence save
  const handleSaveNotes = async () => {
    if (!currentMelody || !currentUnit) return;
    
    // Parse the input string into note objects
    const notes = noteInput.split(',')
      .map(note => note.trim())
      .filter(note => note.length > 0)
      .map(note => ({
        note: note,
        startTime: 0,
        duration: 1000,
        velocity: 100
      }));

    try {
      const melodyNumber = currentMelody.id.split('-')[1].replace('melody', '');
      const response = await fetch(`/api/save-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitId: currentUnit.id,
          melodyNumber: melodyNumber,
          notes: notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      setIsEditingNotes(false);
      setNoteInput('');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Function to handle octave change
  const handleOctaveChange = useCallback((newOctave: number) => {
    // Limit octave range between 2 and 6
    if (newOctave >= 2 && newOctave <= 6) {
      setBaseOctave(newOctave);
    }
  }, []);

  // Simple key press handler that just updates key visual state
  const handleKeyPress = useCallback((note: string) => {
    setKeyStatuses(prev => ({
      ...prev,
      [note]: 'none'
    }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/units" className="text-blue-500 hover:text-blue-700">
              ← Back to Units
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentUnit?.title} - Melody {currentMelody?.id.split('-')[1].replace('melody', '')}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Game Status Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-gray-800">
                  {currentUnit?.title} - Melody {currentMelody?.id.split('-')[1].replace('melody', '')}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Difficulty: {currentMelody?.difficulty}/10 | 
                Concepts: {currentMelody?.concepts?.join(', ')}
              </p>
              {/* Display note sequence */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Note Sequence:</p>
                  <button
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {isEditingNotes ? 'Cancel' : 'Edit Notes'}
                  </button>
                </div>
                
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Enter notes separated by commas (e.g., C4, D4, E4, F4)
                    </p>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="C4, D4, E4, F4"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save Notes
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentMelody?.notes?.map((note, index) => (
                      <div
                        key={`${index}-${note.note}`}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {note.note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Sheet Music and Keyboard */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-8 border-b border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <button 
                  className="px-4 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Repeat
                </button>
                <button 
                  className="px-4 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
              </div>
              <div className="flex items-center gap-2 w-[200px]">
                <button
                  className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    const newSpeed = Math.max(0.5, playbackSpeed - 0.25);
                    setPlaybackSpeed(newSpeed);
                  }}
                >
                  -
                </button>
                <div className="flex-1 text-center text-gray-800">
                  {playbackSpeed}x Speed
                </div>
                <button
                  className="px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    const newSpeed = Math.min(1, playbackSpeed + 0.25);
                    setPlaybackSpeed(newSpeed);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="pl-6 pr-4 py-4 bg-gray-50 overflow-hidden">
            <div className="flex justify-start">
              <Keyboard 
                onKeyPress={handleKeyPress}
                keyStatuses={keyStatuses}
                showInstrumentSelect={false}
                baseOctave={baseOctave}
                onOctaveChange={handleOctaveChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 