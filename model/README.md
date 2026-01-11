# DLEF Model - Training & Evaluation

Scripts for training and evaluating the **DeepLens Engine for Focus (DLEF)** attention classification model.

---

## 🧠 Model Architecture

| Attribute | Value |
|-----------|-------|
| Base Model | YOLOv11n-cls |
| Pretrained On | ImageNet (COCO weights) |
| Input Size | 224 × 224 pixels |
| Parameters | 2.6M |
| Output Classes | 6 |
| Framework | Ultralytics / PyTorch |

---

## 🏷️ Classification Classes

| Class | Priority | Description |
|-------|----------|-------------|
| Focused | Critical | User engaged with task |
| Phone | Critical | Using mobile device |
| Absent | Critical | Not present in frame |
| Drowsy | Secondary | Signs of fatigue |
| LookingAway | Secondary | Gaze diverted from screen |
| BadPosture | Secondary | Slouched, disengaged position |

---

## ⚙️ Training Configuration

| Parameter | Value |
|-----------|-------|
| Epochs | 50 |
| Batch Size | 32 |
| Optimizer | SGD |
| Momentum | 0.937 |
| Initial LR | 0.01 |
| LR Schedule | Cosine Annealing |
| Weight Decay | 5×10⁻⁴ |
| Label Smoothing | 0.1 |
| Early Stopping | Patience 10 |
| Hardware | Apple M1 CPU, 16GB RAM |

---

## 📁 Files
```
model/
├── README.md           # This file
├── train.py            # Training script
└── test.py             # Evaluation script
```

---

## 🚀 Training

### Prerequisites
```bash
pip install ultralytics>=8.1.0
```

### Run Training
```bash
cd model
python train.py
```

### Custom Training
```python
from ultralytics import YOLO

model = YOLO("yolo11n-cls.pt")

model.train(
    data="path/to/dataset/train",
    val=True,
    epochs=50,
    imgsz=224,
    batch=32,
    device="mps",  # "cuda" for NVIDIA, "cpu" for CPU
)
```

---

## 📊 Evaluation

### Run Evaluation
```bash
cd model
python test.py
```

### Custom Evaluation
```python
from ultralytics import YOLO

model = YOLO("../backend/best.pt")
metrics = model.val(data="path/to/dataset")
print(f"Accuracy: {metrics.top1}")
```

---

## 🎯 Results

### Overall Performance

| Metric | Value |
|--------|-------|
| **Overall Accuracy** | **94.76%** |
| Weighted Precision | 0.951 |
| Weighted Recall | 0.948 |
| Weighted F1-Score | 0.948 |

### Per-Class Performance

| Class | Precision | Recall | F1 | Accuracy |
|-------|-----------|--------|-----|----------|
| Focused | 0.854 | 1.000 | 0.921 | 100.00% |
| Phone | 1.000 | 1.000 | 1.000 | 100.00% |
| Absent | 1.000 | 1.000 | 1.000 | 100.00% |
| Drowsy | 0.917 | 0.943 | 0.930 | 94.29% |
| LookingAway | 0.970 | 0.914 | 0.941 | 91.43% |
| BadPosture | 0.967 | 0.829 | 0.893 | 82.86% |

### Key Observations

- ✅ **100% accuracy** on critical classes (Focused, Phone, Absent)
- ✅ **Zero false positives** for phone detection
- ⚠️ BadPosture has lowest accuracy (82.86%) due to visual similarity with Focused

---

## 🔬 Ablation Studies

### Impact of DLEF Layers

| Configuration | Accuracy | False Positive Rate |
|---------------|----------|---------------------|
| L1 Only (YOLOv11n-cls) | 94.76% | 8.3% |
| L1 + L2 (Auxiliary) | 96.12% | 4.1% |
| L1 + L2 + L3 (Temporal) | 96.1% | 2.3% |

### Temporal Heuristic (20/30 Rule)

| Metric | Without L3 | With L3 | Improvement |
|--------|------------|---------|-------------|
| False Positives/Hour | 15.4 | 4.2 | -73% |
| State Oscillations/Hour | 47.2 | 3.8 | -92% |

---

## ⚡ Inference Performance

| Component | Latency (ms) | % Total |
|-----------|--------------|---------|
| Frame Capture | 8.2 | 12.5% |
| Preprocessing | 4.1 | 6.3% |
| YOLOv11n-cls | 38.6 | 58.8% |
| MediaPipe | 11.3 | 17.2% |
| Post-processing | 3.4 | 5.2% |
| **Total** | **65.6** | 100% |

**Real-time Performance**: 15-18 FPS on Apple M1 CPU

---

## 📦 Pre-trained Weights

The trained model is available at:
```
backend/best.pt      # YOLOv11n-cls trained on DLEF dataset (3.2 MB)
backend/yolov8n.pt   # YOLOv8n for phone detection backup (6.5 MB)
```

### Load Pre-trained Model
```python
from ultralytics import YOLO

# Load DLEF classifier
model = YOLO("backend/best.pt")

# Inference
results = model("image.jpg")
pred_class = model.names[results[0].probs.top1]
confidence = float(results[0].probs.top1conf)

print(f"{pred_class}: {confidence:.2%}")
```

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CUDA out of memory | Reduce batch size or use CPU |
| Slow training on Mac | Use `device="mps"` for Apple Silicon |
| Import errors | Install: `pip install ultralytics scikit-learn` |
| Low accuracy | Check dataset balance, increase epochs |

---

## 📚 References

- [Ultralytics YOLOv11](https://docs.ultralytics.com/)
- [DLEF Paper](../docs/DLEF_Paper.pdf)
- [DeepWork AI Demo](https://youtu.be/Je0_qLxRbX8)

---

## 📧 Contact

- **Author**: Nafis Aslam
- **Email**: nafisaslam18@student.usm.my
- **GitHub**: [@NafisAslam70](https://github.com/NafisAslam70)