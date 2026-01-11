"""
================================================================================
DLEF Model Training Script
DeepLens Engine for Focus - YOLOv11n-cls Training

Author: Nafis Aslam
Project: DeepWork AI
Institution: Universiti Sains Malaysia

Description:
    This script trains a YOLOv11n-cls model for 6-class attention state
    classification: Focused, Phone, Absent, Drowsy, LookingAway, BadPosture.

Usage:
    python train.py

Output:
    Trained model saved to: runs/classify/train/weights/best.pt
================================================================================
"""

from ultralytics import YOLO
import os
from datetime import datetime


def train_model(
    data_path="../dataset/train",
    epochs=50,
    batch_size=32,
    img_size=224,
    device="cpu"
):
    """
    Train YOLOv11n-cls on DLEF focus detection dataset.
    
    Args:
        data_path (str): Path to training data folder with class subfolders
        epochs (int): Number of training epochs
        batch_size (int): Batch size for training
        img_size (int): Input image size (square)
        device (str): Device to use - "cpu", "cuda", or "mps" (Apple Silicon)
    
    Returns:
        results: Training results object
    """
    
    print("=" * 70)
    print("🧠 DLEF - DeepLens Engine for Focus")
    print("   Model Training Script")
    print("=" * 70)
    print(f"\n⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Data path: {data_path}")
    print(f"🔧 Device: {device}")
    print(f"📊 Epochs: {epochs} | Batch: {batch_size} | Image size: {img_size}")
    
    # Verify data path exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"❌ Data path not found: {data_path}")
    
    # List classes
    classes = [d for d in os.listdir(data_path) 
               if os.path.isdir(os.path.join(data_path, d)) and not d.startswith('.')]
    print(f"🏷️  Classes found: {classes}")
    
    # Count images per class
    print("\n📊 Dataset composition:")
    total_images = 0
    for cls in sorted(classes):
        cls_path = os.path.join(data_path, cls)
        n_images = len([f for f in os.listdir(cls_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        total_images += n_images
        print(f"   {cls:<15} {n_images:>5} images")
    print(f"   {'TOTAL':<15} {total_images:>5} images")
    
    # Load YOLOv11n classification model (pretrained on ImageNet)
    print("\n📦 Loading YOLOv11n-cls model (pretrained)...")
    model = YOLO("yolo11n-cls.pt")
    
    # Train
    print("\n🚀 Starting training...\n")
    print("-" * 70)
    
    results = model.train(
        data=data_path,
        val=True,                      # Enable validation
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        device=device,
        
        # Optimizer settings
        optimizer="SGD",
        lr0=0.01,                      # Initial learning rate
        lrf=0.01,                      # Final learning rate (for cosine annealing)
        momentum=0.937,
        weight_decay=0.0005,
        
        # Regularization
        label_smoothing=0.1,
        
        # Early stopping
        patience=10,
        
        # Augmentation (built-in)
        hsv_h=0.015,                   # Hue augmentation
        hsv_s=0.7,                     # Saturation augmentation
        hsv_v=0.4,                     # Value augmentation
        degrees=15.0,                  # Rotation
        translate=0.1,                 # Translation
        scale=0.5,                     # Scale
        fliplr=0.5,                    # Horizontal flip
        
        # Output
        project="runs/classify",
        name="dlef_train",
        exist_ok=True,
        verbose=True,
    )
    
    print("-" * 70)
    print("\n✅ Training complete!")
    print(f"⏰ Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n📁 Model saved to: runs/classify/dlef_train/weights/best.pt")
    print(f"📊 Logs saved to: runs/classify/dlef_train/")
    
    return results


def main():
    """Main entry point."""
    
    # === CONFIGURATION ===
    # Adjust these based on your setup
    
    CONFIG = {
        "data_path": "../dataset/train",    # Path to training data
        "epochs": 50,                        # Training epochs
        "batch_size": 32,                    # Batch size (reduce if OOM)
        "img_size": 224,                     # Input image size
        "device": "cpu",                     # "cpu", "cuda", or "mps"
    }
    
    # For Apple Silicon Mac, use:
    # CONFIG["device"] = "mps"
    
    # For NVIDIA GPU, use:
    # CONFIG["device"] = "cuda"
    
    try:
        results = train_model(**CONFIG)
        print("\n🎉 Training completed successfully!")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("   Please check your data path.")
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        raise


if __name__ == "__main__":
    main()