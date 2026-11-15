# DeepWork AI

AI-assisted productivity app that helps users stay focused during work sessions. It combines a Pomodoro-style timer and goal tracking with webcam-based attention signals, then summarizes focus patterns in an analytics dashboard.

## Highlights
- Focus sessions with configurable work and break cycles
- Goal creation and linking goals to sessions
- Real-time attention classification across six states
- Focus and distraction summaries with trends
- Context-aware prompts when distraction is detected
- Webcam inference is designed to run locally; video is not uploaded

## How it works
The DeepLens Engine for Focus (DLEF) combines a YOLO classification model with gaze, presence, and temporal checks before deciding whether a focus nudge is appropriate. The README reports 94.76% accuracy on a held-out set of 210 validation images; this is a same-subject validation result and should be interpreted in that scope.

## Tech
Next.js, React, Tailwind CSS, Flask, Python, PostgreSQL, Drizzle ORM, Clerk, YOLO, MediaPipe, OpenCV, and PyTorch.

## Links
- [Live app](https://deep-work-ai-nu.vercel.app)
- [Demo video](https://youtu.be/Je0_qLxRbX8)
- [Research preprint](https://doi.org/10.5281/zenodo.19266394)

## Run locally
Requirements: Node.js 18+, Python 3.10+, and a webcam.

```bash
npm install
npm run dev
```

In another terminal:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Open http://localhost:3000. The local Flask service is needed for live focus detection.

## Research
See the [preprint](https://doi.org/10.5281/zenodo.19266394) for the DLEF architecture, evaluation, ablation studies, and limitations.
