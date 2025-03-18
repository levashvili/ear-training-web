import { MIDIFile } from '../../types/music';
import { twinkleMIDI } from './beginner/twinkle';
import { maryMIDI } from './beginner/mary';

// Export individual MIDI files
export { twinkleMIDI, maryMIDI };

// Export array of all MIDI files for use in components
export const MIDI_FILES: MIDIFile[] = [
  twinkleMIDI,
  maryMIDI,
  // Add more MIDI files here as they are created
]; 