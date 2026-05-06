# Brainic

Brainic is an Expo React Native app for MRI-based brain tumor prediction and medical consultation.

## App flow

1. Open the app on the Home screen.
2. Go to Predict to choose an MRI image from the gallery or capture one with the camera.
3. Send the image to the backend and view the prediction with confidence values.
4. Go to Consult to ask follow-up medical questions in a chat-style interface.

## Features

- Clean tab-based navigation
- Home screen with a short overview and quick actions
- Predict screen for gallery upload or camera capture
- AI consultation screen for medical Q&A
- Safe-area aware layout and keyboard-friendly consult screen

## Permissions

The app requests the following permissions:

- Camera access for taking photos
- Photo library / storage access for selecting images
- Internet access for API requests

## Tech stack

- Expo SDK 54
- React Native
- React Navigation bottom tabs
- expo-image-picker for camera and gallery selection
- expo-font with Inter typography for a clean medical-style UI
- FastAPI backend for prediction and chat endpoints

## Project structure

- App.js
- app.json
- index.js
- package.json
- screens/HomePage.jsx
- screens/PredictPage.jsx
- screens/ConsultPage.jsx

## Setup

Install dependencies:

```bash
npm install
```

Or with Bun:

```bash
bun install
```

## Run the app

Start Expo:

```bash
npm run start
```

Then open the app on Android, iOS, or Expo Go.

You can also run:

```bash
npm run android
npm run ios
npm run web
```

## Backend configuration

The app reads the API base URL from `EXPO_PUBLIC_API_BASE_URL` in `app.json`.

If needed, update it to point to your FastAPI server, for example:

```json
"extra": {
  "EXPO_PUBLIC_API_BASE_URL": "http://192.168.1.x:8000"
}
```

Use your machine's LAN IP when testing on a physical phone.

## API endpoints

### `POST /predict`

- Accepts `multipart/form-data`
- File field name: `file`
- Returns the predicted tumor class, confidence, and top predictions

### `POST /chat`

- Accepts JSON with `message` and `history`
- Returns a text reply for the consult assistant

## Notes

- Gallery picking uses `expo-image-picker`
- Camera and media permissions must be granted for image input to work
- The consult screen is keyboard aware and should keep the input visible while typing

## Troubleshooting

- If the backend is unreachable, verify the IP address in `app.json`
- Do not use `localhost` on a physical device
- Make sure the phone and backend computer are on the same network
- If image picking does not work, check camera and photo permissions
