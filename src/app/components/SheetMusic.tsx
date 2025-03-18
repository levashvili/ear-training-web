'use client';

import React, { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import { MelodySegment } from '../types/melody';

interface SheetMusicProps {
  melody: MelodySegment;
  playedNotes: string[];
  isFirstTry: boolean;
  currentNoteIndex: number;
}

const SheetMusic: React.FC<SheetMusicProps> = ({
  melody,
  playedNotes,
  isFirstTry,
  currentNoteIndex
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    try {
      // Initialize VexFlow
      const width = 600;
      const height = 150;

      // Create a div for VexFlow
      const vexFlowDiv = document.createElement('div');
      vexFlowDiv.style.width = `${width}px`;
      vexFlowDiv.style.height = `${height}px`;
      containerRef.current.appendChild(vexFlowDiv);

      // Create renderer
      const renderer = new Renderer(vexFlowDiv, Renderer.Backends.SVG);
      renderer.resize(width, height);

      const context = renderer.getContext();
      context.setFont('Arial', 10);

      // Calculate number of measures needed
      const measuresNeeded = Math.ceil(melody.notes.length / 4);
      const measureWidth = 140; // Width per measure
      const totalWidth = measureWidth * measuresNeeded + 40; // Add some padding

      // Create stave with proper width
      const stave = new Stave(10, 40, totalWidth);
      stave.addClef('treble').addTimeSignature('4/4');
      stave.setContext(context).draw();

      // Create notes
      const noteElements = melody.notes.map((noteData, index) => {
        const isPlayed = index < playedNotes.length;
        const isCorrect = isPlayed && playedNotes[index] === noteData.note;
        
        const note = new StaveNote({
          keys: [noteToVexFlow(noteData.note)],
          duration: 'q'
        });

        if (!isPlayed || !isCorrect) {
          note.setStyle({
            fillStyle: 'transparent',
            strokeStyle: 'transparent'
          });
        }

        return note;
      });

      // Add notes in groups of 4
      for (let i = 0; i < noteElements.length; i += 4) {
        const measureNotes = noteElements.slice(i, Math.min(i + 4, noteElements.length));
        const measureVoice = new Voice({ numBeats: 4, beatValue: 4 });
        
        // If this is the last measure and it's not full, add rests
        while (measureNotes.length < 4) {
          measureNotes.push(new StaveNote({
            keys: ['b/4'],
            duration: 'qr'  // Quarter rest
          }));
        }
        
        measureVoice.addTickables(measureNotes);

        // Format and justify the notes for this measure
        new Formatter()
          .joinVoices([measureVoice])
          .format([measureVoice], measureWidth - 10);

        // Draw the measure
        measureVoice.draw(context, stave);
      }

      // Draw rectangles for unplayed or incorrect notes
      melody.notes.forEach((noteData, index) => {
        const isPlayed = index < playedNotes.length;
        const isCorrect = isPlayed && playedNotes[index] === noteData.note;
        const isCurrentNote = index === currentNoteIndex;
        
        if (!isPlayed || !isCorrect) {
          const note = noteElements[index];
          const bounds = note.getBoundingBox();
          const x = bounds.x;
          const y = bounds.y;
          
          // Draw rectangle
          context.save();
          context.beginPath();
          context.rect(x - 10, y - 10, 30, 30);
          context.setFillStyle(isCurrentNote && isPlayed && !isCorrect ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)');
          context.setStrokeStyle(isCurrentNote ? '#4CAF50' : '#90EE90');
          context.setLineWidth(2);
          context.fill();
          context.stroke();
          context.restore();

          // Add question mark
          const svgContainer = vexFlowDiv.querySelector('svg');
          if (svgContainer) {
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', (x - 5).toString());
            foreignObject.setAttribute('y', (y - 10).toString());
            foreignObject.setAttribute('width', '30');
            foreignObject.setAttribute('height', '30');
            
            const div = document.createElement('div');
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.color = '#666';
            div.style.fontSize = '16px';
            div.textContent = '?';
            
            foreignObject.appendChild(div);
            svgContainer.appendChild(foreignObject);
          }
        }
      });

    } catch (error) {
      console.error('Error initializing VexFlow:', error);
    }
  }, [melody, playedNotes, currentNoteIndex]);

  return (
    <div 
      ref={containerRef} 
      className="bg-white p-2 rounded-lg overflow-x-auto"
      style={{ 
        minHeight: '150px',
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative'
      }}
    />
  );
};

// Helper function to convert note to VexFlow format
function noteToVexFlow(note: string): string {
  const pitch = note.substring(0, 1).toLowerCase();
  const octave = note.substring(note.length - 1);
  return `${pitch}/${octave}`;
}

export default SheetMusic; 