const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration
const config = {
  silenceThreshold: '-25dB',    // Threshold for silence detection
  silenceDuration: '1.5',       // Increased to 1.5 seconds to avoid splitting within melodies
  minMelodyDuration: 0.5,         // Minimum melody duration
  outputFormat: 'mp3',
  trimSilenceThreshold: '-35dB',
  trimSilenceDuration: '0.1',   // Keep short duration for trimming within melodies
};

async function convertToWav(inputFile) {
  const wavFile = inputFile.replace(/\.[^/.]+$/, '.wav');
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .toFormat('wav')
      .on('error', reject)
      .on('end', () => resolve(wavFile))
      .save(wavFile);
  });
}

async function trimSilence(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioFilters([
        `silenceremove=start_periods=1:start_threshold=${config.trimSilenceThreshold}:start_duration=${config.trimSilenceDuration}`,
        `areverse`,
        `silenceremove=start_periods=1:start_threshold=${config.trimSilenceThreshold}:start_duration=${config.trimSilenceDuration}`,
        `areverse`
      ])
      .output(outputFile)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

async function detectSilence(inputFile) {
  return new Promise((resolve, reject) => {
    let silenceData = [];
    let currentSilence = null;

    ffmpeg(inputFile)
      .inputOption('-ac 1') // Convert to mono
      .audioFilters(`silencedetect=noise=${config.silenceThreshold}:d=${config.silenceDuration}`)
      .format('null')
      .output('-')
      .on('error', reject)
      .on('stderr', (stderr) => {
        const lines = stderr.split('\n');
        lines.forEach(line => {
          if (line.includes('silence_start:')) {
            const start = parseFloat(line.split('silence_start: ')[1]);
            currentSilence = { start };
            silenceData.push(currentSilence);
          } else if (line.includes('silence_end:')) {
            const parts = line.split('silence_end: ')[1].split(' ');
            const end = parseFloat(parts[0]);
            if (currentSilence) {
              currentSilence.end = end;
              currentSilence = null;
            }
          }
        });
      })
      .on('end', () => {
        // Filter out invalid silence periods and sort them
        silenceData = silenceData
          .filter(s => s.start != null && s.end != null)
          .sort((a, b) => a.start - b.start);
        resolve(silenceData);
      })
      .run();
  });
}

async function splitAudioFile(inputFile, outputDir, startUnit, melodyCounts) {
  let currentUnit = startUnit;
  let totalMelodiesProcessed = 0;
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log('Converting to WAV format...');
    const wavFile = await convertToWav(inputFile);

    console.log('Detecting silence periods...');
    const silenceData = await detectSilence(wavFile);

    console.log(`\nDetected ${silenceData.length} silence periods`);
    silenceData.forEach((s, i) => {
      console.log(`Silence ${i + 1}: ${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s (duration: ${(s.end - s.start).toFixed(2)}s)`);
    });

    let currentUnitMelodyCount = 0;
    let currentUnitIndex = 0;

    // Create first unit directory
    let unitDir = path.join(outputDir, `unit${currentUnit}`);
    if (!fs.existsSync(unitDir)) {
      fs.mkdirSync(unitDir, { recursive: true });
    }

    // Process segments between silences
    for (let i = 0; i < silenceData.length - 1; i++) {
      const start = silenceData[i].end;
      const end = silenceData[i + 1].start;
      const duration = end - start;

      if (duration < config.minMelodyDuration) {
        console.log(`\nSkipping segment ${i + 1} - too short (${duration.toFixed(2)}s)`);
        continue;
      }

      // Check if we need to move to next unit
      if (currentUnitMelodyCount >= melodyCounts[currentUnitIndex]) {
        currentUnit++;
        currentUnitMelodyCount = 0;
        currentUnitIndex++;

        if (currentUnitIndex >= melodyCounts.length) {
          console.log('\nAll units processed!');
          break;
        }

        // Create new unit directory
        unitDir = path.join(outputDir, `unit${currentUnit}`);
        if (!fs.existsSync(unitDir)) {
          fs.mkdirSync(unitDir, { recursive: true });
        }
      }

      const melodyNumber = currentUnitMelodyCount + 1;
      const tempFile = path.join(unitDir, `temp_melody${melodyNumber}.${config.outputFormat}`);
      const finalFile = path.join(unitDir, `melody${melodyNumber}.${config.outputFormat}`);

      console.log(`\nProcessing Unit ${currentUnit}, Melody ${melodyNumber}`);
      console.log(`Segment duration: ${duration.toFixed(2)}s`);

      // Extract the segment
      await new Promise((resolve, reject) => {
        ffmpeg(wavFile)
          .setStartTime(start)
          .setDuration(duration + 0.3)  // Add 0.3s to duration to include more of the ending
          .output(tempFile)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Trim silence from the segment
      await trimSilence(tempFile, finalFile);
      fs.unlinkSync(tempFile);

      console.log(`Created ${finalFile}`);
      
      currentUnitMelodyCount++;
      totalMelodiesProcessed++;
    }

    // Clean up temporary WAV file
    fs.unlinkSync(wavFile);

    console.log('\nProcessing complete!');
    console.log(`Total melodies processed: ${totalMelodiesProcessed}`);
    console.log(`Units created: ${currentUnitIndex + 1}`);
  } catch (error) {
    console.error('Error during processing:', error);
    throw error;
  }
}

const inputFile = process.argv[2];
const outputDir = process.argv[3] || 'public/audio/melodies';
const startUnit = parseInt(process.argv[4]);
const melodyCounts = process.argv[5].split(',').map(num => parseInt(num.trim()));

if (!inputFile || !startUnit || !melodyCounts.length) {
  console.error(`
Usage: node split_melodies.js <input_file> [output_dir] <start_unit> <melody_counts>

Example: node split_melodies.js recording.m4a public/audio/melodies 11 "10,10,10"
This will process the recording.m4a file and create:
- Unit 11 with 10 melodies
- Unit 12 with 10 melodies
- Unit 13 with 10 melodies
`);
  process.exit(1);
}

splitAudioFile(inputFile, outputDir, startUnit, melodyCounts)
  .catch(error => console.error('Error:', error)); 