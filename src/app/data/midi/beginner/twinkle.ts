import { MIDIFile } from '../../../types/music';

export const twinkleMIDI: MIDIFile = {
  id: 'twinkle',
  name: 'Twinkle, Twinkle, Little Star',
  difficulty: 'beginner',
  tempo: 120,
  timeSignature: [4, 4],
  notes: [
    { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
    { note: 'C4', startTime: 600, duration: 500, velocity: 100 },
    { note: 'G4', startTime: 1200, duration: 500, velocity: 100 },
    { note: 'G4', startTime: 1800, duration: 500, velocity: 100 },
    { note: 'A4', startTime: 2400, duration: 500, velocity: 100 },
    { note: 'A4', startTime: 3000, duration: 500, velocity: 100 },
    { note: 'G4', startTime: 3600, duration: 800, velocity: 100 },
    { note: 'F4', startTime: 4800, duration: 500, velocity: 100 },
    { note: 'F4', startTime: 5400, duration: 500, velocity: 100 },
    { note: 'E4', startTime: 6000, duration: 500, velocity: 100 },
    { note: 'E4', startTime: 6600, duration: 500, velocity: 100 },
    { note: 'D4', startTime: 7200, duration: 500, velocity: 100 },
    { note: 'D4', startTime: 7800, duration: 500, velocity: 100 },
    { note: 'C4', startTime: 8400, duration: 800, velocity: 100 }
  ]
}; 