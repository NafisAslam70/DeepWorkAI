"""
================================================================================
DLEF Model Testing Script
DeepLens Engine for Focus - Validation Evaluation

Author: Nafis Aslam
Project: DeepWork AI
Institution: Universiti Sains Malaysia

Description:
    This script evaluates the trained YOLOv11n-cls model on the validation set
    and generates a detailed classification report.

Usage:
    python test.py

Output:
    - Console: Classification report with per-class metrics
    - File: test_report.txt (saved in current directory)
================================================================================
"""

import os
import warnings
from pathlib import Path
from collections import defaultdict
from datetime import datetime

from ultralytics import YOLO
from sklearn.metrics import classification_report, confusion_matrix


def test_model(
    model_path="../backend/best.pt",
    test_path="../dataset/val",
    save_report=True
):
    """
    Evaluate trained DLEF model on validation/test set.
    
    Args:
        model_path (str): Path to trained model weights (.pt file)
        test_path (str): Path to validation data with class subfolders
        save_report (bool): Whether to save report to file
    
    Returns:
        dict: Evaluation results including accuracy and per-class metrics
    """
    
    print("=" * 70)
    print("📊 DLEF - DeepLens Engine for Focus")
    print("   Model Evaluation Script")
    print("=" * 70)
    print(f"\n⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🧠 Model: {model_path}")
    print(f"📁 Test data: {test_path}")
    
    # Verify paths
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"❌ Model not found: {model_path}")
    if not os.path.exists(test_path):
        raise FileNotFoundError(f"❌ Test data not found: {test_path}")
    
    # Load model
    print("\n📦 Loading model...")
    model = YOLO(model_path)
    
    # Get class names from model
    class_names = list(model.names.values())
    print(f"🏷️  Classes: {class_names}")
    
    # Initialize tracking
    test_base = Path(test_path)
    y_true, y_pred, y_conf = [], [], []
    classwise_stats = defaultdict(lambda: {
        "total": 0, 
        "correct": 0, 
        "incorrect": 0,
        "confidences": []
    })
    
    # Count total images
    total_images = sum(
        len([f for f in os.listdir(test_base / cls) 
             if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        for cls in os.listdir(test_base) 
        if os.path.isdir(test_base / cls) and not cls.startswith('.')
    )
    print(f"🖼️  Total test images: {total_images}")
    
    # Prediction loop
    print("\n" + "-" * 70)
    print(f"{'Image':<45} | {'True':<12} | {'Pred':<12} | {'Conf':<6} | {'✓/✗'}")
    print("-" * 70)
    
    processed = 0
    for class_folder in sorted(test_base.iterdir()):
        if not class_folder.is_dir() or class_folder.name.startswith('.'):
            continue
        
        true_label = class_folder.name
        
        for img_file in sorted(class_folder.glob("*")):
            if img_file.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
                continue
            
            processed += 1
            classwise_stats[true_label]["total"] += 1
            
            # Run inference
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                results = model(str(img_file), verbose=False)
            
            probs = results[0].probs
            if probs is not None:
                pred_class_id = probs.top1
                confidence = float(probs.top1conf)
                pred_label = model.names[pred_class_id]
                
                y_true.append(true_label)
                y_pred.append(pred_label)
                y_conf.append(confidence)
                classwise_stats[true_label]["confidences"].append(confidence)
                
                # Check correctness
                is_correct = pred_label.lower() == true_label.lower()
                if is_correct:
                    classwise_stats[true_label]["correct"] += 1
                    status = "✅"
                else:
                    classwise_stats[true_label]["incorrect"] += 1
                    status = "❌"
                
                # Print result (truncate long filenames)
                fname = img_file.name[:42] + "..." if len(img_file.name) > 45 else img_file.name
                print(f"{fname:<45} | {true_label:<12} | {pred_label:<12} | {confidence:.2f}  | {status}")
            else:
                y_true.append(true_label)
                y_pred.append("None")
                y_conf.append(0.0)
                classwise_stats[true_label]["incorrect"] += 1
                print(f"{img_file.name:<45} | {true_label:<12} | {'None':<12} | 0.00  | ❌")
    
    print("-" * 70)
    
    # Calculate overall metrics
    total = sum(s["total"] for s in classwise_stats.values())
    correct = sum(s["correct"] for s in classwise_stats.values())
    incorrect = sum(s["incorrect"] for s in classwise_stats.values())
    accuracy = (correct / total * 100) if total else 0
    avg_confidence = sum(y_conf) / len(y_conf) if y_conf else 0
    
    # Print summary
    print("\n" + "=" * 70)
    print("📌 SUMMARY")
    print("=" * 70)
    print(f"   ✅ Correct Predictions:   {correct}")
    print(f"   ❌ Incorrect Predictions: {incorrect}")
    print(f"   🖼️  Total Images Tested:   {total}")
    print(f"   🎯 Overall Accuracy:      {accuracy:.2f}%")
    print(f"   📊 Average Confidence:    {avg_confidence:.2f}")
    
    # Class-wise accuracy table
    print("\n" + "-" * 70)
    print("📊 CLASS-WISE PERFORMANCE")
    print("-" * 70)
    print(f"{'Class':<15} | {'Total':<6} | {'Correct':<8} | {'Wrong':<6} | {'Accuracy':<10} | {'Avg Conf'}")
    print("-" * 70)
    
    for cls in sorted(classwise_stats.keys()):
        stats = classwise_stats[cls]
        cls_acc = (stats["correct"] / stats["total"] * 100) if stats["total"] else 0
        cls_conf = sum(stats["confidences"]) / len(stats["confidences"]) if stats["confidences"] else 0
        print(f"{cls:<15} | {stats['total']:<6} | {stats['correct']:<8} | {stats['incorrect']:<6} | {cls_acc:<9.2f}% | {cls_conf:.2f}")
    
    print("-" * 70)
    
    # Detailed classification report
    print("\n" + "=" * 70)
    print("📋 DETAILED CLASSIFICATION REPORT")
    print("=" * 70)
    
    # Normalize labels for sklearn
    y_true_lower = [y.lower() for y in y_true]
    y_pred_lower = [y.lower() for y in y_pred]
    
    report = classification_report(y_true_lower, y_pred_lower, digits=3, zero_division=0)
    print(report)
    
    # Confusion matrix
    print("\n" + "-" * 70)
    print("🔢 CONFUSION MATRIX")
    print("-" * 70)
    
    unique_labels = sorted(set(y_true_lower + y_pred_lower))
    cm = confusion_matrix(y_true_lower, y_pred_lower, labels=unique_labels)
    
    # Print header
    header = "Actual \\ Pred"
    print(f"{header:<15}", end="")
    for label in unique_labels:
        print(f"{label[:8]:<10}", end="")
    print()
    print("-" * (15 + 10 * len(unique_labels)))
    
    # Print matrix
    for i, label in enumerate(unique_labels):
        print(f"{label:<15}", end="")
        for j in range(len(unique_labels)):
            print(f"{cm[i][j]:<10}", end="")
        print()
    
    # Save report to file
    if save_report:
        report_path = "test_report.txt"
        with open(report_path, "w") as f:
            f.write("=" * 70 + "\n")
            f.write("DLEF - MODEL EVALUATION REPORT\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Model: {model_path}\n")
            f.write(f"Test Data: {test_path}\n")
            f.write(f"Total Images: {total}\n\n")
            
            f.write(f"OVERALL ACCURACY: {accuracy:.2f}%\n")
            f.write(f"Average Confidence: {avg_confidence:.2f}\n\n")
            
            f.write("-" * 70 + "\n")
            f.write("CLASS-WISE ACCURACY\n")
            f.write("-" * 70 + "\n")
            for cls in sorted(classwise_stats.keys()):
                stats = classwise_stats[cls]
                cls_acc = (stats["correct"] / stats["total"] * 100) if stats["total"] else 0
                f.write(f"{cls:<15}: {cls_acc:.2f}% ({stats['correct']}/{stats['total']})\n")
            
            f.write("\n" + "-" * 70 + "\n")
            f.write("CLASSIFICATION REPORT\n")
            f.write("-" * 70 + "\n")
            f.write(report)
        
        print(f"\n💾 Report saved to: {report_path}")
    
    print(f"\n⏰ Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Return results
    return {
        "accuracy": accuracy,
        "total": total,
        "correct": correct,
        "incorrect": incorrect,
        "avg_confidence": avg_confidence,
        "classwise_stats": dict(classwise_stats),
        "y_true": y_true,
        "y_pred": y_pred,
        "y_conf": y_conf
    }


def main():
    """Main entry point."""
    
    # === CONFIGURATION ===
    CONFIG = {
        "model_path": "../backend/best.pt",     # Path to trained model
        "test_path": "../dataset/val",          # Path to validation data
        "save_report": True,                     # Save report to file
    }
    
    try:
        results = test_model(**CONFIG)
        
        print("\n" + "=" * 70)
        print("🎉 Evaluation completed successfully!")
        print("=" * 70)
        print(f"\n🎯 Final Accuracy: {results['accuracy']:.2f}%")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("   Please check your file paths.")
        
    except Exception as e:
        print(f"\n❌ Evaluation failed: {e}")
        raise


if __name__ == "__main__":
    main()