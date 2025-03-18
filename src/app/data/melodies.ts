import { MelodySegment } from '../types/melody';

// For now, we'll create some simple melodies manually
// Later we'll extract these from MIDI files
export const sampleMelodies: MelodySegment[] = [
  {
    id: 'melody1',
    notes: [
      { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'G4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'C5', startTime: 1800, duration: 1000, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'test_melody.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'C5'
      },
      tempo: 120
    }
  },
  {
    id: 'melody2',
    notes: [
      { note: 'E4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'D4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'C4', startTime: 1200, duration: 1000, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'test_melody2.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'E4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody3',
    notes: [
      { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'D4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'F4', startTime: 1800, duration: 500, velocity: 100 },
      { note: 'G4', startTime: 2400, duration: 1000, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'ascending_scale.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'G4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody4',
    notes: [
      { note: 'G4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'G4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 1800, duration: 500, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'alternating_thirds.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'E4',
        highest: 'G4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody5',
    notes: [
      { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'G4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'F4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 1800, duration: 500, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'jumping_melody.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'G4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody6',
    notes: [
      { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'D4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'F4', startTime: 1800, duration: 500, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'pairs_melody.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'F4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody7',
    notes: [
      { note: 'G4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'F4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'D4', startTime: 1800, duration: 500, velocity: 100 },
      { note: 'C4', startTime: 2400, duration: 1000, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'descending_scale.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'G4'
      },
      tempo: 120
    }
  },
  {
    id: 'melody8',
    notes: [
      { note: 'C4', startTime: 0, duration: 500, velocity: 100 },
      { note: 'F4', startTime: 600, duration: 500, velocity: 100 },
      { note: 'E4', startTime: 1200, duration: 500, velocity: 100 },
      { note: 'G4', startTime: 1800, duration: 500, velocity: 100 },
      { note: 'C4', startTime: 2400, duration: 1000, velocity: 100 }
    ],
    metadata: {
      sourceFile: 'zigzag_melody.mid',
      key: 'C',
      mode: 'major',
      scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      range: {
        lowest: 'C4',
        highest: 'G4'
      },
      tempo: 120
    }
  }
]; 