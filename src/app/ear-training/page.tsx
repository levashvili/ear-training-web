'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Keyboard from '../components/Keyboard';
import { useState, useCallback, useEffect } from 'react';
import { units } from '../data/units';
import { Unit, Melody, Note } from '../types/units';

export default function EarTrainingPage() {
  const [currentMelody, setCurrentMelody] = useState<Melody | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'correct' | 'incorrect' | 'none'>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [baseOctave, setBaseOctave] = useState(4);

  // Modified state for played notes sequence
  const [playedNotes, setPlayedNotes] = useState<Note[]>([]);
  const [manualNotes, setManualNotes] = useState<Note[]>([]);
  const [comparisonResult, setComparisonResult] = useState<string>('');
  const [isMelodyCorrect, setIsMelodyCorrect] = useState<boolean>(false);
  const [isCorrectFirstTry, setIsCorrectFirstTry] = useState<boolean>(true);
  const [increaseScore, setIncreaseScore] = useState<boolean>(true);

  // Helper function to compare note arrays
  const compareNoteArrays = (played: Note[], manual: Note[], upToLength: number): boolean => {
    if (upToLength > manual.length) return false;
    return played.slice(0, upToLength).every((playedNote, index) => 
      playedNote.note === manual[index].note
    );
  };

  // Modified handler to check notes before updating
  const handleKeyPress = useCallback((note: string) => {
    const newNote: Note = {
      note: note,
      startTime: Date.now(),
      duration: 1000,
      velocity: 100
    };
    
    setPlayedNotes(prev => {
      // If no manual notes, just append and ensure melody is marked as not correct
      if (manualNotes.length === 0) {
        setIsMelodyCorrect(false);
        return [...prev, newNote];
      }
      
      // Compare previous notes with manual notes
      const isCurrentSequenceCorrect = compareNoteArrays(prev, manualNotes, prev.length);
      
      // If sequence is correct so far, append new note
      if (isCurrentSequenceCorrect) {
        const newNotes = [...prev, newNote];
        // Check if the complete sequence is correct
        const isCompleteSequenceCorrect = compareNoteArrays(newNotes, manualNotes, newNotes.length);
        
        // Check if the new note is correct at its position
        const newNoteIndex = newNotes.length - 1;
        if (newNoteIndex < manualNotes.length && newNote.note !== manualNotes[newNoteIndex].note) {
          setIsCorrectFirstTry(false);
          setIncreaseScore(false); // Once set to false, stays false for this melody
        }
        
        // If melody is complete
        if (isCompleteSequenceCorrect && newNotes.length === manualNotes.length) {
          setIsMelodyCorrect(true);
          return newNotes;
        }
        
        return newNotes;
      } else {
        // If sequence is incorrect, mark as not complete and no longer correct on first try
        setIsMelodyCorrect(false);
        setIsCorrectFirstTry(false);
        setIncreaseScore(false); // Once set to false, stays false for this melody
        const newNotes = prev.length > 0 ? 
          [...prev.slice(0, -1), newNote] : 
          [newNote];
        return newNotes;
      }
    });
    
    setKeyStatuses(prev => ({
      ...prev,
      [note]: 'none'
    }));
  }, [manualNotes]);

  // Add effect to handle melody completion
  useEffect(() => {
    if (isMelodyCorrect && !isCorrectFirstTry) {
      // If completed but not on first try, reset after delay
      const timer = setTimeout(() => {
        setPlayedNotes([]);
        setIsMelodyCorrect(false);
        setIsCorrectFirstTry(true);  // Reset for new attempt
        // Note: We don't reset increaseScore here - it stays false for all attempts
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isMelodyCorrect, isCorrectFirstTry]);

  // Modified to update state instead of saving to file
  const handleSaveNotes = () => {
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

    // Update the manual notes state
    setManualNotes(notes);
    setIsEditingNotes(false);
    setNoteInput('');

    /* Commented out file saving code for later
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
    */
  };

  // Function to handle octave change
  const handleOctaveChange = useCallback((newOctave: number) => {
    // Limit octave range between 2 and 6
    if (newOctave >= 2 && newOctave <= 6) {
      setBaseOctave(newOctave);
    }
  }, []);

  // Add comparison function
  const compareNotes = useCallback(() => {
    // Check if we have manual notes to compare against
    if (manualNotes.length === 0) {
      setComparisonResult('No manual notes to compare against');
      return;
    }

    // Check if we have any played notes
    if (playedNotes.length === 0) {
      setComparisonResult('No played notes to compare');
      return;
    }

    // Check if played notes is longer than manual notes
    if (playedNotes.length > manualNotes.length) {
      setComparisonResult('Error: You played more notes than the manual sequence');
      return;
    }

    // Compare notes one by one
    const results = playedNotes.map((playedNote, index) => {
      const manualNote = manualNotes[index];
      const isMatch = playedNote.note === manualNote.note;
      return {
        playedNote: playedNote.note,
        expectedNote: manualNote.note,
        isCorrect: isMatch
      };
    });

    // Generate detailed comparison result
    const detailedResult = results.map((result, index) => 
      `Note ${index + 1}: ${result.playedNote} ${result.isCorrect ? '✓' : '✗'} (Expected: ${result.expectedNote})`
    ).join('\n');

    const correctCount = results.filter(r => r.isCorrect).length;
    const summary = `${correctCount}/${results.length} notes correct\n${detailedResult}`;
    
    setComparisonResult(summary);
  }, [playedNotes, manualNotes]);

  // Helper function to determine note status
  const getNoteStatus = (manualNote: Note, index: number, playedNotes: Note[]): 'correct' | 'incorrect' | 'notPlayed' => {
    if (index >= playedNotes.length) {
      return 'notPlayed';
    }
    return playedNotes[index].note === manualNote.note ? 'correct' : 'incorrect';
  };

  // Status color mapping
  const statusColors = {
    correct: 'bg-green-100 text-green-800',
    incorrect: 'bg-red-100 text-red-800',
    notPlayed: 'bg-gray-100 text-gray-800'
  } as const;

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
        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Melody Status:</h2>
            <div className="flex gap-4">
              <div className={`px-4 py-2 rounded-md ${
                isMelodyCorrect 
                  ? isCorrectFirstTry
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isMelodyCorrect 
                  ? isCorrectFirstTry 
                    ? 'Perfect! Ready for Next Melody! 🎯✨' 
                    : 'Completed Correctly! 🎉' 
                  : 'In Progress...'}
              </div>
              <div className={`px-4 py-2 rounded-md ${
                isCorrectFirstTry 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isCorrectFirstTry ? 'Perfect First Try! 🌟' : 'Made Mistakes'}
              </div>
              <div className={`px-4 py-2 rounded-md ${
                increaseScore
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {increaseScore ? 'Score Will Increase! 🏆' : 'No Score Increase'}
              </div>
            </div>
          </div>
        </div>

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
                </div>
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
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Note Comparison</h2>
              <button
                onClick={compareNotes}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Compare Notes
              </button>
            </div>
            
            {comparisonResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {comparisonResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Integrated Sheet Music and Keyboard Section */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {/* Manual notes section - Moved closer to keyboard */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Manual Notes:</h2>
              <div className="flex gap-2">
                {manualNotes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {manualNotes.map((note, index) => {
                      const status = getNoteStatus(note, index, playedNotes);
                      return (
                        <div
                          key={`manual-${index}-${note.note}`}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
                        >
                          {note.note}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No notes entered yet</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
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
            ) : null}
          </div>

          {/* Played notes section - Moved closer to keyboard */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Your Played Notes:</h2>
                {playedNotes.length > 0 && (
                  <button
                    onClick={() => {
                      setPlayedNotes([]);
                      setIsMelodyCorrect(false);
                      setIsCorrectFirstTry(true);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {playedNotes.map((note, index) => (
                  <div
                    key={`played-${index}-${note.note}`}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {note.note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard controls */}
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

          {/* Keyboard */}
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