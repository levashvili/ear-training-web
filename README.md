# Ear Training Web App

A comprehensive web application for music education and ear training, built with Next.js and TypeScript.

## Features

- 🎵 Unit-based Learning System: Progress through structured melodic exercises
- 🎹 Virtual Piano: Interactive piano with MIDI device support
- 👂 Ear Training: Practice interval recognition and chord identification
- 🎛️ MIDI Device Support: Connect and use your MIDI keyboard
- 🎼 Sheet Music Display: Visual representation of musical pieces

## Tech Stack

- Next.js
- TypeScript
- Framer Motion for animations
- Web MIDI API
- Web Audio API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/levashvili/ear-training-web.git
   cd ear-training-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## MIDI Device Support

The application supports MIDI devices through the Web MIDI API. To use a MIDI keyboard:

1. Connect your MIDI keyboard to your computer
2. Make sure it's properly paired if it's a Bluetooth MIDI device
3. Navigate to the MIDI Test page to verify the connection
4. Grant MIDI access when prompted by the browser

## Project Structure

- `/src/app/components` - Reusable React components
- `/src/app/data` - Music data, MIDI files, and unit definitions
- `/src/app/lib` - Utility functions and audio engine
- `/src/app/types` - TypeScript type definitions
- `/public/samples` - Audio samples for different instruments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
