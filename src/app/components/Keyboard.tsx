'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AudioEngine } from '../lib/audioEngine';
import { SAMPLE_INSTRUMENTS, Instrument } from '../types/music';

interface KeyProps {
  note: string;
  isBlack?: boolean;
  onClick?: () => void;
  status?: 'correct' | 'incorrect' | 'active' | 'none';
  label?: string;
  labelStyle?: 'default' | 'starting' | 'none';
}

const Key: React.FC<KeyProps> = ({ 
  note, 
  isBlack = false, 
  onClick, 
  status = 'none', 
  label,
  labelStyle = 'none'
}) => {
  const statusClasses = {
    correct: isBlack 
      ? 'bg-green-800 border-green-900' 
      : 'bg-green-300 border-green-400',
    incorrect: isBlack 
      ? 'bg-red-800 border-red-900' 
      : 'bg-red-300 border-red-400',
    active: isBlack 
      ? '!bg-indigo-800 !border-indigo-900' 
      : '!bg-indigo-200 !border-indigo-300',
    none: ''
  };

  const baseClasses = isBlack
    ? `w-10 h-32 -mx-5 z-10 
       bg-black hover:bg-gray-800
       shadow-[2px_2px_2px_rgba(0,0,0,0.3),-2px_2px_2px_rgba(0,0,0,0.3),inset_0_-5px_2px_rgba(255,255,255,0.05)]
       active:shadow-[1px_1px_1px_rgba(0,0,0,0.3),-1px_1px_1px_rgba(0,0,0,0.3),inset_0_-3px_2px_rgba(255,255,255,0.05)]
       active:translate-y-[2px]
       rounded-b-md
       border border-gray-900`
    : `w-14 h-48 
       bg-white hover:bg-gray-50
       border-x border-gray-300`;

  const labelClasses = {
    default: isBlack ? 'text-white' : 'text-black',
    starting: isBlack ? 'text-green-400' : 'text-green-600',
    none: 'hidden'
  };

  // Extract just the note name without octave for the label
  const displayLabel = label || note.replace(/\d+$/, '');

  return (
    <button
      className={`
        ${baseClasses}
        ${statusClasses[status]}
        relative
        transition-colors
        duration-75
        ease-in-out
      `}
      onClick={onClick}
      data-note={note}
    >
      {labelStyle !== 'none' && (
        <span className={`
          absolute bottom-4 left-1/2 -translate-x-1/2 text-base font-semibold
          ${labelClasses[labelStyle]}
        `}>
          {displayLabel}
        </span>
      )}
    </button>
  );
};

interface KeyboardProps {
  onKeyPress?: (note: string) => void;
  keyStatuses?: Record<string, 'correct' | 'incorrect' | 'active' | 'none'>;
  keyLabels?: Record<string, string>;
  melodyNotes?: string[];  // Notes that are part of the current melody
  startingNote?: string;   // The first note of the melody
  showInstrumentSelect?: boolean;  // New prop
  disableAudio?: boolean;  // Whether to disable internal audio playback
}

interface KeyDefinition {
  note: string;
  isBlack: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  keyStatuses = {},
  keyLabels = {},
  melodyNotes = [],
  startingNote,
  showInstrumentSelect = true,
  disableAudio = false
}) => {
  // Memoize the audioEngine instance
  const audioEngine = useCallback(() => new AudioEngine(), []);
  const memoizedAudioEngine = useMemo(audioEngine, [audioEngine]);
  
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(SAMPLE_INSTRUMENTS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the notes in order, with their positions (C4 to B5)
  const keys: KeyDefinition[] = [
    { note: 'C4', isBlack: false },
    { note: 'C#4', isBlack: true },
    { note: 'D4', isBlack: false },
    { note: 'D#4', isBlack: true },
    { note: 'E4', isBlack: false },
    { note: 'F4', isBlack: false },
    { note: 'F#4', isBlack: true },
    { note: 'G4', isBlack: false },
    { note: 'G#4', isBlack: true },
    { note: 'A4', isBlack: false },
    { note: 'A#4', isBlack: true },
    { note: 'B4', isBlack: false },
    { note: 'C5', isBlack: false },
    { note: 'C#5', isBlack: true },
    { note: 'D5', isBlack: false },
    { note: 'D#5', isBlack: true },
    { note: 'E5', isBlack: false },
    { note: 'F5', isBlack: false },
    { note: 'F#5', isBlack: true },
    { note: 'G5', isBlack: false },
    { note: 'G#5', isBlack: true },
    { note: 'A5', isBlack: false },
    { note: 'A#5', isBlack: true },
    { note: 'B5', isBlack: false }
  ];

  useEffect(() => {
    let mounted = true;

    const loadInstrument = async () => {
      if (!mounted || disableAudio) return;
      
      setIsLoading(true);
      setError(null);
      try {
        await memoizedAudioEngine.loadInstrument(selectedInstrument.id);
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading instrument:', err);
        if (mounted) {
          setError('Failed to load instrument');
          setIsLoading(false);
        }
      }
    };

    loadInstrument();

    return () => {
      mounted = false;
    };
  }, [selectedInstrument, memoizedAudioEngine, disableAudio]);

  const handleKeyPress = (note: string) => {
    try {
      if (!disableAudio) {
        memoizedAudioEngine.playNote(note);
      }
      onKeyPress?.(note);
    } catch (err) {
      console.error('Error playing note:', err);
      setError('Failed to play note');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && !disableAudio && (
        <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {showInstrumentSelect && !disableAudio && (
        <div className="mb-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={selectedInstrument.id}
            onChange={(e) => {
              const instrument = SAMPLE_INSTRUMENTS.find(i => i.id === e.target.value);
              if (instrument) setSelectedInstrument(instrument);
            }}
            disabled={isLoading}
          >
            {SAMPLE_INSTRUMENTS.map(instrument => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative flex justify-center items-center p-4">
        <div className="inline-flex relative">
          {keys.map(({ note, isBlack }) => (
            <Key
              key={note}
              note={note}
              isBlack={isBlack}
              onClick={() => handleKeyPress(note)}
              status={keyStatuses[note] || 'none'}
              label={keyLabels[note]}
              labelStyle={
                note === startingNote
                  ? 'starting'
                  : melodyNotes.includes(note)
                    ? 'default'
                    : 'none'
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Keyboard; 