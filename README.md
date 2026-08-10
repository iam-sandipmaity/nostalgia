# SHONA DIN (সোনা দিন) 📻

> *"Gaan noy, smriti shuni." (Gaan Noy, Smriti Shuni)*

**SHONA DIN** is a vintage-inspired web application designed to trigger warm, nostalgic memories through curated Bengali music playlists and interactive Web Audio soundscapes. Styled after classic analog cassette tape decks, radio dials, and paper textures of Bengal's bygone era.

---

## ✨ Features

- 📼 **Interactive Analog Cassette Deck**
  - Animated spinning tape reels during playback.
  - Interactive track controls: Play, Pause, Next, Previous, and Click-to-Seek progress bar.
  - Live YouTube Metadata fetching for real-time song title & artist display on the LCD screen.
  - Analog rotary dials for Volume and Tone control.

- 🎵 **8 Curated Memory Playlists**
  - 🌧️ **Brishtir Shondhya (বৃষ্টির সন্ধ্যা)** – Rainy evening warmth & romantic melodies.
  - 🎡 **Melar Shondhya (মেলার সন্ধ্যা)** – Joyful fair atmosphere, Bengali folk & classics.
  - 💍 **Biye Bari (বিয়ে বাড়ি)** – Shehnai, wedding traditions & family celebrations.
  - 🚌 **Bus Journey (বাস জার্নি)** – Golden window-seat travel melodies.
  - ☕ **Cha-er Dokan (চায়ের দোকান)** – Evening adda songs featuring Manna Dey, Kabir Suman & Anjan Dutt.
  - 📻 **Dadu-r Radio (দাদুর রেডিও)** – Classic Akashbani radio morning melodies.
  - 🎸 **Old Bengali Remake (পুরোনো গান রিমেক)** – Timeless Bengali retro hits reimagined.
  - 🪁 **Chhotobelar Din (ছোটবেলার দিন)** – Innocent Sunday childhood memories.

- 🔊 **Synthesized Ambient Audio Engine**
  - Built-in Web Audio API synthesizer generating background vinyl hiss, radio static, rain soundscapes, and travel rhythms.

- 🎨 **Retro Aesthetics & Design**
  - Warm paper-white palette (`#faf6e9`), dark brown typography (`#3e2723`), noise overlay, glass highlights, and framer-motion page transitions.
  - Custom SVG cassette tape favicon.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio & Media:** YouTube IFrame Player API & Web Audio API

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone git@github.com:iam-sandipmaity/nostalgia.git
   cd nostalgia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
nostalgic/
├── public/
│   └── favicon.svg           # Retro cassette tape SVG favicon
├── src/
│   ├── components/
│   │   ├── CassettePlayer.tsx # Cassette deck UI & playback controls
│   │   ├── MemoryCard.tsx     # Memory selection card component
│   │   └── YouTubeDriver.tsx  # Off-screen YouTube IFrame API driver
│   ├── data/
│   │   └── songs.ts           # Memory playlist configurations & links
│   ├── utils/
│   │   └── ambientAudio.ts    # Web Audio API background soundscape engine
│   ├── App.tsx                # Main layout & memory state
│   ├── index.css              # Custom styling & font utilities
│   └── main.tsx               # App entrypoint
├── index.html
├── package.json
└── vite.config.ts
```
