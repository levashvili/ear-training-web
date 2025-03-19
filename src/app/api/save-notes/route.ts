import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Note {
  note: string;
  startTime: number;
  duration: number;
  velocity: number;
}

export async function POST(request: Request) {
  try {
    const { unitId, melodyNumber, notes } = await request.json();

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'audio', 'melodies', `unit${unitId}`, `melody${melodyNumber}_notes.json`);

    // Read the existing file to preserve any additional properties
    let existingData: { notes: Note[] } = { notes: [] };
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, which is fine
      console.log('No existing file found, creating new one');
    }

    // Merge new notes with existing timing data if available
    const updatedNotes = notes.map((newNote: Note, index: number) => ({
      ...existingData.notes[index], // Preserve existing timing data if available
      ...newNote, // Override with new note data
    }));

    // Write the updated notes back to the file
    await fs.writeFile(filePath, JSON.stringify({ notes: updatedNotes }, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving notes:', error);
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
  }
} 