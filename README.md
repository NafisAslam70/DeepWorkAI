# DeepWork AI 🎯

> **Your armor in a world built to distract.**

AI-powered productivity application with real-time focus monitoring using computer vision. Built as a Final Year Project at Universiti Sains Malaysia.

![DeepWork AI](logo2.jpg)

## 🌟 Features

- **🤖 Real-time Focus Detection** - YOLOv11n-cls model classifies 6 attention states
- **⏱️ Pomodoro Sessions** - 45-min work / 15-min break cycles with goal linking
- **📊 Analytics Dashboard** - Track focus percentage, distraction breakdown, trends
- **🎯 Goal Management** - Create, track, and link goals to study sessions
- **🔒 Privacy-First** - All AI processing happens on-device, no video uploaded

## 🧠 The DLEF Framework

**DeepLens Engine for Focus** - A 4-layer attention detection architecture:

```
Webcam → [L1: YOLOv11n-cls] → [L2: Gaze + EAR Validation] → [L3: 20/30 Rule] → [L4: Nudge]
```

| Layer | Component | Purpose |
|-------|-----------|---------|
| L1 | YOLOv11n-cls | Primary 6-class classification |
| L2 | MediaPipe | Gaze estimation + Eye Aspect Ratio |
| L3 | Temporal Heuristic | 20/30 rule - confirms sustained distraction |
| L4 | Response | Context-aware nudge messages |

## 📊 Model Performance

| Class | Accuracy | Priority |
|-------|----------|----------|
| Focused | 100% | Critical |
| Phone Usage | 100% | Critical |
| Absent | 100% | Critical |
| Drowsy | 94.3% | Secondary |
| Looking Away | 91.4% | Secondary |
| Bad Posture | 82.9% | Secondary |
| **Overall** | **94.76%** | - |

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (React)
- Tailwind CSS
- Framer Motion
- Clerk Authentication

**Backend:**
- Flask (Python)
- PostgreSQL (Neon)
- Drizzle ORM

**AI/ML:**
- YOLOv11n-cls (Ultralytics)
- MediaPipe Face Mesh
- OpenCV

## 📁 Project Structure

```
deepwork-ai/
├── app/                 # Next.js pages and routes
├── backend/             # Flask API + DLEF model
│   ├── model/          # Trained YOLOv11 weights
│   ├── app.py          # Flask server
│   └── dlef.py         # Focus detection engine
├── components/          # React components
├── lib/                 # Database schemas
├── public/              # Static assets
└── utils/               # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Webcam

### Frontend Setup
# DeepWork AI 🎯

> **Your armor in a world built to distract.**

AI-powered productivity application with real-time focus monitoring using computer vision. Built as a Final Year Project at Universiti Sains Malaysia that won Gold.

![DeepWork AI](logo4.png)

## 🌟 Features

- **🤖 Real-time Focus Detection** - YOLOv11n-cls model classifies 6 attention states
- **⏱️ Pomodoro Sessions** - 45-min work / 15-min break cycles with goal linking
- **📊 Analytics Dashboard** - Track focus percentage, distraction breakdown, trends
- **🎯 Goal Management** - Create, track, and link goals to study sessions
- **🔒 Privacy-First** - All AI processing happens on-device, no video uploaded

## 🧠 The DLEF Framework

**DeepLens Engine for Focus** - A 4-layer attention detection architecture:

```
Webcam → [L1: YOLOv11n-cls] → [L2: Gaze + EAR Validation] → [L3: 20/30 Rule] → [L4: Nudge]
```

| Layer | Component | Purpose |
|-------|-----------|---------|
| L1 | YOLOv11n-cls | Primary 6-class classification |
| L2 | MediaPipe | Gaze estimation + Eye Aspect Ratio |
| L3 | Temporal Heuristic | 20/30 rule - confirms sustained distraction |
| L4 | Response | Context-aware nudge messages |

## 📊 Model Performance

| Class | Accuracy | Priority |
|-------|----------|----------|
| Focused | 100% | Critical |
| Phone Usage | 100% | Critical |
| Absent | 100% | Critical |
| Drowsy | 94.3% | Secondary |
| Looking Away | 91.4% | Secondary |
| Bad Posture | 82.9% | Secondary |
| **Overall** | **94.76%** | - |

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (React)
- Tailwind CSS
- Framer Motion
- Clerk Authentication

**Backend:**
- Flask (Python)
- PostgreSQL (Neon)
- Drizzle ORM

**AI/ML:**
- YOLOv11n-cls (Ultralytics)
- MediaPipe Face Mesh
- OpenCV

## 📁 Project Structure

```
deepwork-ai/
├── app/                 # Next.js pages and routes
├── backend/             # Flask API + DLEF model
│   ├── model/          # Trained YOLOv11 weights
│   ├── app.py          # Flask server
│   └── dlef.py         # Focus detection engine
├── components/          # React components
├── lib/                 # Database schemas
├── public/              # Static assets
└── utils/               # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Webcam

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
