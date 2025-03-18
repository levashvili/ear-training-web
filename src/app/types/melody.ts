export interface MelodyNote {
  note: string;
  duration: number;
  startTime: number;
  velocity: number;
}

export interface MelodySegment {
  id: string;
  notes: MelodyNote[];
  metadata: {
    sourceFile: string;
    key: string;
    mode: string;
    scale: string[];
    range: {
      lowest: string;
      highest: string;
    };
    tempo: number;
  };
}

export interface MelodyAttempt {
  melodyId: string;
  timestamp: Date;
  isFirstTry: boolean;
  success: boolean;
  wrongNotes: Array<{
    expected: string;
    played: string;
    position: number;
  }>;
}

export interface GameState {
  currentMelodyId: string | null;
  playedNotes: string[];
  remainingNotes: number;
  isFirstTry: boolean;
  score: number;
  attempts: MelodyAttempt[];
  firstTrySuccesses: Set<string>;
} 