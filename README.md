# Yoga Routine

A Vue 3 web application for building and following custom yoga routines with a countdown timer and audio cues.

## Features

- Browse and search a library of yoga poses
- Build custom routines by adding and reordering poses
- Set individual durations for each pose
- Full-screen countdown timer with circular progress indicator
- Audio cues: countdown beeps at 3, 2, 1 seconds, transition beep between poses, completion chime
- Big, touch-friendly start/pause/resume/stop controls
- Routine persistence in browser localStorage
- Drag-and-drop reordering of poses

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript**
- **Vite** for build tooling
- **Web Audio API** for sound generation (no external audio files needed)

## Project Structure

```
├── public/
│   └── exercises.json          # Editable pose library
├── src/
│   ├── components/
│   │   ├── ExerciseList.vue   # Browse/search poses, add to routine
│   │   ├── RoutineBuilder.vue # Reorder, set durations, remove poses
│   │   ├── TimerDisplay.vue   # Countdown ring, pose info, progress
│   │   └── TimerControls.vue  # Start/pause/resume/stop buttons
│   ├── composables/
│   │   ├── useYogaRoutine.ts  # Core state, timer logic, localStorage
│   │   └── useSound.ts        # Web Audio API beep/chime generation
│   ├── App.vue                # Layout and composition
│   ├── main.ts                # Entry point
│   └── style.css              # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

```bash
npm install
npm run dev
```

Open the printed localhost URL in your browser.

## Building for Production

```bash
npm run build
npm run preview
```

## Adding/Editing Poses

Edit `public/exercises.json`. Each pose has:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `name` | Display name |
| `sanskrit` | Sanskrit name |
| `description` | Short instructions |
| `category` | e.g. standing, restorative, backbend |
| `difficulty` | beginner / intermediate / advanced |
| `defaultDuration` | Default hold time in seconds |
| `image` | Path to pose illustration, e.g. `/images/mountain-pose.svg` |

## Pose Photos

Each pose shows a realistic photo hotlinked from
[Wikimedia Commons](https://commons.wikimedia.org) (CC BY-SA, resized to
800px via `Special:FilePath`). If a photo fails to load (e.g. offline), the
app falls back to the local SVG illustration in `public/images/<pose-id>.svg`,
then to an initials avatar. The local SVGs also keep the app usable offline.

| Pose(s) | Commons file |
|---------|--------------|
| Mountain Pose | `Tadasana yoga pose.jpg` |
| Downward Facing Dog | `Downward Dog Pose (Doga).jpg` |
| Warrior I | `Virabhadrasana I - Warrior Pose I.jpg` |
| Warrior II | `Virabhadrasana II - Warrior II Pose.jpg` |
| Tree Pose | `Vriksasana Yoga-Asana Nina-Mel.jpg` |
| Triangle Pose | `Trikonasana Yoga-Asana Nina-Mel.jpg` |
| Child's Pose | `Balasana.JPG` |
| Cat-Cow | `Yoga at Your Park - Bidalasana.jpg` |
| Cobra Pose | `Bhujangasana Yoga-Asana Nina-Mel.jpg` |
| Bridge Pose | `Setubandhasana oblique view.JPG` |
| Seated Forward Fold | `Paschimottanasana.jpg` |
| Corpse Pose | `Shavasana.jpg` |
| Hiperflexion (L/R) | `Utthita-Hasta-Padangusthasana Yoga-Asana Nina-Mel.jpg` (standing big-toe hold — same leg-up shape as the supine stretch) |
| Greatest Stretch (L/R) | `Parivrtta-Trikonasana Yoga-Asana Nina-Mel.jpg` (revolved triangle — same lunge-and-twist shape) |
| Plunge Hamstring (L/R) | `Hanumanasana - Monkey Pose - Side view.jpg` (full split — shows the hamstring line) |
| Quad Stretch (L/R) | `Supta-Virasana Yoga-Asana Nina-Mel.jpg` |

## Notes for Future Developers

- **State management**: All routine state lives in `useYogaRoutine.ts`. Components receive data via props and emit events up. No Pinia needed at this scale.
- **Timer**: Uses `setInterval` with a shared `tick()` function. Be careful to clear intervals in `cleanup()` to avoid memory leaks.
- **Audio**: Sounds are generated via Web Audio API oscillators. The AudioContext must be resumed after a user gesture (handled by `resumeContext()` in `startTimer`/`resumeTimer`).
- **localStorage**: Routine is auto-saved on every mutation via a deep watcher. The key is `yoga-routine`.
- **Accessibility**: Buttons are large and high-contrast. Consider adding ARIA live regions for timer announcements if needed.
- **Testing**: No test suite yet. Vitest + Vue Test Utils would fit naturally.
