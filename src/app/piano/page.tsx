'use client';

import Link from 'next/link';
import Keyboard from '../components/Keyboard';
import MIDIPlayer from '../components/MIDIPlayer';

export default function PianoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <span className="mr-2">←</span>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-8">Piano & MIDI Player</h1>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive Keyboard</h2>
            <Keyboard />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">MIDI Player</h2>
            <MIDIPlayer />
          </div>
        </div>
      </div>
    </div>
  );
} 