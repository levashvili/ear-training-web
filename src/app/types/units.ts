export interface Melody {
  id: string;
  audioFile: string;
  difficulty: number;
  concepts?: string[];
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  melodies: Melody[];
  isUnlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  requiredScore: {
    oneStar: number;
    twoStars: number;
    threeStars: number;
  };
}

export interface UnitProgress {
  unitId: number;
  completedMelodies: string[];  // Array of melody IDs
  score: number;
  stars: 0 | 1 | 2 | 3;
  attempts: {
    melodyId: string;
    timestamp: Date;
    isFirstTry: boolean;
    success: boolean;
    wrongNotes: {
      expected: string;
      played: string;
      position: number;
    }[];
  }[];
} 