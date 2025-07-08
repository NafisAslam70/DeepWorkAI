import json
from datetime import datetime, timedelta
import random

# List of possible distraction reasons
DISTRACTION_REASONS = ["Using Phone", "Looking Away", "Drowsy", "Restless", "Bored"]

# Function to generate focus log with distraction reasons
def generate_focus_log(start_time):
    log_entries = []
    current_time = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S")

    for i in range(2400):  # 40 minutes = 2400 seconds
        state = "Focused" if i % 10 != 0 else "Distracted"  # Distracted every 10 sec
        confidence = round(0.8 + (i % 5) * 0.02, 2)  # Confidence variation
        reason = random.choice(DISTRACTION_REASONS) if state == "Distracted" else None

        log_entry = {
            "timestamp": current_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "state": state,
            "confidence": confidence
        }
        if reason:
            log_entry["reason"] = reason  # Add reason if distracted

        log_entries.append(log_entry)
        current_time += timedelta(seconds=1)

    return log_entries

# Generate focus logs for two example sessions
session_1_focus_log = generate_focus_log("2024-03-15T10:00:00")
session_2_focus_log = generate_focus_log("2024-03-15T12:00:00")

# Save logs to JSON files
with open("session_1_focus_log.json", "w") as f:
    json.dump(session_1_focus_log, f, indent=4)

with open("session_2_focus_log.json", "w") as f:
    json.dump(session_2_focus_log, f, indent=4)

print("Focus logs with distraction reasons saved as JSON files ✅")
