import os
import json
import numpy as np
import librosa
from glob import glob
from pydub import AudioSegment

def hz_to_midi_note(freq):
    if freq <= 0: return None
    return int(round(12 * np.log2(freq/440.0) + 69))

def midi_note_to_name(midi_note):
    if midi_note is None: return None
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    note_name = notes[midi_note % 12]
    octave = (midi_note // 12) - 1
    return f"{note_name}{octave}"

def analyze_audio_file(file_path, output_path):
    print(f"\nAnalyzing file: {file_path}")
    # Load the audio file
    print("Loading audio file...")
    y, sr = librosa.load(file_path)
    
    # Extract pitch using librosa
    print("Extracting pitch...")
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    
    # Get the most prominent pitch at each time
    times = librosa.times_like(pitches)
    pitches = pitches.mean(axis=0)
    
    # Convert to MIDI notes
    print("Converting to MIDI notes...")
    midi_notes = [hz_to_midi_note(pitch) for pitch in pitches]
    
    # Group notes by duration
    notes = []
    current_note = None
    note_duration = 0
    silence_duration = 0
    silence_threshold = 5  # Number of frames to consider as a note boundary
    
    print("Processing notes...")
    for i, midi_note in enumerate(midi_notes):
        if midi_note is None:
            silence_duration += 1
            if silence_duration >= silence_threshold and current_note is not None:
                # End current note if silence is long enough
                if note_duration >= 5:  # Minimum duration to consider it a note
                    notes.append({
                        "note": midi_note_to_name(current_note),
                        "duration": note_duration * (times[1] - times[0]),
                        "startTime": times[i - note_duration]
                    })
                current_note = None
                note_duration = 0
        else:
            if current_note != midi_note:
                if current_note is not None and note_duration >= 5:
                    notes.append({
                        "note": midi_note_to_name(current_note),
                        "duration": note_duration * (times[1] - times[0]),
                        "startTime": times[i - note_duration]
                    })
                current_note = midi_note
                note_duration = 0
            note_duration += 1
            silence_duration = 0
    
    # Add the last note if it exists
    if current_note is not None and note_duration >= 5:
        notes.append({
            "note": midi_note_to_name(current_note),
            "duration": note_duration * (times[1] - times[0]),
            "startTime": times[-note_duration]
        })
    
    # Filter out None notes
    notes = [note for note in notes if note["note"] is not None]
    
    print(f"Found {len(notes)} notes")
    print(f"Saving to {output_path}")
    
    # Save the note sequence
    with open(output_path, 'w') as f:
        json.dump({"notes": notes}, f, indent=2)
    
    return notes

def process_unit_directory(unit_dir):
    print(f"\nProcessing directory: {unit_dir}")
    melody_files = glob(os.path.join(unit_dir, "melody*.mp3"))
    print(f"Found {len(melody_files)} melody files")
    
    for melody_file in sorted(melody_files):
        print(f"\nAnalyzing {melody_file}...")
        output_path = melody_file.replace('.mp3', '_notes.json')
        notes = analyze_audio_file(melody_file, output_path)
        print(f"Found {len(notes)} notes in sequence")

def main():
    print("Starting melody analysis...")
    base_dir = "../../public/audio/melodies"  # Updated path to be relative to script location
    print(f"Looking for unit directories in {base_dir}")
    unit_dirs = glob(os.path.join(base_dir, "unit*"))
    print(f"Found {len(unit_dirs)} unit directories: {unit_dirs}")
    
    for unit_dir in unit_dirs:
        process_unit_directory(unit_dir)

if __name__ == "__main__":
    main() 