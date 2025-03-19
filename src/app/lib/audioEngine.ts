'use client';

import Soundfont, { Player, InstrumentName } from 'soundfont-player';

interface IAudioEngine {
  loadInstrument(instrumentName: InstrumentName): Promise<void>;
  playNote(note: string | number, duration?: number): void;
  stopNote(note: string): void;
  stopAll(): void;
  playMIDISequence(notes: Array<{ note: string; startTime: number; duration: number; velocity: number }>): void;
  setPlaybackSpeed(speed: number): void;
  getPlaybackSpeed(): number;
  onSongEnd?: () => void;
}

export class AudioEngine implements IAudioEngine {
  private ctx: AudioContext | null = null;
  private currentInstrument: Player | null = null;
  private currentInstrumentName: string | null = null;
  private activeNotes: Set<string> = new Set();
  onSongEnd?: () => void;
  private activeTimeouts: NodeJS.Timeout[] = [];
  private playbackRate: number = 1.0;

  constructor() {
    // AudioContext will be initialized when needed
  }

  private initializeAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async loadInstrument(instrumentName: InstrumentName): Promise<void> {
    if (this.currentInstrumentName === instrumentName && this.currentInstrument) {
      return;
    }

    const ctx = this.initializeAudioContext();
    if (!ctx) {
      throw new Error('AudioContext could not be initialized');
    }

    try {
      console.log(`Loading instrument: ${instrumentName}`);
      const soundfont = Soundfont(ctx);
      this.currentInstrument = await soundfont.instrument(instrumentName, {
        gain: 2.0 // Increase gain to match melody volume
      });
      this.currentInstrumentName = instrumentName;
      console.log(`Successfully loaded instrument: ${instrumentName}`);
    } catch (error) {
      console.error(`Failed to load instrument ${instrumentName}:`, error);
      throw error;
    }
  }

  playNote(note: string | number, duration?: number): void {
    if (!this.currentInstrument) {
      console.warn('No instrument loaded');
      return;
    }

    try {
      // If the note is already in scientific notation, use it directly
      const scientificNote = typeof note === 'string' && /^[A-G][#b]?\d$/.test(note)
        ? note
        : this.midiNoteToScientific(note);
      
      console.log(`Playing note: ${scientificNote} (original: ${note})`);
      
      // Add the note to activeNotes when playing
      this.activeNotes.add(scientificNote);
      
      // Wrap the play call in a Promise to catch and handle the midiToFreq error
      Promise.resolve()
        .then(() => {
          if (this.currentInstrument) {
            return this.currentInstrument.play(scientificNote);
          }
        })
        .catch(error => {
          // Ignore the midiToFreq error since it doesn't affect functionality
          if (!error.toString().includes('midiToFreq')) {
            console.error('Error playing note:', error);
          }
        });
    } catch (error) {
      // Handle synchronous errors
      console.error(`Failed to play note ${note}:`, error);
    }
  }

  private midiNoteToScientific(midiNote: number | string): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // If it's already in scientific notation, return as is
    if (typeof midiNote === 'string' && /^[A-G][#b]?\d$/.test(midiNote)) {
      return midiNote;
    }

    // Convert string to number if needed
    const noteNumber = typeof midiNote === 'string' ? parseInt(midiNote, 10) : midiNote;
    if (isNaN(noteNumber)) {
      throw new Error(`Invalid MIDI note: ${midiNote}`);
    }

    const octave = Math.floor((noteNumber - 12) / 12);
    const noteIndex = (noteNumber - 12) % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }

  stopNote(note: string): void {
    if (!this.currentInstrument) {
      return;
    }

    try {
      const scientificNote = typeof note === 'string' && /^[A-G][#b]?\d$/.test(note)
        ? note
        : this.midiNoteToScientific(note);
        
      this.currentInstrument.stop(scientificNote);
      this.activeNotes.delete(scientificNote);
    } catch (error) {
      console.error(`Failed to stop note ${note}:`, error);
    }
  }

  stopAll(): void {
    if (!this.currentInstrument) {
      return;
    }

    try {
      // Clear all scheduled timeouts
      this.activeTimeouts.forEach(clearTimeout);
      this.activeTimeouts = [];
      
      // Call stop() without any arguments to stop all notes
      this.currentInstrument.stop();
      this.activeNotes.clear();
    } catch (error) {
      // If the above fails, try stopping each note individually
      try {
        this.activeNotes.forEach(note => {
          this.currentInstrument?.stop(note);
        });
        this.activeNotes.clear();
      } catch (fallbackError) {
        console.error('Failed to stop all notes:', fallbackError);
      }
    }
  }

  setPlaybackSpeed(speed: number) {
    if (speed < 0.25 || speed > 2) {
      throw new Error('Playback speed must be between 0.25 and 2');
    }
    this.playbackRate = speed;
  }

  getPlaybackSpeed(): number {
    return this.playbackRate;
  }

  playMIDISequence(notes: Array<{ note: string; startTime: number; duration: number; velocity: number }>): void {
    if (!this.currentInstrument || !this.ctx) return;

    // Stop any currently playing notes
    this.stopAll();
    console.log('Playing sequence:', notes);

    // Keep track of scheduled timeouts so we can clear them if needed
    const timeouts: NodeJS.Timeout[] = [];

    notes.forEach(({ note, startTime, duration, velocity }) => {
      // Convert note to scientific notation if needed
      const scientificNote = /^[A-G][#b]?\d$/.test(note) ? note : this.midiNoteToScientific(note);
      
      // Adjust timing based on playback speed
      const adjustedStartTime = startTime / this.playbackRate;
      const adjustedDuration = duration / this.playbackRate;
      
      console.log(`Scheduling note ${scientificNote} at ${adjustedStartTime}ms (speed: ${this.playbackRate}x)`);

      const timeout = setTimeout(() => {
        console.log(`Playing note ${scientificNote}`);
        if (this.currentInstrument) {
          Promise.resolve()
            .then(() => this.currentInstrument?.play(scientificNote, adjustedDuration / 1000))
            .catch(error => {
              if (!error.toString().includes('midiToFreq')) {
                console.error(`Failed to play note ${scientificNote}:`, error);
              }
            });
        }
      }, adjustedStartTime);

      timeouts.push(timeout);
    });

    // Schedule the onSongEnd callback
    const lastNote = notes[notes.length - 1];
    const sequenceEndTime = (lastNote.startTime + lastNote.duration) / this.playbackRate;
    
    if (this.onSongEnd) {
      const endTimeout = setTimeout(() => {
        // Clear all timeouts
        timeouts.forEach(clearTimeout);
        // Stop all notes
        this.stopAll();
        // Call the callback
        this.onSongEnd?.();
      }, sequenceEndTime);
      timeouts.push(endTimeout);
    }

    // Store timeouts so they can be cleared if needed
    this.activeTimeouts = timeouts;
  }
} 