# DLEF Dataset Sample

Representative sample of the dataset used to train the **DeepLens Engine for Focus (DLEF)** attention classification model.

---

## 📊 Full Dataset Statistics

| Attribute | Value |
|-----------|-------|
| Base Images | 1,080 (180 per class) |
| Augmented Training | ~3,000 |
| Validation Set | 210 (35 per class, non-augmented) |
| Classes | 6 |
| Subject | Single participant |
| Camera | MacBook Pro FaceTime HD (1080p) |
| Distance | 50-70 cm from screen |
| Environments | Home office, library, varied lighting |

---

## 🏷️ Classes

| Class | Symbol | Description | Observable Criteria |
|-------|--------|-------------|---------------------|
| Focused | $S_F$ | Engaged with task | Eyes on screen, upright posture, engaged expression |
| Phone | $S_{Ph}$ | Using mobile device | Holding/interacting with phone |
| Absent | $S_{Ab}$ | Not in frame | No person detected in camera view |
| Drowsy | $S_{Dr}$ | Signs of fatigue | EAR < 0.25, heavy eyelids, head drooping |
| LookingAway | $S_{LA}$ | Gaze diverted | Head/eyes turned > 45° from screen |
| BadPosture | $S_{BP}$ | Slouched position | Disengaged body language while present |

---

## 📁 Sample Contents
```
dataset_sample/
├── README.md
├── train/                  (8 images per class = 48 total)
│   ├── Focused/
│   ├── Phone/
│   ├── Absent/
│   ├── Drowsy/
│   ├── LookingAway/
│   └── BadPosture/
└── val/                    (5 images per class = 30 total)
    ├── Focused/
    ├── Phone/
    ├── Absent/
    ├── Drowsy/
    ├── LookingAway/
    └── BadPosture/
```

---

## 🔄 Data Augmentation Pipeline

Training data was augmented using [Albumentations](https://albumentations.ai/) library:

| Round | Type | Transforms |
|-------|------|------------|
| 1 | Geometric | Horizontal flip (p=0.5), Rotation ±15° (p=0.3), Motion blur (p=0.2) |
| 2 | Photometric | CLAHE (p=0.3), Brightness/contrast (p=0.4), Grid shuffle (p=0.1) |
| 3 | Realistic | Shadow injection (p=0.2), Hue shift (p=0.3), Coarse dropout (p=0.2) |
| 4 | Noise | ISO noise (p=0.2), Channel shuffle (p=0.1), Random crop/resize (p=0.3) |

**Note**: Validation images are **non-augmented** (original captures) to ensure fair evaluation.

---

## 🎯 Model Performance

| Class | Precision | Recall | F1-Score | Accuracy |
|-------|-----------|--------|----------|----------|
| Focused | 0.854 | 1.000 | 0.921 | 100.00% |
| Phone | 1.000 | 1.000 | 1.000 | 100.00% |
| Absent | 1.000 | 1.000 | 1.000 | 100.00% |
| Drowsy | 0.917 | 0.943 | 0.930 | 94.29% |
| LookingAway | 0.970 | 0.914 | 0.941 | 91.43% |
| BadPosture | 0.967 | 0.829 | 0.893 | 82.86% |
| **Overall** | **0.951** | **0.948** | **0.948** | **94.76%** |

---

## 🚀 Usage
```python
from ultralytics import YOLO

# Load trained model
model = YOLO("backend/best.pt")

# Test on a sample image
results = model("dataset_sample/val/Focused/sample.jpg")

# Get prediction
pred_class = model.names[results[0].probs.top1]
confidence = results[0].probs.top1conf

print(f"Predicted: {pred_class} ({confidence:.2f})")
```

---

## ⚠️ Important Notes

1. **Sample Subset**: This is a representative sample for demonstration and reproducibility purposes.

2. **Privacy**: Single-subject dataset collected under controlled conditions. Full dataset available upon request for legitimate research purposes.

3. **Validation Integrity**: Validation images were kept completely separate and non-augmented to ensure evaluation reflects real-world performance.

4. **Naming Convention**:
   - Original images: `ClassName.uuid.jpg`
   - Augmented images: `ClassName.uuid_aug1.jpg`, `_aug2.jpg`, etc.

---

## 📚 Citation

If you use this dataset in your research, please cite:
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

For full dataset access or research collaboration:

- **Author**: Nafis Aslam
- **Email**: nafisaslam18@student.usm.my
- **Institution**: Universiti Sains Malaysia

---

## 📄 License

This dataset sample is provided for academic and research purposes only. Commercial use requires explicit permission from the author.