# Speech-to-Text Functionality

This document describes the speech-to-text functionality implemented in the Cymbal Bank application.

## Overview

The application includes speech-to-text capabilities that allow users to:
- Click a microphone button to start voice recording
- Click a stop button (square icon) to stop recording
- See the transcribed text appear in the input field
- Edit the transcript before sending
- Send the message manually when ready

## How It Works

### 1. Voice Input Button
- **Microphone Icon**: Click to start voice recording
- **Square Icon**: Click to stop recording (appears while recording)
- The button shows visual feedback with red coloring when actively recording

### 2. Recording Process
- Click the microphone button to start recording
- Speak your message clearly
- Click the square button to stop recording
- The transcribed text appears in the input field

### 3. Editing and Sending
- Edit the transcript in the input field if needed
- Click the "Send" button when ready to send
- The message is sent to the selected agent

## Technical Implementation

### Components
- **SpeechToText**: Main component handling speech recognition
- **HomePage**: Integration with the chat interface

### Features
- Uses Web Speech API for browser-native speech recognition
- Simple start/stop recording (no continuous listening)
- No interim results or auto-send functionality
- Clean, simple user interface
- Error handling without showing technical details to users

### Browser Support
- **Chrome**: Full support
- **Safari**: Full support (webkitSpeechRecognition)
- **Edge**: Full support
- **Firefox**: Limited support (may require user interaction)

## Usage Tips

1. **Clear Speech**: Speak clearly and at a moderate pace
2. **Quiet Environment**: Minimize background noise for better accuracy
3. **Edit Before Send**: Review and edit the transcript before sending
4. **Simple Workflow**: Start → Speak → Stop → Edit → Send

## Troubleshooting

### No Microphone Access
- Ensure your browser has permission to access the microphone
- Check that your microphone is working in other applications

### Poor Transcription Quality
- Speak more slowly and clearly
- Reduce background noise
- Check microphone positioning

### Button Not Responding
- Ensure the application is connected to the backend
- Check browser console for error messages
- Verify microphone permissions

## Design Philosophy

The speech-to-text functionality is designed to be:
- **Simple**: Just start, speak, stop, edit, send
- **Clean**: No technical details or error messages shown to users
- **Intuitive**: Clear visual feedback with familiar icons
- **Reliable**: Focused on core functionality without complexity
