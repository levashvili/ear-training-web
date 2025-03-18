'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Instrument, SAMPLE_INSTRUMENTS } from '../types/music';
import { MIDI_FILES } from '../data/midi';
import { AudioEngine } from '../lib/audioEngine';

export default function MIDIPlayer() {
  const [selectedMIDI, setSelectedMIDI] = useState(MIDI_FILES[0]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(SAMPLE_INSTRUMENTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEngine] = useState(() => new AudioEngine());

  useEffect(() => {
    const loadInstrument = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await audioEngine.loadInstrument(selectedInstrument.id);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading instrument:', err);
        setError('Failed to load instrument. Please try again.');
        setIsLoading(false);
      }
    };

    loadInstrument();
  }, [selectedInstrument, audioEngine]);

  // Add callback for song end
  const handleSongEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    // Subscribe to song end event
    audioEngine.onSongEnd = handleSongEnd;
    return () => {
      audioEngine.onSongEnd = undefined;
    };
  }, [audioEngine, handleSongEnd]);

  const handlePlay = () => {
    try {
      if (isPlaying) {
        audioEngine.stopAll();
        setIsPlaying(false);
      } else {
        audioEngine.playMIDISequence(selectedMIDI.notes);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing MIDI:', err);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      {error && (
        <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 items-center">
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

        <select
          className="px-3 py-2 border rounded-md"
          value={selectedMIDI.id}
          onChange={(e) => {
            const midi = MIDI_FILES.find(m => m.id === e.target.value);
            if (midi) {
              // Stop current playback when changing songs
              if (isPlaying) {
                audioEngine.stopAll();
                setIsPlaying(false);
              }
              setSelectedMIDI(midi);
            }
          }}
          disabled={isLoading}
        >
          {MIDI_FILES.map(midi => (
            <option key={midi.id} value={midi.id}>
              {midi.name} ({midi.difficulty})
            </option>
          ))}
        </select>

        <button
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={handlePlay}
          disabled={isLoading || !!error}
        >
          {isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Currently playing: {selectedMIDI.name} ({selectedInstrument.name})
      </div>
    </div>
  );
} 