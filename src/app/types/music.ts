import { InstrumentName } from 'soundfont-player';

export interface MIDINote {
  note: string;      // e.g., 'C4'
  velocity: number;  // 0-127
  startTime: number; // milliseconds
  duration: number;  // milliseconds
}

export interface MIDIFile {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tempo: number;
  timeSignature: [number, number];
  notes: MIDINote[];
}

export interface Instrument {
  id: InstrumentName;
  name: string;
}

// A selection of good-sounding instruments for our app
export const SAMPLE_INSTRUMENTS: Instrument[] = [
  {
    id: 'acoustic_grand_piano',
    name: 'Grand Piano'
  },
  {
    id: 'electric_piano_1',
    name: 'Electric Piano'
  },
  {
    id: 'church_organ',
    name: 'Church Organ'
  },
  {
    id: 'acoustic_guitar_nylon',
    name: 'Classical Guitar'
  },
  {
    id: 'violin',
    name: 'Violin'
  },
  {
    id: 'flute',
    name: 'Flute'
  },
  {
    id: 'choir_aahs',
    name: 'Choir'
  },
  {
    id: 'music_box',
    name: 'Music Box'
  }
];

export interface MusicalPiece {
  id: string;
  title: string;
  composer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phrases: Phrase[];
}

export interface Phrase {
  id: string;
  pieceId: string;
  notes: Note[];
  difficulty: number;  // 1-10 scale
  concepts: ConceptType[];
  orderInPiece: number;
}

export interface Note {
  note: string;      // e.g., 'C4'
  startTime: number; // in milliseconds
  duration: number;  // in milliseconds
  velocity: number;  // 0-127 for MIDI
}

export type ConceptType = 
  | 'stepwise_motion'
  | 'repeated_notes'
  | 'simple_thirds'
  | 'perfect_intervals'
  | 'scale_fragments'
  | 'arpeggios';

export interface UserProgress {
  userId: string;
  phraseId: string;
  lastPracticed: Date;
  nextReview: Date;
  accuracyHistory: number[];
  totalAttempts: number;
} 