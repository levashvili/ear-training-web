'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Keyboard from '../components/Keyboard';
import { AudioEngine } from '../lib/audioEngine';
import { SAMPLE_INSTRUMENTS } from '../types/music';

// Define WebMidi types
interface MIDIMessageEvent {
  data: Uint8Array;
}

interface MIDIPort {
  type: 'input' | 'output';
  name: string;
  state: 'connected' | 'disconnected';
  id: string;
  manufacturer?: string;
  version?: string;
  onmidimessage?: (event: MIDIMessageEvent) => void;
}

interface MIDIAccess {
  inputs: Map<string, MIDIPort>;
  outputs: Map<string, MIDIPort>;
  onstatechange: (event: { port: MIDIPort }) => void;
}

declare global {
  interface Navigator {
    requestMIDIAccess(options?: { sysex: boolean }): Promise<MIDIAccess>;
  }
}

export default function MIDITestPage() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [midiStatus, setMidiStatus] = useState<string>('Checking MIDI support...');
  const [availableInputs, setAvailableInputs] = useState<string[]>([]);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [lastNote, setLastNote] = useState<{ note: string; timestamp: number } | null>(null);
  const [velocity, setVelocity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize the audioEngine instance
  const audioEngine = useCallback(() => new AudioEngine(), []);
  const memoizedAudioEngine = useMemo(audioEngine, [audioEngine]);
  const [instrumentLoaded, setInstrumentLoaded] = useState(false);

  // Load the default instrument when component mounts
  useEffect(() => {
    const loadDefaultInstrument = async () => {
      try {
        console.log('Loading default instrument...');
        await memoizedAudioEngine.loadInstrument(SAMPLE_INSTRUMENTS[0].id);
        console.log('Default instrument loaded successfully');
        setInstrumentLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading instrument:', err);
        setIsLoading(false);
      }
    };

    loadDefaultInstrument();
  }, [memoizedAudioEngine]);

  // Convert MIDI note number to note name (e.g., 60 -> 'C4')
  const midiNoteToName = (noteNumber: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = noteNames[noteNumber % 12];
    return `${noteName}${octave}`;
  };

  // Handle MIDI messages
  const handleMIDIMessage = useCallback((message: MIDIMessageEvent) => {
    const [command, note, vel] = message.data;
    const noteName = midiNoteToName(note);
    
    // Only process notes in the C4-B5 range (MIDI notes 60-83)
    if (note >= 60 && note <= 83) {
      console.log('MIDI Message:', { command, note, velocity: vel, noteName }); // Debug log
      setVelocity(vel);

      // Note on with velocity > 0
      if (command === 144 && vel > 0) {
        setActiveNotes(prev => {
          const updated = new Set(prev);
          updated.add(noteName);
          return updated;
        });
        setLastNote({ note: noteName, timestamp: Date.now() });
        // Play the note only if instrument is loaded
        if (instrumentLoaded) {
          try {
            console.log('Playing note:', noteName);
            memoizedAudioEngine.playNote(noteName);
          } catch (err) {
            console.error('Error playing note:', err);
          }
        } else {
          console.warn('Instrument not loaded yet, skipping note playback');
        }
      }
      // Note off or note on with velocity 0
      else if (command === 128 || (command === 144 && vel === 0)) {
        setActiveNotes(prev => {
          const updated = new Set(prev);
          updated.delete(noteName);
          return updated;
        });
      }
    }
  }, [memoizedAudioEngine, instrumentLoaded]);

  // Initialize MIDI access
  useEffect(() => {
    // Check browser compatibility
    const ua = navigator.userAgent;
    const browserDetails = `Browser: ${ua}`;
    setBrowserInfo(browserDetails);
    console.log('Browser details:', browserDetails);

    if (!navigator.requestMIDIAccess) {
      setMidiStatus('MIDI is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const connectMIDI = async () => {
      try {
        // Try without sysex first
        console.log('Requesting MIDI access without sysex...');
        let midiAccess = await navigator.requestMIDIAccess();
        
        // Log all ports
        console.log('MIDI Access obtained:', midiAccess);
        console.log('Input ports:', Array.from(midiAccess.inputs.entries()));
        console.log('Output ports:', Array.from(midiAccess.outputs.entries()));
        
        const inputs = Array.from(midiAccess.inputs.values());
        console.log('Available MIDI inputs:', inputs.map(input => ({
          name: input.name,
          id: input.id,
          manufacturer: input.manufacturer,
          state: input.state,
          type: input.type
        })));
        
        setAvailableInputs(inputs.map(input => 
          `${input.name} (${input.state}) [ID: ${input.id}]`
        ));
        
        if (inputs.length === 0) {
          console.log('No MIDI inputs found, trying with sysex...');
          // Try again with sysex
          midiAccess = await navigator.requestMIDIAccess({ sysex: true });
          const sysexInputs = Array.from(midiAccess.inputs.values());
          
          if (sysexInputs.length === 0) {
            setMidiStatus(`No MIDI inputs detected. Please ensure your Lumi keyboard is:
1. Powered on
2. In pairing mode
3. Paired via Bluetooth in System Settings
4. Shown in Audio MIDI Setup app`);
            return;
          }
          
          setAvailableInputs(sysexInputs.map(input => 
            `${input.name} (${input.state}) [ID: ${input.id}]`
          ));
        }

        const inputNames = inputs.map(input => input.name).join(', ');
        setMidiStatus(`MIDI available. Found inputs: ${inputNames}`);

        // Set up MIDI input handling
        midiAccess.inputs.forEach(input => {
          if (input) {
            console.log('Configuring input:', {
              name: input.name,
              id: input.id,
              manufacturer: input.manufacturer,
              state: input.state,
              type: input.type,
              version: input.version
            });
            
            input.onmidimessage = (event) => {
              if (event.data) {
                console.log('Raw MIDI message from', input.name, ':', 
                  Array.from(event.data).map(byte => byte.toString(16).padStart(2, '0')).join(' ')
                );
                handleMIDIMessage(event);
              }
            };
          }
        });

        // Listen for device connections/disconnections
        midiAccess.onstatechange = (event) => {
          if (!event.port) return;
          
          const port = event.port;
          console.log('MIDI state change:', {
            port: port.name,
            type: port.type,
            state: port.state,
            id: port.id,
            manufacturer: port.manufacturer
          });

          const isInput = port.type === 'input';
          const isConnected = port.state === 'connected';
          
          // Update available inputs
          const newInputs = Array.from(midiAccess.inputs.values());
          setAvailableInputs(newInputs.map(input => 
            `${input.name} (${input.state}) [ID: ${input.id}]`
          ));
          
          // Update status
          const status = `MIDI ${port.type} ${port.name} ${isConnected ? 'connected' : 'disconnected'}`;
          setMidiStatus(status);

          if (isInput && isConnected) {
            port.onmidimessage = (event) => {
              if (event.data) {
                console.log('Raw MIDI message from new device:', 
                  Array.from(event.data).map(byte => byte.toString(16).padStart(2, '0')).join(' ')
                );
                handleMIDIMessage(event);
              }
            };
          }
        };
      } catch (error) {
        const errorMsg = `Error accessing MIDI: ${error}. Please ensure:
1. You're using Chrome or Edge
2. Your Lumi keyboard is paired in System Settings
3. You've granted MIDI permissions to the browser
4. You've opened Audio MIDI Setup app and configured the device`;
        setMidiStatus(errorMsg);
        console.error('MIDI Error:', error);
      }
    };

    connectMIDI();
  }, [handleMIDIMessage]);

  // Convert active notes to key statuses for Keyboard component
  const keyStatuses = Object.fromEntries(
    Array.from(activeNotes).map(note => [note, 'active' as const])
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <span className="mr-2">←</span>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-8">MIDI Device Test</h1>
        </div>

        {/* MIDI Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">MIDI Status</h2>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${availableInputs.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-gray-600 whitespace-pre-line">
              {isLoading ? 'Loading instrument...' : midiStatus}
            </p>
          </div>
          
          {browserInfo && (
            <p className="text-xs text-gray-500 mt-2">{browserInfo}</p>
          )}
          
          {availableInputs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-800">Connected MIDI Devices:</h3>
              <ul className="list-disc pl-5 mt-2">
                {availableInputs.map((input, index) => (
                  <li key={index} className="text-gray-600">{input}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Active Notes</h3>
            <div className="min-h-[3rem] flex flex-col justify-center">
              <div className="flex flex-wrap gap-2">
                {Array.from(activeNotes).map(note => (
                  <span 
                    key={note} 
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${lastNote?.note === note ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}
                  >
                    {note}
                  </span>
                ))}
              </div>
              {activeNotes.size === 0 && (
                <p className="text-gray-500 text-sm italic">No keys currently pressed</p>
              )}
            </div>
            {lastNote && (
              <p className="text-sm text-gray-600 mt-2">
                Last note: {lastNote.note} (Velocity: {velocity})
              </p>
            )}
          </div>
        </div>

        {/* Keyboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="pl-6 pr-4 py-4 bg-gray-50 overflow-hidden">
            <div className="flex justify-start">
              <Keyboard 
                onKeyPress={(note) => {
                  if (instrumentLoaded) {
                    try {
                      memoizedAudioEngine.playNote(note);
                    } catch (err) {
                      console.error('Error playing note:', err);
                    }
                  }
                }}
                keyStatuses={keyStatuses}
                showInstrumentSelect={false}
                disableAudio={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 