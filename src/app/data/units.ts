import { Unit } from '../types/units';

export const units: Unit[] = [
  {
    id: 11,
    title: 'Unit 11',
    description: 'Advanced melodic patterns',
    melodies: [
      {
        id: 'unit11-melody1',
        audioFile: '/audio/melodies/unit11/melody1.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody2',
        audioFile: '/audio/melodies/unit11/melody2.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody3',
        audioFile: '/audio/melodies/unit11/melody3.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody4',
        audioFile: '/audio/melodies/unit11/melody4.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody5',
        audioFile: '/audio/melodies/unit11/melody5.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody6',
        audioFile: '/audio/melodies/unit11/melody6.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody7',
        audioFile: '/audio/melodies/unit11/melody7.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody8',
        audioFile: '/audio/melodies/unit11/melody8.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody9',
        audioFile: '/audio/melodies/unit11/melody9.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      },
      {
        id: 'unit11-melody10',
        audioFile: '/audio/melodies/unit11/melody10.mp3',
        difficulty: 7,
        concepts: ['Advanced Intervals', 'Melodic Patterns']
      }
    ],
    isUnlocked: true, // Since this is our first unit
    stars: 0,
    requiredScore: {
      oneStar: 6,    // 60% correct
      twoStars: 8,   // 80% correct
      threeStars: 9  // 90% correct
    }
  }
]; 