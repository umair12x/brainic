# Brainic Mobile App

Brainic is an Expo React Native mobile app for brain tumor MRI workflows.
It provides:

- MRI image upload and tumor prediction view
- AI-powered medical consultation chat
- A polished tab-based UI with safe-area-aware headers

## Features

- `Home` screen with app overview and quick actions
- `Predict` screen:
  - Pick MRI image from gallery
  - Capture MRI image with camera
  - Send image to backend and display prediction + confidence
- `Consult` screen:
  - Chat-style assistant UI
  - Suggested starter questions
  - Medical disclaimer banner
- Shared, consistent app header and bottom tab navigation

## Tech Stack

- Expo (`~54`)
- React Native (`0.81.5`)
- React Navigation (bottom tabs)
- `expo-image-picker` for camera/gallery image selection
- `react-native-safe-area-context` for safe layout on modern devices

## Project Structure

```text
brainic/
  App.js
  app.json
  index.js
  package.json
  assets/
  screens/
    HomePage.jsx
    PredictPage.jsx
    ConsultPage.jsx
```

## Prerequisites

- Node.js 18+ (recommended)
- npm or Bun
- Expo Go app on your phone (or Android/iOS emulator)
- A running backend API (FastAPI) accessible from your phone/emulator network

## Installation

```bash
npm install
```

Or with Bun:

```bash
bun install
```

## Run the App

```bash
npm run start
```

Then choose one:

- `a` for Android emulator
- `i` for iOS simulator (macOS)
- Scan QR code with Expo Go

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

## Backend Configuration

This app currently uses a hardcoded API base URL in:

- `screens/PredictPage.jsx`
- `screens/ConsultPage.jsx`

Update this line in both files before testing on device:

```js
const API_BASE_URL = 'http://192.168.1.x:8000';
```

Replace `192.168.1.x` with your machine's local IP where FastAPI is running.

Important:

- Do not use `localhost` when testing from a physical phone.
- Phone and backend machine must be on the same Wi-Fi network.

## Expected API Endpoints

### `POST /predict`

- Request: `multipart/form-data` with `file`
- Used by `Predict` screen
- Expected response shape:

```json
{
  "filename": "scan.jpg",
  "prediction": {
    "display_label": "Glioma Tumor",
    "confidence": 96.42
  },
  "top_predictions": [
    {
      "label": "glioma",
      "display_label": "Glioma Tumor",
      "confidence": 96.42
    }
  ]
}
```

### `POST /chat`

- Request body:

```json
{
  "message": "What are common symptoms?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

- Used by `Consult` screen
- Expected response shape:

```json
{
  "reply": "..."
}
```

## Permissions

The app requests:

- Media library permission (for gallery image picking)
- Camera permission (for taking photos)

If denied, prediction image input will not work.

## Troubleshooting

- Expo app opens but prediction/chat fails:
  - Check `API_BASE_URL`
  - Confirm backend is running and reachable on LAN
- Camera/gallery does not open in Expo Go:
  - Confirm permissions are granted
  - Ensure `expo-image-picker` is installed (already included)
- Network request errors on Android emulator:
  - Use host machine IP instead of localhost

## Scripts

From `package.json`:

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`

## Medical Notice

This application is for educational and informational use. It does not replace professional medical diagnosis, treatment, or advice.
