'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AudioEngine } from '../lib/audioEngine';
import { SAMPLE_INSTRUMENTS, Instrument } from '../types/music';

interface MelodyPlayerProps {
  melody: {
    notes: Array<{ note: string; startTime: number; duration: number; velocity: number }>;
  };
  onPlaybackComplete?: () => void;
}

export default function MelodyPlayer({ melody, onPlaybackComplete }: MelodyPlayerProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(SAMPLE_INSTRUMENTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
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
    onPlaybackComplete?.();
  }, [onPlaybackComplete]);

  useEffect(() => {
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
        audioEngine.setPlaybackSpeed(playbackSpeed);
        audioEngine.playMIDISequence(melody.notes);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing melody:', err);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      // Restart the melody with new speed
      audioEngine.stopAll();
      audioEngine.setPlaybackSpeed(speed);
      audioEngine.playMIDISequence(melody.notes);
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
          value={playbackSpeed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          disabled={isLoading}
        >
          <option value={0.5}>0.5x Speed</option>
          <option value={0.75}>0.75x Speed</option>
          <option value={1}>Normal Speed</option>
          <option value={1.25}>1.25x Speed</option>
          <option value={1.5}>1.5x Speed</option>
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
    </div>
  );
} 