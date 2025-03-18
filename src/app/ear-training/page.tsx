'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Keyboard from '../components/Keyboard';
import { useState, useEffect, useCallback } from 'react';
import { AudioEngine } from '../lib/audioEngine';
import { musicalPieces } from '../data/pieces';
import { MusicalPiece, Phrase } from '../types/music';
import SheetMusic from '../components/SheetMusic';

interface GameState {
  currentPieceId: string | null;
  currentPhraseId: string | null;
  playedNotes: string[];
  remainingNotes: number;
  isFirstTry: boolean;
  score: number;
  attempts: {
    pieceId: string;
    phraseId: string;
    timestamp: Date;
    isFirstTry: boolean;
    success: boolean;
    wrongNotes: {
      expected: string;
      played: string;
      position: number;
    }[];
  }[];
  firstTrySuccesses: Set<string>;
}

export default function EarTrainingPage() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [gameState, setGameState] = useState<GameState>({
    currentPieceId: null,
    currentPhraseId: null,
    playedNotes: [],
    remainingNotes: 0,
    isFirstTry: true,
    score: 0,
    attempts: [],
    firstTrySuccesses: new Set()
  });
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [currentPiece, setCurrentPiece] = useState<MusicalPiece | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'correct' | 'incorrect' | 'none'>>({});

  // Load a random phrase
  const loadRandomPhrase = useCallback(() => {
    // Pick a random piece
    const piece = musicalPieces[Math.floor(Math.random() * musicalPieces.length)];
    // Pick a random phrase from the piece
    const phrase = piece.phrases[Math.floor(Math.random() * piece.phrases.length)];
    
    setCurrentPiece(piece);
    setCurrentPhrase(phrase);
    setGameState(prev => ({
      ...prev,
      currentPieceId: piece.id,
      currentPhraseId: phrase.id,
      playedNotes: [],
      remainingNotes: phrase.notes.length,
      isFirstTry: true
    }));
    setKeyStatuses({});
  }, []);

  // Initialize game
  useEffect(() => {
    loadRandomPhrase();
  }, [loadRandomPhrase]);

  // Play the current phrase
  const playPhrase = useCallback(async () => {
    if (!currentPhrase || !audioEngine) return;
    
    try {
      await audioEngine.loadInstrument('acoustic_grand_piano');

      // Check if there were any mistakes before resetting
      const hadMistakes = gameState.playedNotes.some(
        (note, index) => note !== currentPhrase.notes[index].note
      );

      setGameState(prev => ({
        ...prev,
        playedNotes: [],
        remainingNotes: currentPhrase.notes.length,
        isFirstTry: prev.isFirstTry && !hadMistakes
      }));
      
      setKeyStatuses({});
      audioEngine.playMIDISequence(currentPhrase.notes);
    } catch (error) {
      console.error('Error playing phrase:', error);
    }
  }, [currentPhrase, audioEngine, gameState.playedNotes]);

  // Handle note played on keyboard
  const handleKeyPress = useCallback((note: string) => {
    if (!currentPhrase) return;

    if (gameState.playedNotes.length >= currentPhrase.notes.length) {
      console.log('All notes have been played. Please replay the phrase to try again.');
      return;
    }

    const expectedNote = currentPhrase.notes[gameState.playedNotes.length].note;
    const isCorrect = note === expectedNote;
    
    setKeyStatuses(prev => ({
      ...prev,
      [note]: isCorrect ? 'correct' : 'incorrect'
    }));

    setGameState(prev => {
      const newPlayedNotes = [...prev.playedNotes, note];
      const newRemainingNotes = currentPhrase.notes.length - newPlayedNotes.length;
      
      if (newPlayedNotes.length === currentPhrase.notes.length) {
        const allCorrect = newPlayedNotes.every(
          (note, i) => note === currentPhrase.notes[i].note
        );

        if (allCorrect && prev.isFirstTry) {
          prev.score += 1;
          prev.firstTrySuccesses.add(currentPhrase.id);
        }

        prev.attempts.push({
          pieceId: currentPiece?.id || '',
          phraseId: currentPhrase.id,
          timestamp: new Date(),
          isFirstTry: prev.isFirstTry,
          success: allCorrect,
          wrongNotes: newPlayedNotes
            .map((note, i) => ({
              expected: currentPhrase.notes[i].note,
              played: note,
              position: i
            }))
            .filter(n => n.expected !== n.played)
        });

        if (allCorrect) {
          setTimeout(() => {
            loadRandomPhrase();
            setTimeout(async () => {
              if (audioEngine) {
                await audioEngine.loadInstrument('acoustic_grand_piano');
                if (currentPhrase) {
                  audioEngine.playMIDISequence(currentPhrase.notes);
                }
              }
            }, 500);
          }, 1000);
        } else {
          setTimeout(() => {
            loadRandomPhrase();
          }, 1500);
        }
      }

      return {
        ...prev,
        playedNotes: newPlayedNotes,
        remainingNotes: newRemainingNotes,
        isFirstTry: prev.isFirstTry && isCorrect
      };
    });
  }, [currentPhrase, currentPiece, gameState.playedNotes.length, loadRandomPhrase, audioEngine]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <span className="mr-2">←</span>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-8">Ear Training</h1>
        </div>

        {/* Game Status Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Current Score: {gameState.score}</h2>
              <p className="text-sm text-gray-600">
                From: {currentPiece?.title || 'Loading...'} - Phrase {currentPhrase?.orderInPiece || ''}
              </p>
              <p className="text-xs text-gray-500">
                Difficulty: {currentPhrase?.difficulty}/10 | 
                Concepts: {currentPhrase?.concepts.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Integrated Sheet Music and Keyboard */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-8 border-b border-gray-100 flex items-start gap-4">
            <div className="w-[600px]">
              {currentPhrase && (
                <SheetMusic
                  melody={{
                    id: currentPhrase.id,
                    notes: currentPhrase.notes,
                    metadata: {
                      sourceFile: currentPiece?.title || '',
                      key: 'C',
                      mode: 'major',
                      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
                      range: {
                        lowest: 'C4',
                        highest: 'C5'
                      },
                      tempo: 120
                    }
                  }}
                  playedNotes={gameState.playedNotes}
                  isFirstTry={gameState.isFirstTry}
                  currentNoteIndex={gameState.playedNotes.length}
                />
              )}
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                onClick={playPhrase}
              >
                Repeat
              </button>
              <button 
                className="px-4 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                onClick={loadRandomPhrase}
              >
                Skip
              </button>
            </div>
          </div>
          <div className="pl-6 pr-4 py-4 bg-gray-50 overflow-hidden">
            <div className="flex justify-start">
              <Keyboard 
                onKeyPress={handleKeyPress}
                keyStatuses={keyStatuses}
                melodyNotes={currentPhrase?.notes.map(n => n.note) || []}
                startingNote={currentPhrase?.notes[0]?.note}
                showInstrumentSelect={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 