import { MusicalPiece } from '../types/music';

export const musicalPieces: MusicalPiece[] = [
  {
    id: "twinkle_01",
    title: "Twinkle, Twinkle, Little Star",
    composer: "Traditional",
    difficulty: "beginner",
    phrases: [
      {
        id: "twinkle_p1",
        pieceId: "twinkle_01",
        orderInPiece: 1,
        difficulty: 1,
        concepts: ["repeated_notes", "perfect_intervals"],
        notes: [
          { note: "C4", startTime: 0, duration: 500, velocity: 100 },
          { note: "C4", startTime: 600, duration: 500, velocity: 100 },
          { note: "G4", startTime: 1200, duration: 500, velocity: 100 },
          { note: "G4", startTime: 1800, duration: 500, velocity: 100 }
        ]
      },
      {
        id: "twinkle_p2",
        pieceId: "twinkle_01",
        orderInPiece: 2,
        difficulty: 2,
        concepts: ["stepwise_motion", "perfect_intervals"],
        notes: [
          { note: "A4", startTime: 0, duration: 500, velocity: 100 },
          { note: "A4", startTime: 600, duration: 500, velocity: 100 },
          { note: "G4", startTime: 1200, duration: 1000, velocity: 100 }
        ]
      }
    ]
  },
  {
    id: "ode_to_joy",
    title: "Ode to Joy",
    composer: "Ludwig van Beethoven",
    difficulty: "beginner",
    phrases: [
      {
        id: "ode_p1",
        pieceId: "ode_to_joy",
        orderInPiece: 1,
        difficulty: 2,
        concepts: ["stepwise_motion", "repeated_notes"],
        notes: [
          { note: "E4", startTime: 0, duration: 500, velocity: 100 },
          { note: "E4", startTime: 600, duration: 500, velocity: 100 },
          { note: "F4", startTime: 1200, duration: 500, velocity: 100 },
          { note: "G4", startTime: 1800, duration: 500, velocity: 100 }
        ]
      },
      {
        id: "ode_p2",
        pieceId: "ode_to_joy",
        orderInPiece: 2,
        difficulty: 2,
        concepts: ["stepwise_motion"],
        notes: [
          { note: "G4", startTime: 0, duration: 500, velocity: 100 },
          { note: "F4", startTime: 600, duration: 500, velocity: 100 },
          { note: "E4", startTime: 1200, duration: 500, velocity: 100 },
          { note: "D4", startTime: 1800, duration: 500, velocity: 100 }
        ]
      },
      {
        id: "ode_p3",
        pieceId: "ode_to_joy",
        orderInPiece: 3,
        difficulty: 1,
        concepts: ["repeated_notes", "stepwise_motion"],
        notes: [
          { note: "C4", startTime: 0, duration: 500, velocity: 100 },
          { note: "C4", startTime: 600, duration: 500, velocity: 100 },
          { note: "D4", startTime: 1200, duration: 500, velocity: 100 },
          { note: "E4", startTime: 1800, duration: 1000, velocity: 100 }
        ]
      }
    ]
  },
  {
    id: "mary_lamb",
    title: "Mary Had a Little Lamb",
    composer: "Traditional",
    difficulty: "beginner",
    phrases: [
      {
        id: "mary_p1",
        pieceId: "mary_lamb",
        orderInPiece: 1,
        difficulty: 1,
        concepts: ["stepwise_motion", "repeated_notes"],
        notes: [
          { note: "E4", startTime: 0, duration: 500, velocity: 100 },
          { note: "D4", startTime: 600, duration: 500, velocity: 100 },
          { note: "C4", startTime: 1200, duration: 500, velocity: 100 },
          { note: "D4", startTime: 1800, duration: 500, velocity: 100 }
        ]
      },
      {
        id: "mary_p2",
        pieceId: "mary_lamb",
        orderInPiece: 2,
        difficulty: 1,
        concepts: ["repeated_notes"],
        notes: [
          { note: "E4", startTime: 0, duration: 500, velocity: 100 },
          { note: "E4", startTime: 600, duration: 500, velocity: 100 },
          { note: "E4", startTime: 1200, duration: 1000, velocity: 100 }
        ]
      }
    ]
  }
]; 