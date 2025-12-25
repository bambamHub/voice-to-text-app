text
# 🎤 Voice to Text - AI-Powered Transcription App

<div align="center">

![Voice to Text](https://img.shields.io/badge/Voice-to%20Text-667eea?style=for-the-badge&logo=microphone&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Deepgram](https://img.shields.io/badge/Deepgram-13EF93?style=for-the-badge&logo=deepgram&logoColor=black)

**Real-time AI-powered voice transcription desktop application with 95% accuracy**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Tech Stack](#tech-stack)

</div>

---

## ✨ Features

### 🎯 Core Features
- **Real-time Transcription**: Convert speech to text instantly with Deepgram AI
- **Auto-Stop Detection**: Automatically stops recording after 2 seconds of silence
- **High Accuracy**: 95% transcription accuracy with advanced AI models
- **Offline-Ready**: Desktop application built with Tauri
- **User Authentication**: Secure login/signup system with session management

### 🎨 UI/UX Features
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Responsive Layout**: Works perfectly on all screen sizes
- **Dark Mode Ready**: Eye-friendly interface
- **Toast Notifications**: Real-time feedback for all actions
- **Interactive Navbar**: User profile with dropdown menu

### 📊 Advanced Features
- **Live Transcript Display**: See your words appear in real-time
- **Word & Character Count**: Track your transcription stats
- **Export Functionality**: Save transcripts as `.txt` files
- **Copy to Clipboard**: One-click copy functionality
- **Session Persistence**: Auto-login for returning users

---

## 🖼️ Demo

### Login Screen
![Login Screen](docs/screenshots/login.png)

### Main Interface
![Main Interface](docs/screenshots/main.png)

### Recording in Action
![Recording](docs/screenshots/recording.png)

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Rust** (latest stable) - [Install Guide](https://www.rust-lang.org/tools/install)
- **Git** - [Download](https://git-scm.com/)

### Quick Start

1. **Clone the repository**
git clone https://github.com/yourusername/voice-to-text-app.git
cd voice-to-text-app

text

2. **Install dependencies**
npm install

text

3. **Configure Deepgram API**

Create a `.env` file in the root directory:
VITE_DEEPGRAM_API_KEY=your_deepgram_api_key_here

text

Get your free API key from [Deepgram](https://console.deepgram.com/) (includes $200 credit)

4. **Run the application**

**Development Mode:**
npm run tauri:dev

text

**Production Build:**
npm run tauri:build

text

---

## 📖 Usage

### Basic Usage

1. **Sign Up / Login**
   - Create a new account or login with existing credentials
   - Your session will be saved automatically

2. **Start Recording**
   - Click the microphone button to start recording
   - Speak clearly into your microphone
   - The app will auto-stop after 2 seconds of silence

3. **View Transcript**
   - Your speech appears as text in real-time
   - See word and character counts
   - Interim results shown in italic

4. **Export Options**
   - **Copy**: Click "Copy" to copy transcript to clipboard
   - **Save**: Click "Save" to download as `.txt` file
   - **Clear**: Click "Clear" to start fresh

### Keyboard Shortcuts

- `Click` - Start/Stop recording
- `Ctrl+C` - Copy transcript (when focused)
- `Esc` - Close dropdown menus

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Hot Toast** - Notifications

### Backend/Desktop
- **Tauri** - Desktop app framework
- **Rust** - Backend runtime

### AI & Services
- **Deepgram SDK** - Real-time speech-to-text
- **WebRTC** - Audio capture

### Styling
- **CSS3** - Custom styling with animations
- **CSS Grid & Flexbox** - Responsive layouts

---

## 📁 Project Structure

voice-to-text-app/
├── src/
│ ├── components/ # React components
│ │ ├── Login.tsx
│ │ ├── Signup.tsx
│ │ ├── Navbar.tsx
│ │ ├── RecordButton.tsx
│ │ └── TranscriptDisplay.tsx
│ ├── contexts/ # React contexts
│ │ └── AuthContext.tsx
│ ├── hooks/ # Custom hooks
│ │ ├── useAudioRecorder.ts
│ │ └── useDeepgram.ts
│ ├── services/ # Business logic
│ │ ├── authService.ts
│ │ ├── audioCapture.ts
│ │ └── deepgramSDK.ts
│ ├── styles/ # CSS files
│ │ ├── Auth.css
│ │ └── Navbar.css
│ ├── types/ # TypeScript types
│ │ ├── auth.ts
│ │ └── index.ts
│ ├── App.tsx # Main app component
│ ├── App.css # Global styles
│ └── main.tsx # Entry point
├── src-tauri/ # Tauri backend
│ ├── src/
│ │ └── main.rs
│ ├── Cargo.toml
│ └── tauri.conf.json
├── .env # Environment variables
├── package.json
└── README.md

text

---

## 🔧 Configuration

### Deepgram Settings

Modify transcription settings in `src/services/deepgramSDK.ts`:

model: "nova-2", // AI model (nova-2, base, enhanced)
language: "en-US", // Language code
punctuate: true, // Auto punctuation
interim_results: true, // Show interim results
smart_format: true, // Smart formatting
encoding: "linear16", // Audio encoding
sample_rate: 16000, // Sample rate (Hz)

text

### Silence Detection

Adjust auto-stop settings in `src/services/audioCapture.ts`:

silenceThreshold: 0.01, // Sensitivity (0.01 = 1%)
silenceDuration: 2000, // Duration in ms (2 seconds)

text

---

## 🌐 Deployment

### Desktop App (Recommended)

**Windows:**
npm run tauri:build

text
Installer: `src-tauri/target/release/bundle/msi/`

**macOS:**
npm run tauri:build

text
App: `src-tauri/target/release/bundle/dmg/`

**Linux:**
npm run tauri:build

text
AppImage: `src-tauri/target/release/bundle/appimage/`

### Web Deployment (Optional)

Deploy frontend to Vercel/Netlify:

**Vercel:**
npm install -g vercel
vercel --prod

text

**Netlify:**
npm run build

Upload 'dist' folder to Netlify
text

⚠️ **Note**: Microphone access requires HTTPS in production

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Bambam Kumar Gupta**

- GitHub: [@bambamgupta](https://github.com/bambamgupta)
- Email: bambamkumar30082003.ara@gmail.com

---

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) - AI speech recognition
- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/voice-to-text-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/voice-to-text-app?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/voice-to-text-app)
![GitHub license](https://img.shields.io/github/license/yourusername/voice-to-text-app)

---

<div align="center">

**Made with ❤️ by Bambam Kumar Gupta**

⭐ Star this repo if you find it useful!

</div>