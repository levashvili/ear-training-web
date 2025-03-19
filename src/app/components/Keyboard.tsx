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
  baseOctave?: number; // New prop for base octave
  onOctaveChange?: (octave: number) => void; // New prop for octave change handler
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
  disableAudio = false,
  baseOctave = 4, // Default to octave 4
  onOctaveChange
}) => {
  // Memoize the audioEngine instance
  const audioEngine = useCallback(() => new AudioEngine(), []);
  const memoizedAudioEngine = useMemo(audioEngine, [audioEngine]);
  
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(SAMPLE_INSTRUMENTS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the notes in order, with their positions (using baseOctave)
  const keys: KeyDefinition[] = [
    { note: `C${baseOctave}`, isBlack: false },
    { note: `C#${baseOctave}`, isBlack: true },
    { note: `D${baseOctave}`, isBlack: false },
    { note: `D#${baseOctave}`, isBlack: true },
    { note: `E${baseOctave}`, isBlack: false },
    { note: `F${baseOctave}`, isBlack: false },
    { note: `F#${baseOctave}`, isBlack: true },
    { note: `G${baseOctave}`, isBlack: false },
    { note: `G#${baseOctave}`, isBlack: true },
    { note: `A${baseOctave}`, isBlack: false },
    { note: `A#${baseOctave}`, isBlack: true },
    { note: `B${baseOctave}`, isBlack: false },
    { note: `C${baseOctave + 1}`, isBlack: false },
    { note: `C#${baseOctave + 1}`, isBlack: true },
    { note: `D${baseOctave + 1}`, isBlack: false },
    { note: `D#${baseOctave + 1}`, isBlack: true },
    { note: `E${baseOctave + 1}`, isBlack: false },
    { note: `F${baseOctave + 1}`, isBlack: false },
    { note: `F#${baseOctave + 1}`, isBlack: true },
    { note: `G${baseOctave + 1}`, isBlack: false },
    { note: `G#${baseOctave + 1}`, isBlack: true },
    { note: `A${baseOctave + 1}`, isBlack: false },
    { note: `A#${baseOctave + 1}`, isBlack: true },
    { note: `B${baseOctave + 1}`, isBlack: false }
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
    <div className="flex flex-col items-start gap-4">
      {/* Instrument and Octave Controls */}
      <div className="flex items-center gap-4 w-full">
        {showInstrumentSelect && (
          <select
            value={selectedInstrument.id}
            onChange={(e) => {
              const instrument = SAMPLE_INSTRUMENTS.find(i => i.id === e.target.value);
              if (instrument) setSelectedInstrument(instrument);
            }}
            className="px-3 py-1 border rounded text-sm"
          >
            {SAMPLE_INSTRUMENTS.map(instrument => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </select>
        )}
        
        {/* Octave Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOctaveChange?.(baseOctave - 1)}
            disabled={baseOctave <= 2} // Prevent going too low
            className={`px-3 py-1 rounded text-sm ${
              baseOctave <= 2
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            -
          </button>
          <span className="text-sm font-semibold text-gray-800">
            Octave {baseOctave}
          </span>
          <button
            onClick={() => onOctaveChange?.(baseOctave + 1)}
            disabled={baseOctave >= 6} // Prevent going too high
            className={`px-3 py-1 rounded text-sm ${
              baseOctave >= 6
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* Keyboard Layout */}
      <div className="relative inline-flex">
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
  );
};

export default Keyboard; 