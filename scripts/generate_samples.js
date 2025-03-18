const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to generate a sine wave audio file using sox
function generateNote(note, frequency, outputPath) {
  // Changed to .wav and added -b 16 for 16-bit depth
  const command = `sox -n -r 44100 -b 16 "${outputPath}" synth 2 sine ${frequency} fade 0 2 0.5`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating ${note}: ${error}`);
        reject(error);
      } else {
        console.log(`Generated ${note}`);
        resolve();
      }
    });
  });
}

// Note frequencies (A4 = 440Hz)
const noteFrequencies = {
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'B4': 493.88,
  'C5': 523.25
};

// Generate samples for each instrument
async function generateSamples() {
  const instruments = ['piano', 'harp'];
  
  for (const instrument of instruments) {
    const outputDir = path.join(__dirname, '..', 'public', 'samples', instrument);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate notes for each instrument
    for (const [note, frequency] of Object.entries(noteFrequencies)) {
      const outputPath = path.join(outputDir, `${note}.wav`);
      try {
        await generateNote(note, frequency, outputPath);
        // Verify the file exists and has content
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
          throw new Error(`Failed to generate valid audio file for ${note}`);
        }
      } catch (error) {
        console.error(`Error generating ${note} for ${instrument}:`, error);
      }
    }
  }
}

// Check if sox is installed
exec('sox --version', (error) => {
  if (error) {
    console.error('Sox is not installed. Please install sox first:');
    console.error('On macOS: brew install sox');
    console.error('On Ubuntu/Debian: sudo apt-get install sox');
    process.exit(1);
  } else {
    generateSamples().then(() => {
      console.log('Sample generation complete');
    }).catch(error => {
      console.error('Error generating samples:', error);
    });
  }
}); 