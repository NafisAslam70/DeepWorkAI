# DeepWork AI 🎯

> **Your armor in a world built to distract.**

AI-powered productivity application with real-time focus monitoring using computer vision. Built as a Final Year Project at Universiti Sains Malaysia.

[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/Je0_qLxRbX8)
[![Live App](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)](https://deep-work-ai-nu.vercel.app)
[![Paper](https://img.shields.io/badge/Paper-arXiv-blue?style=for-the-badge)](docs/DLEF_Paper.pdf)

![DeepWork AI](logo4.png)

---

## 🌟 Features

- **🤖 Real-time Focus Detection** — YOLOv11n-cls model classifies 6 attention states
- **⏱️ Pomodoro Sessions** — 45-min work / 15-min break cycles with goal linking
- **📊 Analytics Dashboard** — Track focus percentage, distraction breakdown, trends
- **🎯 Goal Management** — Create, track, and link goals to study sessions
- **🔒 Privacy-First** — All AI processing happens on-device, no video uploaded
- **💡 Smart Nudges** — Context-aware reminders to refocus when distracted

---

## 🧠 The DLEF Framework

**DeepLens Engine for Focus (DLEF)** — A novel 4-layer attention detection architecture:
```
Webcam Frame → [L1: Classification] → [L2: Validation] → [L3: Temporal] → [L4: Response]
```

| Layer | Component | Purpose |
|-------|-----------|---------|
| **L1** | YOLOv11n-cls | Primary 6-class classification (94.76% accuracy) |
| **L2** | MediaPipe + YOLOv8n | Gaze estimation, EAR analysis, phone validation |
| **L3** | 20/30 Rule | Temporal heuristic — confirms sustained distraction |
| **L4** | Nudge System | Context-aware intervention messages |

### Attention States

| State | Description | Priority |
|-------|-------------|----------|
| Focused | Eyes on task, engaged posture | ✅ Productive |
| Phone | Using mobile device | 🔴 Critical |
| Absent | Not present in frame | 🔴 Critical |
| Drowsy | Signs of fatigue (EAR < 0.25) | 🟡 Secondary |
| LookingAway | Gaze diverted > 45° | 🟡 Secondary |
| BadPosture | Slouched, disengaged | 🟡 Secondary |

---

## 📊 Model Performance

| Class | Precision | Recall | Accuracy |
|-------|-----------|--------|----------|
| Focused | 0.854 | 1.000 | 100.00% |
| Phone | 1.000 | 1.000 | 100.00% |
| Absent | 1.000 | 1.000 | 100.00% |
| Drowsy | 0.917 | 0.943 | 94.29% |
| LookingAway | 0.970 | 0.914 | 91.43% |
| BadPosture | 0.967 | 0.829 | 82.86% |
| **Overall** | **0.951** | **0.948** | **94.76%** |

> 📝 **Note**: Evaluated on 210 held-out validation images (35 per class, non-augmented).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| **Backend** | Flask 3.0, Python 3.11, Gunicorn |
| **Database** | PostgreSQL 15 (Neon), Drizzle ORM |
| **Auth** | Clerk (OAuth 2.0, JWT) |
| **AI/ML** | YOLOv11n-cls, YOLOv8n, MediaPipe, OpenCV, PyTorch |

---

## 📁 Project Structure
```
DeepWorkAI/
├── app/                    # Next.js pages and routes
├── components/             # React components
├── lib/                    # Database schemas (Drizzle)
├── public/                 # Static assets
├── utils/                  # Helper functions
│
├── backend/                # Flask API + DLEF Engine
│   ├── app.py              # Main Flask server
│   ├── absence_model.py    # L2: Absence detection
│   ├── cellphone_model.py  # L2: Phone detection
│   ├── best.pt             # Trained YOLOv11n-cls (3.2 MB)
│   ├── yolov8n.pt          # Phone detector backup (6.5 MB)
│   └── requirements.txt    # Python dependencies
│
├── model/                  # Training & Evaluation Scripts
│   ├── train.py            # Model training script
│   ├── test.py             # Evaluation script
│   └── README.md           # Model documentation
│
├── dataset_sample/         # Sample dataset for reproducibility
│   ├── train/              # 8 images per class
│   ├── val/                # 5 images per class
│   └── README.md           # Dataset documentation
│
└── docs/                   # Documentation
    └── DLEF_Paper.pdf      # Research paper
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Webcam

### 1️⃣ Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 2️⃣ Backend Setup
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

### 3️⃣ Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser.

> ⚠️ **Note**: The AI model requires the local Flask backend to be running for real-time focus detection.

---

## 🎬 Demo

**Full Video Demonstration**: [https://youtu.be/Je0_qLxRbX8](https://youtu.be/Je0_qLxRbX8) (system demo at 10:01)

The demo showcases:
- Goal creation and session configuration
- Real-time focus detection in action
- Nudging mechanism for phone use and absence
- Session termination protocols
- Analytics dashboard with focus trends

---

## 📚 Research Paper

This project is accompanied by a research paper:

**"DeepLens Engine for Focus: A Multi-Layered Framework for Real-Time Attention Monitoring in Productivity Environments"**

The paper details:
- Formal definitions for 6 attention states
- DLEF 4-layer architecture
- 20/30 temporal heuristic rule
- Experimental evaluation and ablation studies
- Ethical considerations and limitations

📄 [Read the Paper](docs/DLEF_Paper.pdf)

---

## 🔬 Training Your Own Model
```bash
cd model

# Train on your dataset
python train.py

# Evaluate on validation set
python test.py
```

See [`model/README.md`](model/README.md) for detailed instructions.

---

## 📊 Dataset

A sample of the training dataset is provided for reproducibility:
```
dataset_sample/
├── train/    (48 images - 8 per class)
└── val/      (30 images - 5 per class)
```

See [`dataset_sample/README.md`](dataset_sample/README.md) for details.

**Full Dataset**: 1,080 base images → ~3,000 after augmentation

---

## 🔒 Privacy

DeepWork AI is designed with privacy as a core principle:

- ✅ **On-device processing** — No video frames sent to external servers
- ✅ **No video storage** — Only derived metrics (focus %, distraction counts) are saved
- ✅ **User control** — Camera access revocable anytime
- ✅ **Transparency** — Visual indicator shows when monitoring is active

---

## 🏆 Acknowledgments

- **Supervisor**: Dr. Tan Tien Ping, School of Computer Sciences, USM
- **Institution**: Universiti Sains Malaysia
- **Course**: CAT405 Final Year Project (2024/2025)

---

## 📖 Citation

If you use this work in your research, please cite:
```bibtex
@misc{aslam2025dlef,
  author       = {Aslam, Nafis},
  title        = {DeepLens Engine for Focus: A Multi-Layered Framework for 
                  Real-Time Attention Monitoring in Productivity Environments},
  year         = {2025},
  publisher    = {GitHub},
  url          = {https://github.com/NafisAslam70/DeepWorkAI}
}
```

---

## 📧 Contact

**Nafis Aslam**  
School of Computer Sciences, Universiti Sains Malaysia  
📧 nafisaslam18@student.usm.my  
🔗 [GitHub](https://github.com/NafisAslam70)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Stay focused. Achieve your goals. 🎯</b>
</p>